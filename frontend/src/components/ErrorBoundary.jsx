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
        <div className="min-h-screen flex items-center justify-center bg-[#F8F7F2] text-[#24382F] px-4 dark:bg-[#141D18] dark:text-[#F8F7F2]">
          <div className="max-w-md w-full text-center p-8 rounded-3xl border border-[#D7DDD4] bg-white/90 shadow-2xl backdrop-blur-xl dark:border-[#3F5144] dark:bg-[#1D2921]/90">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#F5EAE9] dark:bg-[#24382F] text-2xl flex items-center justify-center">

            </div>
            <h1 className="text-2xl font-serif font-bold text-[#254F3C] dark:text-[#D5B36C] mb-2">
              MIDHUNYAS Petals
            </h1>
            <p className="text-sm text-[#81747A] dark:text-[#8E7A83] mb-6">
              A temporary display glitch occurred while rendering. We apologize for the inconvenience.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={this.handleReload}
                className="px-6 py-2.5 rounded-full bg-[#254F3C] hover:bg-[#183D2B] text-white font-medium text-xs shadow-lg shadow-[#254F3C]/20 transition-all active:scale-95"
              >
                Reload Store
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="px-6 py-2.5 rounded-full border border-[#D7DDD4] dark:border-[#3F5144] font-medium text-xs hover:bg-[#F5EAE9] dark:hover:bg-[#24382F] transition-all active:scale-95"
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
