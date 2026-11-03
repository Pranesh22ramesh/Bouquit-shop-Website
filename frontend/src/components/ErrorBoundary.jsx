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
        <div className="min-h-screen flex items-center justify-center bg-[#FAF5EF] text-[#30232A] px-4 dark:bg-[#171116] dark:text-[#FAF5EF]">
          <div className="max-w-md w-full text-center p-8 rounded-3xl border border-[#E8DDD5] bg-white/90 shadow-2xl backdrop-blur-xl dark:border-[#493640] dark:bg-[#261B22]/90">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#F5EAE9] dark:bg-[#30232A] text-2xl flex items-center justify-center">
              🌸
            </div>
            <h1 className="text-2xl font-serif font-bold text-[#651F3C] dark:text-[#D5B36C] mb-2">
              MIDHUNYAS Petals
            </h1>
            <p className="text-sm text-[#81747A] dark:text-[#8E7A83] mb-6">
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
                className="px-6 py-2.5 rounded-full bg-[#651F3C] hover:bg-[#4D172D] text-white font-medium text-xs shadow-lg shadow-[#651F3C]/20 transition-all active:scale-95"
              >
                Reload Store
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="px-6 py-2.5 rounded-full border border-[#E8DDD5] dark:border-[#493640] font-medium text-xs hover:bg-[#F5EAE9] dark:hover:bg-[#30232A] transition-all active:scale-95"
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
