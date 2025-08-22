import React from 'react';
import { Link } from 'react-router-dom';

const InstructionStep = ({ number, title, children, highlight = false }) => (
  <div className={`flex space-x-4 p-4 rounded-lg ${highlight ? 'bg-blue-50 border-l-4 border-blue-400' : 'bg-white'} shadow-sm`}>
    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${highlight ? 'bg-blue-500' : 'bg-green-600'}`}>
      {number}
    </div>
    <div className="flex-1">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <div className="text-gray-700">{children}</div>
    </div>
  </div>
);

const Instructions = () => {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to Moneyball: FM
        </h1>
        <p className="text-xl text-gray-600 mb-6">
          Transform your Football Manager 2024 exports into advanced player analytics
        </p>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-yellow-400 text-xl">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Important:</strong> This app processes data entirely in your browser. No data is sent to external servers, ensuring your privacy and security.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Download Filter Section */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex items-center mb-4">
          <span className="text-2xl mr-3">📥</span>
          <h2 className="text-2xl font-bold text-gray-900">Step 1: Download the Filter File</h2>
        </div>
        <p className="text-gray-700 mb-4">
          First, download our custom FM24 filter file that will export all the necessary player data:
        </p>
        <a
          href="/fm24-filter.fmf"
          download="fm24-moneyball-filter.fmf"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors duration-200"
        >
          <span className="mr-2">📁</span>
          Download FM24 Filter (.fmf)
        </a>
        <p className="text-sm text-gray-500 mt-2">
          This filter includes all necessary player statistics for our Moneyball analysis.
        </p>
      </div>

      {/* Step-by-step Instructions */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 2: Export Data from FM24</h2>
        
        <InstructionStep number="1" title="Load the Filter in FM24">
          <ul className="space-y-2">
            <li>• Open Football Manager 2024</li>
            <li>• Go to <strong>Squad → Search & Filters → Player Search</strong></li>
            <li>• Click <strong>"Load Filter"</strong> and select the downloaded .fmf file</li>
            <li>• The filter will automatically configure all necessary columns and criteria</li>
          </ul>
        </InstructionStep>

        <InstructionStep number="2" title="Create Three Separate Searches" highlight={true}>
          <p className="mb-3">You need to export <strong>exactly three HTML files</strong> with these specific search criteria:</p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border">
              <h4 className="font-semibold text-blue-900 mb-2">🔄 Transfers Available</h4>
              <p className="text-sm text-blue-800">
                Filter: <code>Transfer Status → Available for Transfer</code><br/>
                Save as: <strong>signed_players.html</strong>
              </p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg border">
              <h4 className="font-semibold text-orange-900 mb-2">🤝 Loans Available</h4>
              <p className="text-sm text-orange-800">
                Filter: <code>Transfer Status → Available on Loan</code><br/>
                Save as: <strong>loans_players.html</strong>
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border">
              <h4 className="font-semibold text-purple-900 mb-2">🌍 All Players</h4>
              <p className="text-sm text-purple-800">
                Filter: <code>No transfer restrictions</code><br/>
                Save as: <strong>universal_players.html</strong>
              </p>
            </div>
          </div>
        </InstructionStep>

        <InstructionStep number="3" title="Export Each Search to HTML">
          <ol className="space-y-2">
            <li>1. Run each search separately in FM24</li>
            <li>2. Once the results load, click <strong>"Export"</strong> at the bottom</li>
            <li>3. Choose <strong>"Web Page"</strong> as the export format</li>
            <li>4. Save with the exact filenames mentioned above</li>
            <li>5. Repeat for all three search types</li>
          </ol>
        </InstructionStep>

        <InstructionStep number="4" title="Upload and Process">
          <p className="mb-3">
            Once you have all three HTML files, proceed to upload them:
          </p>
          <Link
            to="/upload"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
          >
            <span className="mr-2">📤</span>
            Go to Upload Page
          </Link>
        </InstructionStep>
      </div>

      {/* Tips and Requirements */}
      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <div className="bg-green-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-3">
            <span className="mr-2">💡</span>Tips for Best Results
          </h3>
          <ul className="text-green-800 space-y-1 text-sm">
            <li>• Ensure players have at least 900 minutes played</li>
            <li>• Export from the current season for accurate data</li>
            <li>• Include all leagues for comprehensive analysis</li>
            <li>• Use the provided filter file for consistency</li>
          </ul>
        </div>

        <div className="bg-red-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-900 mb-3">
            <span className="mr-2">⚡</span>System Requirements
          </h3>
          <ul className="text-red-800 space-y-1 text-sm">
            <li>• Modern web browser (Chrome, Firefox, Safari, Edge)</li>
            <li>• At least 4GB RAM for large datasets</li>
            <li>• HTML files should be under 10MB each</li>
            <li>• JavaScript enabled</li>
          </ul>
        </div>
      </div>

      {/* What You'll Get */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          <span className="mr-2">📊</span>What You'll Receive
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Player Archetypes:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Sweeper Keepers</li>
              <li>• Central Defenders</li>
              <li>• Fullbacks</li>
              <li>• Defensive Midfielders</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Advanced Analytics:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Attacking Midfielders</li>
              <li>• Wingers</li>
              <li>• Strikers (Advanced Forward)</li>
              <li>• League-adjusted ratings</li>
            </ul>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-4">
          Each archetype includes percentile rankings, league multipliers, and detailed performance metrics optimized for FM24 tactics.
        </p>
      </div>
    </div>
  );
};

export default Instructions;