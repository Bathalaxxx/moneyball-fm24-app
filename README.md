# Moneyball: FM ⚽📊

**Advanced Analytics for Football Manager 2024**

Transform your FM24 exports into actionable player insights using data-driven Moneyball principles. This web application processes Football Manager 2024 HTML exports to generate comprehensive player analytics with archetype classifications and league-adjusted ratings.

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-username/moneyball-fm24-app)

## ✨ Features

- **🎯 Player Archetype Analysis**: Categorizes players into 7 specific roles with tailored performance metrics
- **🌍 League Normalization**: Adjusts ratings based on league strength for fair cross-league comparisons  
- **📈 Advanced Metrics**: Calculates composite metrics like Intensity, Aerial Dominance, and Chance Creation
- **🔒 Privacy First**: All processing happens in your browser using Pyodide - no data leaves your device
- **⚡ Static Deployment**: No backend servers required - deploys anywhere as static files
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices

## 🎮 Player Archetypes

| Archetype | Description | Key Metrics |
|-----------|-------------|-------------|
| **Sweeper Keeper** | Distribution-focused goalkeepers | xGP/90, Pass %, Goal Mistakes |
| **Central Defender** | Strong defensive presence | Clearances, Interceptions, Aerial Dominance |
| **Fullback** | Attack-contributing defenders | xA/90, Progressive passes, Intensity |
| **Defensive Midfielder** | Defensive shield with distribution | Tackles, Blocks, Pass % |
| **Attacking Midfielder** | Creative central playmakers | xG+xA/90, Pass %, Dribbles |
| **Winger** | Wide attacking threats | xG+xA/90, Dribbles, Pressing |
| **Striker (AF)** | Clinical goal scorers | xG/90, Conversion %, Intensity |

## 🚀 Quick Start

### Using the Deployed App

