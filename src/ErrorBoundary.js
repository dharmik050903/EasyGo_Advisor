import React from 'react';
import { Calendar, CheckCircle2, BarChart3 } from 'lucide-react';

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the whole app.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      statsAnimated: false
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console or error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  componentDidUpdate(prevProps, prevState) {
    // Trigger stats animation when error boundary is shown
    if (this.state.hasError && !prevState.hasError && !this.state.statsAnimated) {
      setTimeout(() => {
        this.setState({ statsAnimated: true });
      }, 300);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 px-4 relative overflow-hidden">
          {/* Animated background particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-red-300 rounded-full opacity-30 animate-pulse" style={{ animationDelay: '0s', animationDuration: '2s' }}></div>
            <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-red-400 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '0.5s', animationDuration: '3s' }}></div>
            <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-red-300 rounded-full opacity-25 animate-pulse" style={{ animationDelay: '1s', animationDuration: '2.5s' }}></div>
            <div className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-red-400 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1.5s', animationDuration: '3.5s' }}></div>
          </div>
          
          <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center relative z-10 transform transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
            <style>{`
              @keyframes float {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                50% { transform: translateY(-20px) rotate(5deg); }
              }
              @keyframes pulse-glow {
                0%, 100% { 
                  transform: scale(1);
                  filter: drop-shadow(0 0 10px rgba(220, 38, 38, 0.5));
                }
                50% { 
                  transform: scale(1.1);
                  filter: drop-shadow(0 0 20px rgba(220, 38, 38, 0.8));
                }
              }
              @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
              }
              @keyframes slideInUp {
                from {
                  opacity: 0;
                  transform: translateY(20px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
              .animate-float {
                animation: float 3s ease-in-out infinite;
              }
              .animate-pulse-glow {
                animation: pulse-glow 2s ease-in-out infinite;
              }
              .animate-shake {
                animation: shake 0.5s ease-in-out;
              }
              .animate-slide-in-up {
                animation: slideInUp 0.6s ease-out forwards;
              }
              .delay-100 { animation-delay: 0.1s; opacity: 0; }
              .delay-200 { animation-delay: 0.2s; opacity: 0; }
              .delay-300 { animation-delay: 0.3s; opacity: 0; }
              .delay-400 { animation-delay: 0.4s; opacity: 0; }
              .delay-500 { animation-delay: 0.5s; opacity: 0; }
              @keyframes countUp {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
              }
              .animate-count-up {
                animation: countUp 0.8s ease-out forwards;
              }
              .stat-card {
                background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
                border: 1px solid rgba(220, 38, 38, 0.1);
                transition: all 0.3s ease;
              }
              .stat-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 25px rgba(220, 38, 38, 0.15);
              }
            `}</style>
            
            <div className="mb-6 animate-float">
              <svg
                className="mx-auto h-20 w-20 text-red-600 animate-pulse-glow"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4 animate-slide-in-up delay-100">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-6 animate-slide-in-up delay-200">
              We're sorry, but something unexpected happened. Please try refreshing the page or contact us if the problem persists.
            </p>
            
            {/* Statistics Section */}
            <div className="mb-6 animate-slide-in-up delay-300">
              <div className="grid grid-cols-1 gap-4">
                <StatCard
                  value={20}
                  suffix="+"
                  label="Years of Experience"
                  icon={<Calendar className="w-6 h-6 text-red-600" />}
                  animated={this.state.statsAnimated}
                  delay={0}
                />
                <StatCard
                  value={500}
                  suffix="+"
                  label="Success Visa"
                  icon={<CheckCircle2 className="w-6 h-6 text-green-600" />}
                  animated={this.state.statsAnimated}
                  delay={200}
                />
                <StatCard
                  value={98}
                  suffix="%"
                  label="Visa Ratio"
                  icon={<BarChart3 className="w-6 h-6 text-red-600" />}
                  animated={this.state.statsAnimated}
                  delay={400}
                />
              </div>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left animate-slide-in-up delay-400">
                <summary className="cursor-pointer text-sm text-gray-500 mb-2 hover:text-gray-700 transition-colors">
                  Error Details (Development Only)
                </summary>
                <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-40 animate-slide-in-up">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            <div className="space-y-3 animate-slide-in-up delay-500">
              <button
                onClick={this.handleReset}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transform hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:from-gray-300 hover:to-gray-400 transform hover:scale-105 active:scale-95 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Statistics Card Component with Animated Counter
class StatCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }

  componentDidMount() {
    if (this.props.animated) {
      setTimeout(() => {
        this.animateCounter();
      }, this.props.delay || 0);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.animated && !prevProps.animated) {
      setTimeout(() => {
        this.animateCounter();
      }, this.props.delay || 0);
    }
  }

  componentWillUnmount() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  animateCounter = () => {
    const { value } = this.props;
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = value / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;
    this.timer = setInterval(() => {
      currentStep++;
      const newCount = Math.min(Math.ceil(increment * currentStep), value);
      this.setState({ count: newCount });

      if (currentStep >= steps) {
        clearInterval(this.timer);
        this.setState({ count: value });
        this.timer = null;
      }
    }, stepDuration);
  };

  render() {
    const { suffix, label, icon } = this.props;
    const { count } = this.state;

    return (
      <div className="stat-card rounded-xl p-4 animate-count-up" style={{ animationDelay: `${(this.props.delay || 0)}ms`, opacity: 0 }}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center justify-center">{icon}</div>
              <div className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                {count}{suffix}
              </div>
            </div>
            <div className="text-sm text-gray-600 font-medium">{label}</div>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;

