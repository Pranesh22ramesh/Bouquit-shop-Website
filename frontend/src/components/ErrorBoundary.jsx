import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CRITICAL: React Error Boundary caught an unhandled error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-[#FFF9F6] text-[#2D2D2D] px-4 dark:bg-[#121212] dark:text-zinc-100">
          <div className="max-w-md w-full text-center p-8 rounded-3xl border border-[#E8E5E0] bg-white/80 shadow-2xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/80">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-pink-100 dark:bg-pink-950/40 text-2xl flex items-center justify-center">
              🌸
            </div>
            <h1 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-2">
              MIDHUNYAS Petals
            </h1>
            <p className="text-sm text-gray-600 dark:text-zinc-400 mb-6">
              A temporary display glitch occurred while rendering. We apologize for the inconvenience.
            </p>
            {this.state.error && process.env.NODE_ENV !== 'production' && (
              <pre className="text-left text-xs bg-red-50 text-red-700 p-3 rounded-xl mb-6 overflow-auto max-h-32 dark:bg-red-950/40 dark:text-red-300">
                {String(this.state.error?.message || this.state.error)}
              </pre>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={this.handleReload}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 text-white font-medium text-xs shadow-lg hover:shadow-pink-500/30 transition-all active:scale-95"
              >
                Reload Store
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="px-6 py-2.5 rounded-full border border-gray-300 dark:border-zinc-700 font-medium text-xs hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all active:scale-95"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
