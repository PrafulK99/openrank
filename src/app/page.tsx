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

      {/* Leaderboard Preview Section */}
      <div className="bg-gray-50 py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div id="leaderboard" className="text-center mb-12 scroll-mt-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Leaderboard Preview
            </h2>
            <p className="text-lg text-gray-600">
              See how contributors rank in real-time
            </p>
          </div>

          {/* Placeholder Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 sm:p-12">
            <div className="space-y-6">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 pb-6 border-b border-gray-100">
                <div className="col-span-1 text-sm font-semibold text-gray-600">Rank</div>
                <div className="col-span-5 text-sm font-semibold text-gray-600">Contributor</div>
                <div className="col-span-2 text-sm font-semibold text-gray-600 text-right">PRs</div>
                <div className="col-span-2 text-sm font-semibold text-gray-600 text-right">Merged</div>
                <div className="col-span-2 text-sm font-semibold text-gray-600 text-right">Issues</div>
              </div>

              {/* Placeholder Rows */}
              {[1, 2, 3].map((index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-4 py-4 items-center hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="col-span-1">
                    <span className="text-lg font-bold text-gray-900">#{index}</span>
                  </div>
                  <div className="col-span-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-700">
                        {["Alice Johnson", "Bob Smith", "Carol Lee"][index - 1]}
                      </span>
                    </div>
                  </div>
                  <div className="col-span-2 text-right text-sm font-medium text-gray-900">
                    {[24, 18, 15][index - 1]}
                  </div>
                  <div className="col-span-2 text-right text-sm font-medium text-gray-900">
                    {[22, 16, 14][index - 1]}
                  </div>
                  <div className="col-span-2 text-right text-sm font-medium text-gray-900">
                    {[8, 6, 5][index - 1]}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Text */}
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500">
                Connect your repository to start tracking contributions →
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
