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

type LeaderboardResponse = {
  success: boolean;
  data?: LeaderboardUser[];
  error?: string;
};

function LeaderboardSection() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/leaderboard");
        const data: LeaderboardResponse = await response.json();

        if (!data.success) {
          setError(data.error || "Failed to fetch leaderboard");
          setLeaderboard([]);
          return;
        }

        setLeaderboard(data.data || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch leaderboard"
        );
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getMedalEmoji = (rank: number): string => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return "";
  };

  const isTopThree = (rank: number): boolean => rank <= 3;

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
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-lg text-red-600 font-medium">Error: {error}</p>
          <p className="text-sm text-gray-600 mt-2">
            Make sure your GitHub token is configured in .env.local
          </p>
        </div>
      </div>
    );
  }

  // Empty state
  if (leaderboard.length === 0) {
    return (
      <div className="bg-white py-12">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-lg text-gray-600">
            No contributors found yet. Check back soon!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Leaderboard Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
                        className={`text-sm sm:text-base font-bold ${
                          isTop ? "text-amber-700" : "text-gray-900"
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
      </div>

      {/* Mobile stats info */}
      <div className="mt-4 sm:hidden bg-gray-50 rounded-lg p-4 text-xs text-gray-600 space-y-1">
        <p>📊 Full stats visible on desktop view</p>
      </div>
    </div>
  );
}

export default function Home() {
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
            Track PRs, merged PRs, and issues to rank contributors in your open-source event.
            Build engagement, recognize top contributors, and celebrate your community.
          </p>

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
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 bg-gray-100 text-gray-900 font-medium rounded-lg hover:bg-gray-200 transition-colors border border-gray-200"
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
          <div id="leaderboard" className="mb-12 scroll-mt-16">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                  Leaderboard
                </h2>
                <p className="text-sm text-gray-600 mt-2">Last updated just now</p>
              </div>
            </div>
          </div>

          {/* Leaderboard Component */}
          <LeaderboardSection />
        </div>
      </div>
    </div>
  );
}
