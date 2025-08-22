import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="min-h-screen bg-telegram-bg text-telegram-text p-4 flex items-center justify-center">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-6 mb-4">
              <h2 className="text-xl font-bold text-red-400 mb-2">Something went wrong</h2>
              <p className="text-telegram-hint mb-4">
                The application encountered an error. Please try refreshing the page.
              </p>
              
              {process.env.NODE_ENV === 'development' && (
                <details className="text-left text-sm">
                  <summary className="cursor-pointer text-red-400 mb-2">Error Details</summary>
                  <pre className="bg-telegram-secondary p-2 rounded text-xs overflow-auto">
                    {this.state.error && this.state.error.toString()}
                    <br />
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
            
            <button
              onClick={() => window.location.reload()}
              className="bg-telegram-accent text-white px-6 py-2 rounded-lg font-semibold hover:bg-telegram-accent/80 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
