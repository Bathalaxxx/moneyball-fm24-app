import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-6">😵</div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Oops! Something went wrong
            </h1>
            
            <p className="text-lg text-gray-600 mb-6">
              We're sorry, but the application encountered an unexpected error. 
              This might be due to a browser compatibility issue or a problem with the data processing.
            </p>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-semibold text-red-800 mb-2">
                What you can try:
              </h3>
              <ul className="text-sm text-red-700 space-y-1 text-left">
                <li>• Click "Try Again" to retry the current operation</li>
                <li>• Refresh the page to restart the application</li>
                <li>• Clear your browser cache and cookies</li>
                <li>• Try using a different browser (Chrome, Firefox, Safari, Edge)</li>
                <li>• Check that JavaScript is enabled in your browser</li>
                <li>• Ensure your browser supports modern web standards</li>
              </ul>
            </div>

            {/* Development error details (only show in development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left bg-gray-100 rounded-lg p-4 mb-6">
                <summary className="font-semibold text-gray-800 cursor-pointer mb-2">
                  Technical Details (Development Mode)
                </summary>
                <div className="text-sm text-gray-700 space-y-2">
                  <div>
                    <strong>Error:</strong> {this.state.error.toString()}
                  </div>
                  <div>
                    <strong>Stack Trace:</strong>
                    <pre className="mt-1 text-xs bg-gray-200 p-2 rounded overflow-auto">
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </div>
                </div>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={this.handleRetry}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
              >
                <span className="mr-2">🔄</span>
                Try Again
              </button>
              
              <button
                onClick={this.handleReload}
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
              >
                <span className="mr-2">🔃</span>
                Reload Page
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                If the problem persists, please try using a different browser or contact support.
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Moneyball: FM requires modern browser features including WebAssembly and ES6 support.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;