import { Component } from 'react';
import PropTypes from 'prop-types';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="card max-w-md w-full p-8 text-center">
            <div className="text-5xl mb-3">😕</div>
            <h1 className="text-xl font-bold text-gray-900">Something went wrong</h1>
            <p className="text-sm text-gray-500 mt-2 break-words">{String(this.state.error.message || this.state.error)}</p>
            <div className="mt-5 flex justify-center gap-2">
              <button onClick={() => window.location.reload()} className="btn-primary">Reload</button>
              <button onClick={this.reset} className="btn-secondary">Try again</button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = { children: PropTypes.node };
