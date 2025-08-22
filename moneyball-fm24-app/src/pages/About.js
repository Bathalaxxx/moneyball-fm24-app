import React from 'react';

const About = () => {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          About Moneyball: FM
        </h1>
        <p className="text-xl text-gray-600">
          Advanced analytics for Football Manager 2024, inspired by the Moneyball revolution
        </p>
      </div>

      {/* Mission Statement */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-8 mb-8">
        <div className="text-center">
          <span className="text-4xl mb-4 block">⚽📊</span>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Revolutionize Your FM24 Strategy
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Just as Billy Beane revolutionized baseball with data-driven decisions, 
            Moneyball: FM brings advanced analytics to Football Manager 2024, helping you 
            identify undervalued players and make smarter transfer decisions.
          </p>
        </div>
      </div>

      {/* What We Do */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">What We Do</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              <span className="mr-2">🎯</span>Player Archetype Analysis
            </h3>
            <p className="text-gray-700">
              We analyze your FM24 exports and categorize players into specific archetypes 
              (Sweeper Keepers, Central Defenders, Fullbacks, etc.) with detailed performance metrics.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              <span className="mr-2">🌍</span>League Normalization
            </h3>
            <p className="text-gray-700">
              Our algorithms adjust player ratings based on league strength, allowing fair 
              comparisons between players from different competitions worldwide.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              <span className="mr-2">📈</span>Advanced Metrics
            </h3>
            <p className="text-gray-700">
              We calculate composite metrics like Intensity, Aerial Dominance, and Chance Creation 
              to provide deeper insights beyond basic statistics.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-orange-500">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              <span className="mr-2">🔒</span>Privacy First
            </h3>
            <p className="text-gray-700">
              All processing happens in your browser using Pyodide. Your FM24 data never 
              leaves your device, ensuring complete privacy and security.
            </p>
          </div>
        </div>
      </div>

      {/* Player Archetypes */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Player Archetypes We Analyze</h2>
        <div className="space-y-4">
          {[
            {
              title: "Sweeper Keeper",
              description: "Goalkeepers who excel at distribution and prevent goals above expected",
              color: "yellow"
            },
            {
              title: "Central Defender", 
              description: "Centre-backs with strong defensive actions, aerial ability, and passing",
              color: "red"
            },
            {
              title: "Fullback",
              description: "Full-backs who contribute to attack with crosses, assists, and intensity",
              color: "blue"
            },
            {
              title: "Defensive Midfielder",
              description: "Midfielders who break up play, tackle effectively, and distribute well",
              color: "green"
            },
            {
              title: "Attacking Midfielder",
              description: "Creative midfielders who create chances and contribute to goalscoring",
              color: "purple"
            },
            {
              title: "Winger",
              description: "Wide players who beat opponents, create chances, and press effectively",
              color: "pink"
            },
            {
              title: "Striker (Advanced Forward)",
              description: "Forwards who maximize scoring opportunities while staying onside",
              color: "orange"
            }
          ].map((archetype, index) => (
            <div key={index} className={`bg-${archetype.color}-50 border-l-4 border-${archetype.color}-400 p-4 rounded-lg`}>
              <h3 className={`text-lg font-semibold text-${archetype.color}-900 mb-2`}>
                {archetype.title}
              </h3>
              <p className={`text-${archetype.color}-800`}>
                {archetype.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Technology Stack */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Technology</h2>
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-3">⚛️</div>
              <h3 className="font-semibold text-gray-900 mb-2">React.js</h3>
              <p className="text-sm text-gray-600">Modern frontend framework for responsive UI</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">🐍</div>
              <h3 className="font-semibold text-gray-900 mb-2">Pyodide + Python</h3>
              <p className="text-sm text-gray-600">In-browser Python execution with pandas and numpy</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">🎨</div>
              <h3 className="font-semibent text-gray-900 mb-2">Tailwind CSS</h3>
              <p className="text-sm text-gray-600">Utility-first CSS for beautiful, responsive design</p>
            </div>
          </div>
        </div>
      </div>

      {/* Moneyball Philosophy */}
      <div className="bg-gradient-to-r from-blue-900 to-green-900 text-white rounded-lg p-8 mb-8">
        <h2 className="text-2xl font-bold mb-4">The Moneyball Philosophy</h2>
        <div className="space-y-4">
          <blockquote className="text-lg italic border-l-4 border-white pl-4">
            "The goal isn't to buy players. The goal is to buy wins."
          </blockquote>
          <p className="text-blue-100">
            In Michael Lewis's "Moneyball," the Oakland Athletics used data analytics to compete 
            with teams having much larger budgets. Our FM24 analytics follow the same principle: 
            find undervalued players who contribute to winning, regardless of reputation or transfer value.
          </p>
          <p className="text-blue-100">
            By focusing on performance metrics that correlate with success rather than traditional 
            scouting methods, you can build competitive squads more efficiently and effectively.
          </p>
        </div>
      </div>

      {/* FAQ */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            {
              question: "Is my FM24 data secure?",
              answer: "Yes! All processing happens in your browser using Pyodide. Your data never leaves your device."
            },
            {
              question: "What FM24 versions are supported?",
              answer: "Our filters and analysis are designed for Football Manager 2024. Earlier versions may work but aren't officially supported."
            },
            {
              question: "How accurate are the league multipliers?",
              answer: "League multipliers are based on historical performance data and are regularly updated to reflect current league strengths."
            },
            {
              question: "Can I customize the archetype formulas?",
              answer: "Currently, the formulas are fixed based on extensive research. Future versions may include customization options."
            },
            {
              question: "What file size limits exist?",
              answer: "HTML files should be under 10MB each. Larger files may cause performance issues or browser crashes."
            }
          ].map((faq, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {faq.question}
              </h3>
              <p className="text-gray-700">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center bg-green-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-900 mb-2">
          Ready to revolutionize your FM24 strategy?
        </h3>
        <p className="text-green-700 mb-4">
          Start by downloading our filter and exporting your player data
        </p>
        <a
          href="/"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors duration-200"
        >
          <span className="mr-2">🚀</span>
          Get Started
        </a>
      </div>
    </div>
  );
};

export default About;