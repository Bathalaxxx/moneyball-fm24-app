#!/bin/bash

# Moneyball FM24 Setup Script
# Quick setup for local development

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

echo "========================================"
echo "  Moneyball FM24 Setup Script"
echo "========================================"
echo

# Check Node.js version
print_status "Checking Node.js version..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 16+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    print_error "Node.js version 16+ is required. Current version: $(node -v)"
    print_status "Please update Node.js from https://nodejs.org/"
    exit 1
fi

print_success "Node.js $(node -v) is installed"

# Check npm
print_status "Checking npm..."
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm."
    exit 1
fi

print_success "npm $(npm -v) is installed"

# Install dependencies
print_status "Installing dependencies..."
if [ -f "package-lock.json" ]; then
    npm ci
else
    npm install
fi

print_success "Dependencies installed successfully"

# Create missing directories if needed
print_status "Creating missing directories..."
mkdir -p src/components src/pages src/utils scripts public

print_success "Directory structure verified"

# Set up Git hooks (optional)
if [ -d ".git" ]; then
    print_status "Setting up Git hooks..."
    
    # Pre-commit hook for linting
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh
# Pre-commit hook for code quality

echo "Running pre-commit checks..."

# Run linting
npm run lint
if [ $? -ne 0 ]; then
    echo "❌ Linting failed. Please fix the errors before committing."
    exit 1
fi

# Run tests
npm test -- --coverage --watchAll=false --silent
if [ $? -ne 0 ]; then
    echo "❌ Tests failed. Please fix the tests before committing."
    exit 1
fi

echo "✅ Pre-commit checks passed!"
EOF

    chmod +x .git/hooks/pre-commit
    print_success "Git hooks configured"
else
    print_warning "Not a Git repository. Skipping Git hooks setup."
fi

# Build the application to test
print_status "Testing build process..."
npm run build

if [ $? -eq 0 ]; then
    print_success "Build completed successfully"
else
    print_error "Build failed. Please check the error messages above."
    exit 1
fi

# Check if build files exist
if [ -d "build" ] && [ -f "build/index.html" ]; then
    print_success "Build artifacts created successfully"
else
    print_error "Build artifacts not found"
    exit 1
fi

# Optional: Start development server
echo
echo "========================================"
print_success "Setup completed successfully!"
echo "========================================"
echo
echo "Next steps:"
echo "  1. Start development server: ${GREEN}npm start${NC}"
echo "  2. Open browser to: ${BLUE}http://localhost:3000${NC}"
echo "  3. Test with FM24 HTML files"
echo "  4. Deploy using: ${GREEN}./deploy.sh${NC}"
echo
echo "Available commands:"
echo "  - ${GREEN}npm start${NC}        Start development server"
echo "  - ${GREEN}npm test${NC}         Run tests"
echo "  - ${GREEN}npm run build${NC}    Build for production"
echo "  - ${GREEN}npm run lint${NC}     Check code quality"
echo "  - ${GREEN}./deploy.sh${NC}      Deploy to hosting platforms"
echo

read -p "Would you like to start the development server now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Starting development server..."
    npm start
fi