1. **Visit**: [https://moneyball-fm24.netlify.app](https://moneyball-fm24.netlify.app)
2. **Download** the provided FM24 filter file
3. **Export** three HTML files from FM24 using different transfer status filters
4. **Upload** and process your files to get comprehensive analytics

### Local Development

```bash
# Clone the repository
git clone https://github.com/your-username/moneyball-fm24-app.git
cd moneyball-fm24-app

# Install dependencies
npm install

# Start development server
npm start

# Open http://localhost:3000 in your browser
```

## 📋 Prerequisites

### For Users
- **Modern Web Browser**: Chrome 70+, Firefox 65+, Safari 14+, or Edge 79+
- **Football Manager 2024** with player database
- **JavaScript enabled** (required for Pyodide)
- **4GB+ RAM** recommended for large datasets

### For Developers
- **Node.js** 16+ and npm 8+
- **Git** for version control
- Basic knowledge of **React** and **Python**

## 🔧 Installation & Setup

### Development Environment

1. **Clone and install**:
   ```bash
   git clone https://github.com/your-username/moneyball-fm24-app.git
   cd moneyball-fm24-app
   npm install
   ```

2. **Start development server**:
   ```bash
   npm start
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

4. **Test the build locally**:
   ```bash
   npm install -g serve
   serve -s build
   ```

## 🚢 Deployment

### Netlify (Recommended)

1. **Automatic Deployment**:
   - Fork this repository
   - Connect your GitHub account to Netlify
   - Deploy with one click using the button above

2. **Manual Deployment**:
   ```bash
   # Build the project
   npm run build
   
   # Deploy to Netlify
   npm install -g netlify-cli
   netlify login
   netlify deploy --prod --dir=build
   ```

3. **Configuration**:
   - **Build command**: `npm run build`
   - **Publish directory**: `build`
   - **Node version**: 18.x (set in netlify.toml)

### Other Static Hosts

The app works on any static hosting service:

- **GitHub Pages**: Set up GitHub Actions workflow
- **Vercel**: Connect repository and deploy
- **Firebase Hosting**: Use Firebase CLI
- **AWS S3 + CloudFront**: Upload build folder

Example for GitHub Pages:
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./build
```

## 📁 Project Structure

```
moneyball-fm24-app/
├── public/
│   ├── index.html              # Main HTML template
│   ├── fm24-filter.fmf         # FM24 filter file for download
│   └── manifest.json           # PWA manifest
├── src/
│   ├── components/
│   │   ├── ErrorBoundary.js    # Error handling wrapper
│   │   └── LoadingSpinner.js   # Loading components
│   ├── pages/
│   │   ├── Instructions.js     # Instructions page
│   │   ├── UploadForm.js       # File upload interface
│   │   ├── ProcessingPage.js   # Pyodide processing
│   │   └── About.js            # About page
│   ├── utils/
│   │   └── errorHandling.js    # Error utilities
│   ├── App.js                  # Main app component
│   ├── App.css                 # Tailwind + custom styles
│   └── index.js                # Entry point
├── scripts/
│   └── fm_processor.py         # Python processing logic
├── package.json                # Dependencies
├── tailwind.config.js          # Tailwind configuration
└── README.md                   # This file
```

## ⚙️ Technology Stack

- **Frontend**: React 18 with hooks
- **Styling**: Tailwind CSS with custom football theme
- **Processing**: Pyodide (Python in browser) with pandas, numpy, xlsxwriter
- **Routing**: React Router DOM
- **Build Tool**: Create React App
- **Deployment**: Static hosting (Netlify, GitHub Pages, etc.)

## 🔬 How It Works

1. **File Upload**: Users upload three FM24 HTML exports (transfers, loans, universal)
2. **Pyodide Initialization**: Python environment loads in browser with required packages
3. **Data Processing**: Python script processes HTML using pandas, applies formulas
4. **League Adjustment**: Ratings adjusted based on hardcoded league strength multipliers
5. **Archetype Analysis**: Players categorized and ranked within their archetype
6. **Excel Generation**: xlsxwriter creates downloadable Excel file with multiple sheets

## 📊 Analytics Methodology

### Rating Calculation
Each archetype uses weighted formulas based on relevant metrics:

```python
# Example: Central Defender Rating
CD_Rating = (
    0.80 * average([Clearances, Interceptions, Blocks, Shots_Blocked, 
                   Aerial_Dominance, Key_Tackles, Tackles]) +
    0.15 * Pass_Percentage +
    0.05 * (1 - Goal_Mistakes)
)
```

### League Multipliers
Ratings are adjusted using league strength coefficients:
- **Premier League**: 95.7% (highest)
- **Serie A**: 88.9%
- **La Liga**: 88.4% 
- **Others**: 5.0% (default)

### Data Requirements
- **Minimum 900 minutes** played (≈10 full matches)
- **Valid position** assignments
- **Complete statistical data** from FM24 exports

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Guidelines

- Follow React hooks patterns (no class components)
- Use Tailwind CSS for styling
- Add error handling for all user interactions
- Test with various FM24 export sizes
- Maintain browser compatibility

### Areas for Contribution

- **New Archetypes**: Add formations like Wing-Backs, Box-to-Box midfielders
- **Enhanced Metrics**: Improve composite calculations
- **UI Improvements**: Better mobile experience, dark mode
- **Performance**: Optimize large dataset processing
- **Testing**: Add unit tests and integration tests

## 🐛 Troubleshooting

### Common Issues

**"Browser Not Supported" Error**
- Update to a modern browser (Chrome 70+, Firefox 65+, Safari 14+)
- Enable JavaScript in browser settings
- Clear browser cache and cookies

**"Processing Failed" Error**
- Verify HTML files are exported correctly from FM24
- Check file sizes are under 10MB each
- Ensure files contain player table data

**Slow Processing**
- Large datasets (20k+ players) may take 60+ seconds
- Close other browser tabs to free up memory
- Try processing smaller datasets first

**Excel Download Issues**
- Disable pop-up blockers
- Allow downloads from the site
- Check browser download settings

### Getting Help

1. **Check** the [Issues](https://github.com/your-username/moneyball-fm24-app/issues) page
2. **Search** existing issues before creating new ones
3. **Provide** browser info, file sizes, and error messages
4. **Include** screenshots when helpful

## 🔐 Privacy & Security

- **No Data Collection**: All processing happens locally in your browser
- **No Server Communication**: Files never leave your device
- **No Tracking**: No analytics or user behavior tracking
- **Open Source**: All code is publicly auditable

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Michael Lewis** - Original "Moneyball" book and methodology
- **Sports Interactive** - Football Manager 2024
- **Pyodide Team** - Making Python-in-browser possible
- **React Team** - Excellent frontend framework
- **Tailwind CSS** - Beautiful, utility-first styling

## 📈 Roadmap

### Short Term
- [ ] Add more player archetypes (Wing-Backs, Box-to-Box)
- [ ] Implement dark mode theme
- [ ] Add data visualization charts
- [ ] Improve mobile responsiveness

### Medium Term  
- [ ] Custom archetype formula editor
- [ ] Historical data comparison
- [ ] Team composition analysis
- [ ] Advanced filtering options

### Long Term
- [ ] Multi-language support
- [ ] FM23/FM25 compatibility
- [ ] Machine learning-based insights
- [ ] Community-driven archetype sharing

---

**Built with ❤️ for the Football Manager community**

*Transform your FM24 strategy with data-driven insights. Find the next Moneyball success story!*