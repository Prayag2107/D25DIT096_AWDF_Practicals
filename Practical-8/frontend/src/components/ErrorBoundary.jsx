import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Route-level ErrorBoundary to capture chunk load failures and render fallback UI
 * instead of leaving the application in a blank or crashed state.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    // If it's a dynamic import failure due to a new deploy or network interruption
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="card" style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center', borderColor: 'var(--danger)', padding: '2.5rem' }}>
          <AlertTriangle size={48} style={{ color: 'var(--danger)', margin: '0 auto 1rem' }} />
          <h2 style={{ marginBottom: '0.75rem', color: 'var(--text-main)' }}>Chunk Loading Error</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            {this.state.error?.message || 'A network error occurred while loading this page chunk.'}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={this.handleReload}>
              <RefreshCw size={16} /> Reload Page
            </button>
            <button className="btn btn-outline" onClick={this.handleReset}>
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
