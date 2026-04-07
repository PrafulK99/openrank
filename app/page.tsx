"use client";

import { useEffect, useState } from "react";

type LeaderboardUser = {
  username: string;
  avatar: string;
  prOpened: number;
  prMerged: number;
  issuesOpened: number;
  score: number;
};

type RepoInfo = {
  owner: string;
  name: string;
};

type LeaderboardResponse = {
  success: boolean;
  repo?: RepoInfo;
  data?: LeaderboardUser[];
  error?: string;
};

type Stats = {
  totalContributors: number;
  totalIssues: number;
  totalScore: number;
};

// Helper to calculate stats from leaderboard
function calculateStats(leaderboard: LeaderboardUser[]): Stats {
  return {
    totalContributors: leaderboard.length,
    totalIssues: leaderboard.reduce((sum, user) => sum + user.issuesOpened, 0),
    totalScore: leaderboard.reduce((sum, user) => sum + user.score, 0),
  };
}

// Stats Card Component
function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-4">
        <div className="text-3xl">{icon}</div>
        <div>
          <p className="text-sm text-gray-600 font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

// Leaderboard Table Component
function LeaderboardTable({
  leaderboard,
  isRefreshing,
}: {
  leaderboard: LeaderboardUser[];
  isRefreshing: boolean;
}) {
  const getMedalEmoji = (rank: number): string => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return "";
  };

  const isTopThree = (rank: number): boolean => rank <= 3;

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-opacity ${
        isRefreshing ? "opacity-70" : "opacity-100"
      }`}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-700 w-12">
                Rank
              </th>
              <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-700">
                Contributor
              </th>
              <th className="px-4 sm:px-6 py-4 text-right text-xs font-semibold text-gray-700 hidden sm:table-cell">
                PR Opened
              </th>
              <th className="px-4 sm:px-6 py-4 text-right text-xs font-semibold text-gray-700 hidden sm:table-cell">
                PR Merged
              </th>
              <th className="px-4 sm:px-6 py-4 text-right text-xs font-semibold text-gray-700 hidden sm:table-cell">
                Issues
              </th>
              <th className="px-4 sm:px-6 py-4 text-right text-xs font-semibold text-gray-700">
                Score
              </th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((user, index) => {
              const rank = index + 1;
              const isTop = isTopThree(rank);

              return (
                <tr
                  key={user.username}
                  className={`border-b border-gray-100 transition-colors ${
                    isTop ? "bg-amber-50 hover:bg-amber-100" : "hover:bg-gray-50"
                  }`}
                >
                  <td className="px-4 sm:px-6 py-4 text-center">
                    <span className="text-lg font-bold">
                      {getMedalEmoji(rank) || `#${rank}`}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200"
                      />
                      <span className="text-sm sm:text-base font-medium text-gray-900">
                        {user.username}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-right hidden sm:table-cell">
                    <span className="text-sm text-gray-700">{user.prOpened}</span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-right hidden sm:table-cell">
                    <span className="text-sm text-gray-700">{user.prMerged}</span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-right hidden sm:table-cell">
                    <span className="text-sm text-gray-700">
                      {user.issuesOpened}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                        isTop
                          ? "bg-amber-200 text-amber-900"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      {user.score}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile stats info */}
      <div className="sm:hidden bg-gray-50 border-t border-gray-100 px-4 py-3 text-xs text-gray-600">
        <p>📊 Full stats visible on desktop</p>
      </div>
    </div>
  );
}

