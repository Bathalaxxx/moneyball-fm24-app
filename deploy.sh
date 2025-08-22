#!/bin/bash

# Moneyball FM24 Deployment Script
# This script builds and deploys the application to various hosting platforms

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_status "Checking requirements..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 16+ and try again."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm and try again."
        exit 1
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        print_error "Node.js version 16+ is required. Current version: $(node -v)"
        exit 1
    fi
    
    print_success "All requirements satisfied"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    if [ -f "package-lock.json" ]; then
        npm ci
    else
        npm install
    fi
    
    print_success "Dependencies installed"
}

# Run tests
run_tests() {
    print_status "Running tests..."
    
    if npm test -- --coverage --watchAll=false; then
        print_success "All tests passed"
    else
        print_warning "Some tests failed, but continuing with deployment"
    fi
}

# Build the application
build_app() {
    print_status "Building application..."
    
    # Set environment variables for production build
    export GENERATE_SOURCEMAP=false
    export CI=false
    
    if npm run build; then
        print_success "Application built successfully"
    else
        print_error "Build failed"
        exit 1
    fi
}

# Deploy to Netlify
deploy_netlify() {
    print_status "Deploying to Netlify..."
    
    if ! command -v netlify &> /dev/null; then
        print_status "Installing Netlify CLI..."
        npm install -g netlify-cli
    fi
    
    # Check if user is logged in
    if ! netlify status &> /dev/null; then
        print_status "Please log in to Netlify..."
        netlify login
    fi
    
    # Deploy
    if [ "$1" = "production" ]; then
        netlify deploy --prod --dir=build
        print_success "Deployed to production on Netlify"
    else
        DEPLOY_URL=$(netlify deploy --dir=build --json | jq -r '.deploy_url')
        print_success "Deployed preview to: $DEPLOY_URL"
    fi
}

# Deploy to GitHub Pages
deploy_github_pages() {
    print_status "Deploying to GitHub Pages..."
    
    # Check if gh-pages is installed
    if ! npm list gh-pages &> /dev/null; then
        print_status "Installing gh-pages..."
        npm install --save-dev gh-pages
    fi
    
    # Deploy
    npx gh-pages -d build
    print_success "Deployed to GitHub Pages"
}

# Deploy to Vercel
deploy_vercel() {
    print_status "Deploying to Vercel..."
    
    if ! command -v vercel &> /dev/null; then
        print_status "Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    # Deploy
    if [ "$1" = "production" ]; then
        vercel --prod
        print_success "Deployed to production on Vercel"
    else
        vercel
        print_success "Deployed preview to Vercel"
    fi
}

# Deploy to Firebase
deploy_firebase() {
    print_status "Deploying to Firebase..."
    
    if ! command -v firebase &> /dev/null; then
        print_status "Installing Firebase CLI..."
        npm install -g firebase-tools
    fi
    
    # Initialize if needed
    if [ ! -f "firebase.json" ]; then
        print_status "Initializing Firebase..."
        firebase init hosting
    fi
    
    # Deploy
    firebase deploy
    print_success "Deployed to Firebase"
}

# Create deployment package
create_package() {
    print_status "Creating deployment package..."
    
    # Create a zip file with the build
    BUILD_DATE=$(date +"%Y%m%d_%H%M%S")
    PACKAGE_NAME="moneyball-fm24-${BUILD_DATE}.zip"
    
    cd build
    zip -r "../${PACKAGE_NAME}" .
    cd ..
    
    print_success "Deployment package created: ${PACKAGE_NAME}"
}

# Main deployment function
main() {
    echo "========================================"
    echo "  Moneyball FM24 Deployment Script"
    echo "========================================"
    echo
    
    # Parse command line arguments
    PLATFORM=""
    ENVIRONMENT="preview"
    RUN_TESTS=true
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            -p|--platform)
                PLATFORM="$2"
                shift 2
                ;;
            -e|--environment)
                ENVIRONMENT="$2"
                shift 2
                ;;
            --no-tests)
                RUN_TESTS=false
                shift
                ;;
            -h|--help)
                echo "Usage: $0 [OPTIONS]"
                echo
                echo "Options:"
                echo "  -p, --platform PLATFORM    Deployment platform (netlify, github, vercel, firebase, package)"
                echo "  -e, --environment ENV       Environment (preview, production)"
                echo "  --no-tests                  Skip running tests"
                echo "  -h, --help                  Show this help message"
                echo
                echo "Examples:"
                echo "  $0 --platform netlify --environment production"
                echo "  $0 --platform github --no-tests"
                echo "  $0 --platform package"
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                echo "Use --help for usage information"
                exit 1
                ;;
        esac
    done
    
    # If no platform specified, prompt user
    if [ -z "$PLATFORM" ]; then
        echo "Select deployment platform:"
        echo "1) Netlify"
        echo "2) GitHub Pages"
        echo "3) Vercel"
        echo "4) Firebase"
        echo "5) Create package only"
        echo
        read -p "Enter choice (1-5): " choice
        
        case $choice in
            1) PLATFORM="netlify" ;;
            2) PLATFORM="github" ;;
            3) PLATFORM="vercel" ;;
            4) PLATFORM="firebase" ;;
            5) PLATFORM="package" ;;
            *) print_error "Invalid choice"; exit 1 ;;
        esac
    fi
    
    # Run deployment steps
    check_requirements
    install_dependencies
    
    if [ "$RUN_TESTS" = true ]; then
        run_tests
    fi
    
    build_app
    
    # Deploy to selected platform
    case $PLATFORM in
        netlify)
            deploy_netlify "$ENVIRONMENT"
            ;;
        github)
            deploy_github_pages
            ;;
        vercel)
            deploy_vercel "$ENVIRONMENT"
            ;;
        firebase)
            deploy_firebase
            ;;
        package)
            create_package
            ;;
        *)
            print_error "Unknown platform: $PLATFORM"
            exit 1
            ;;
    esac
    
    echo
    print_success "Deployment completed successfully!"
    
    # Show next steps
    echo
    print_status "Next steps:"
    case $PLATFORM in
        netlify)
            echo "  - Monitor your deployment at https://app.netlify.com"
            echo "  - Configure custom domain if needed"
            echo "  - Set up form handling if required"
            ;;
        github)
            echo "  - Check your GitHub Pages settings"
            echo "  - Configure custom domain in repository settings"
            echo "  - Monitor deployment in Actions tab"
            ;;
        vercel)
            echo "  - Monitor your deployment at https://vercel.com/dashboard"
            echo "  - Configure custom domain if needed"
            echo "  - Set up analytics if required"
            ;;
        firebase)
            echo "  - Monitor your deployment in Firebase Console"
            echo "  - Configure custom domain if needed"
            echo "  - Set up hosting rules if required"
            ;;
        package)
            echo "  - Upload the package to your hosting provider"
            echo "  - Extract and serve the files"
            echo "  - Configure your web server"
            ;;
    esac
}

# Run the main function
main "$@"