import { NextResponse } from "next/server";

// Scoring system
const SCORES = {
  PR_OPENED: 5,
  PR_MERGED: 10,
  ISSUE_OPENED: 2,
};

// Types
interface GitHubUser {
  login: string;
  avatar_url: string;
}

interface PullRequest {
  user: GitHubUser;
  created_at: string;
  merged_at: string | null;
}

interface Issue {
  user: GitHubUser;
  created_at: string;
  pull_request?: object;
}

interface ContributorStats {
  username: string;
  avatar: string;
  prOpened: number;
  prMerged: number;
  issuesOpened: number;
  score: number;
}

interface LeaderboardResponse {
  success: boolean;
  repo?: {
    owner: string;
    name: string;
  };
  data?: ContributorStats[];
  error?: string;
}

/**
 * Fetch data from GitHub API with authentication
 */
async function fetchGitHubAPI(url: string): Promise<unknown[]> {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    throw new Error("GITHUB_TOKEN environment variable is not set");
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `GitHub API error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

/**
 * Parse excluded usernames from environment variable
 */
function getExcludedUsers(): Set<string> {
  const excludedVar = process.env.GITHUB_EXCLUDED_USERS;

  if (!excludedVar || excludedVar.trim() === "") {
    return new Set();
  }

  return new Set(
    excludedVar
      .split(",")
      .map((user) => user.trim().toLowerCase())
      .filter((user) => user.length > 0)
  );
}

/**
 * Check if username is excluded
 */
function isExcludedUser(username: string, excludedUsers: Set<string>): boolean {
  return excludedUsers.has(username.toLowerCase());
}

/**
 * Check if username is a bot
 */
function isBot(username: string): boolean {
  return username.toLowerCase().includes("bot");
}

/**
 * Check if item was created within last 30 days
 */
function isWithinLast30Days(createdAt: string): boolean {
  const itemDate = new Date(createdAt);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return itemDate >= thirtyDaysAgo;
}

/**
 * Calculate score for a contributor
 */
function calculateScore(stats: ContributorStats): number {
  return (
    stats.prOpened * SCORES.PR_OPENED +
    stats.prMerged * SCORES.PR_MERGED +
    stats.issuesOpened * SCORES.ISSUE_OPENED
  );
}

export async function GET(): Promise<NextResponse<LeaderboardResponse>> {
  try {
    // Read repository configuration from environment variables
    const REPO_OWNER = process.env.GITHUB_REPO_OWNER;
    const REPO_NAME = process.env.GITHUB_REPO_NAME;

    // Validate required environment variables
    if (!REPO_OWNER || !REPO_NAME) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required environment variables: GITHUB_REPO_OWNER and GITHUB_REPO_NAME",
        },
        { status: 400 }
      );
    }

    // Get excluded users
    const excludedUsers = getExcludedUsers();

    // Fetch PRs and Issues in parallel
    const prUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/pulls?state=all&per_page=100`;
    const issueUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues?state=all&per_page=100`;

    const [prsData, issuesData] = await Promise.all([
      fetchGitHubAPI(prUrl),
      fetchGitHubAPI(issueUrl),
    ]);

    const prs = prsData as PullRequest[];
    const issues = issuesData as Issue[];

    // Aggregate contributor stats
    const contributorMap = new Map<string, ContributorStats>();

    // Process Pull Requests
    for (const pr of prs) {
      const username = pr.user.login;

      // Skip bots
      if (isBot(username)) continue;

      // Skip excluded users
      if (isExcludedUser(username, excludedUsers)) continue;

      // Skip if not within last 30 days
      if (!isWithinLast30Days(pr.created_at)) continue;

      // Initialize contributor if not exists
      if (!contributorMap.has(username)) {
        contributorMap.set(username, {
          username,
          avatar: pr.user.avatar_url,
          prOpened: 0,
          prMerged: 0,
          issuesOpened: 0,
          score: 0,
        });
      }

      const contributor = contributorMap.get(username)!;
      contributor.prOpened += 1;

      // Count PR as merged if it was actually merged
      if (pr.merged_at) {
        contributor.prMerged += 1;
      }
    }

    // Process Issues (filter out PRs)
    for (const issue of issues) {
      const username = issue.user.login;

      // Skip bots
      if (isBot(username)) continue;

      // Skip excluded users
      if (isExcludedUser(username, excludedUsers)) continue;

      // Skip if not within last 30 days
      if (!isWithinLast30Days(issue.created_at)) continue;

      // Skip pull requests (Issues API includes them)
      if (issue.pull_request) continue;

      // Initialize contributor if not exists
      if (!contributorMap.has(username)) {
        contributorMap.set(username, {
          username,
          avatar: issue.user.avatar_url,
          prOpened: 0,
          prMerged: 0,
          issuesOpened: 0,
          score: 0,
        });
      }

      const contributor = contributorMap.get(username)!;
      contributor.issuesOpened += 1;
    }

    // Calculate scores and build leaderboard
    const leaderboard: ContributorStats[] = Array.from(contributorMap.values())
      .map((contributor) => ({
        ...contributor,
        score: calculateScore(contributor),
      }))
      // Filter out excluded users
      .filter((contributor) => !isExcludedUser(contributor.username, excludedUsers))
      // Sort by score (descending)
      .sort((a, b) => b.score - a.score);

    return NextResponse.json(
      {
        success: true,
        repo: {
          owner: REPO_OWNER,
          name: REPO_NAME,
        },
        data: leaderboard,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Leaderboard API error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
