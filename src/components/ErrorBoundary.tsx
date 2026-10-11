import React, { Component, ErrorInfo, ReactNode } from 'react';
import { clearAppState } from '../services/storage';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in RationSaathi component tree:', error, errorInfo);
  }

  private handleReset = () => {
    clearAppState();
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-100 flex items-center justify-center p-6 text-stone-900">
          <div className="max-w-lg w-full bg-white rounded-xl shadow-lg border border-stone-200 p-8 text-center">
            <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              !
            </div>
            <h1 className="text-xl font-bold text-stone-900 mb-2">Something unexpected happened</h1>
            <p className="text-sm text-stone-600 mb-6">
              RationSaathi encountered an unexpected display error. Your local records are protected. You can try refreshing or resetting the temporary browser storage.
            </p>
            {this.state.error && (
              <pre className="text-xs bg-stone-50 border border-stone-200 p-3 rounded text-left overflow-auto mb-6 text-stone-700 max-h-32">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-stone-800 text-white rounded-lg text-sm font-medium hover:bg-stone-900 transition"
              >
                Reload application
              </button>
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition"
              >
                Reset all data
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
