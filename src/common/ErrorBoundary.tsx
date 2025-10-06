import React, { Component, ErrorInfo, ReactNode } from 'react';
import styles from './ErrorBoundary.module.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.errorBoundary}>
        <div className={styles.errorContent}>
          <h1>😵 Something went wrong</h1>
          <p>Sorry, the app encountered an error. Please try refreshing the page or return to the home page.</p>
          <div className={styles.errorActions}>
            <button 
              className={styles.retryButton}
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
            <button 
              className={styles.homeButton}
              onClick={() => window.location.href = '/'}
            >
              Back to Home
            </button>
          </div>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className={styles.errorDetails}>
              <summary>Error Details (Development Mode)</summary>
              <pre>{this.state.error.toString()}</pre>
            </details>
          )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