// Main Leaderboard Section
function LeaderboardSection({
  onRepoInfoLoaded,
}: {
  onRepoInfoLoaded: (repo: RepoInfo | null) => void;
}) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [repoInfo, setRepoInfo] = useState<RepoInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchLeaderboard = async () => {
    try {
      setIsRefreshing(true);
      setError(null);

      const response = await fetch("/api/leaderboard");
      const data: LeaderboardResponse = await response.json();

      if (!data.success) {
        setError(data.error || "Failed to fetch leaderboard");
        setLeaderboard([]);
        setRepoInfo(null);
        onRepoInfoLoaded(null);
        return;
      }

      setLeaderboard(data.data || []);
      setLastUpdated(new Date());

      // Store repo info locally and pass to parent component
      if (data.repo) {
        setRepoInfo(data.repo);
        onRepoInfoLoaded(data.repo);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch leaderboard"
      );
      setLeaderboard([]);
      setRepoInfo(null);
      onRepoInfoLoaded(null);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const stats = calculateStats(leaderboard);

  // Loading state
  if (loading) {
    return (
      <div className="bg-white py-12 text-center">
        <p className="text-lg text-gray-600">Loading leaderboard...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white py-12">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-lg bg-red-50 border border-red-200 p-6">
            <p className="text-lg text-red-700 font-medium">⚠️ {error}</p>
            <p className="text-sm text-red-600 mt-2">
              Make sure GITHUB_TOKEN is configured in .env.local
            </p>
            <button
              onClick={() => fetchLeaderboard()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (leaderboard.length === 0) {
    return (
      <div className="space-y-8">
        {/* Empty Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total Contributors" value={0} icon="👥" />
          <StatCard label="Total Issues Opened" value={0} icon="📝" />
          <StatCard label="Total Score Awarded" value={0} icon="⭐" />
        </div>

        {/* Empty State Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-12 sm:p-16">
          <div className="flex flex-col items-center justify-center text-center space-y-6">
            {/* Icon */}
            <div className="text-6xl">🚀</div>

            {/* Heading */}
            <div className="space-y-3">
              <h3 className="text-3xl font-bold text-gray-900">
                No contributors yet
              </h3>
              <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
                Be the first to open an issue or pull request and claim the top spot on OpenRank.
              </p>
            </div>

            {/* Call to Action */}
            <div className="pt-4">
              <a
                href={`https://github.com/${repoInfo?.owner}/${repoInfo?.name}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex px-6 py-2 rounded-lg font-medium text-sm transition-colors ${
                  repoInfo
                    ? "bg-gray-900 text-white hover:bg-gray-800"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
                onClick={(e) => !repoInfo && e.preventDefault()}
              >
                Start Contributing
              </a>
            </div>

            {/* Divider */}
            <div className="pt-4 border-t border-gray-100 w-full"></div>

            {/* Info Text */}
            <p className="text-sm text-gray-500">
              Contributions from the last 30 days will appear here automatically.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Contributors" value={stats.totalContributors} icon="👥" />
        <StatCard label="Total Issues Opened" value={stats.totalIssues} icon="📝" />
        <StatCard label="Total Score Awarded" value={stats.totalScore} icon="⭐" />
      </div>

      {/* Leaderboard Header with Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Rankings</h3>
          {lastUpdated && (
            <p className="text-sm text-gray-600 mt-1">
              Last updated {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <button
          onClick={() => fetchLeaderboard()}
          disabled={isRefreshing}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
            isRefreshing
              ? "bg-gray-100 text-gray-500 cursor-not-allowed"
              : "bg-gray-900 text-white hover:bg-gray-800"
          }`}
        >
          <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          {isRefreshing && (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Leaderboard Table */}
      <LeaderboardTable leaderboard={leaderboard} isRefreshing={isRefreshing} />
    </div>
  );
}

export default function Home() {
  const [repoInfo, setRepoInfo] = useState<RepoInfo | null>(null);

  const handleRepoInfoLoaded = (repo: RepoInfo | null) => {
    setRepoInfo(repo);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-2xl text-center space-y-8">
          {/* Badge */}
          <div className="inline-block">
            <span className="px-3 py-1 text-sm font-medium text-gray-600 bg-gray-100 rounded-full">
              Open Source Leaderboards
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight">
            OpenRank
          </h1>

          {/* Subtitle */}
          <p className="text-xl sm:text-2xl text-gray-600 font-medium">
            Open source event leaderboard for GitHub contributors
          </p>

          {/* Description */}
          <p className="text-lg text-gray-500 leading-relaxed max-w-lg mx-auto">
            Track pull requests, merged PRs, and issues to rank contributors during your open-source event.
            Build engagement, recognize top contributors, and celebrate your community.
          </p>

          {/* Repo Badge */}
          {repoInfo ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
              <span className="text-sm font-mono text-gray-700">
                Tracking: {repoInfo.owner}/{repoInfo.name}
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
              <span className="text-sm text-gray-700">Loading repository info...</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            {/* Primary Button */}
            <a
              href="#leaderboard"
              className="px-8 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              View Leaderboard
            </a>

            {/* Secondary Button */}
            <a
              href={
                repoInfo
                  ? `https://github.com/${repoInfo.owner}/${repoInfo.name}`
                  : "#"
              }
              target="_blank"
              rel="noopener noreferrer"
              className={`px-8 py-3 font-medium rounded-lg border border-gray-200 transition-colors ${
                repoInfo
                  ? "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  : "bg-gray-100 text-gray-500 cursor-not-allowed"
              }`}
              onClick={(e) => !repoInfo && e.preventDefault()}
            >
              GitHub Repo
            </a>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg
            className="w-6 h-6 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>

      {/* Scoring Rules Section */}
      <div className="bg-gray-50 py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How Scoring Works
            </h2>
            <p className="text-lg text-gray-600">
              Contributions are ranked by activity level
            </p>
          </div>

          {/* Scoring Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* PR Opened */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-4">5</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Pull Request Opened
              </h3>
              <p className="text-sm text-gray-600">
                Each PR opened in the last 30 days
              </p>
            </div>

            {/* PR Merged */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <div className="text-4xl font-bold text-green-600 mb-4">10</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Pull Request Merged
              </h3>
              <p className="text-sm text-gray-600">
                Each merged PR counts double
              </p>
            </div>

            {/* Issue Opened */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <div className="text-4xl font-bold text-purple-600 mb-4">2</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Issue Opened
              </h3>
              <p className="text-sm text-gray-600">
                Each issue opened in the last 30 days
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Section */}
      <div className="bg-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div id="leaderboard" className="scroll-mt-16">
            <LeaderboardSection onRepoInfoLoaded={handleRepoInfoLoaded} />
          </div>
        </div>
      </div>
    </div>
  );
}
