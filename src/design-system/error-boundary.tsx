import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { Button } from './button';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  resetKeys?: unknown[];
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Client-side debugging log
    console.error('Unhandled Tool Error caught by ErrorBoundary:', error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    if (this.state.hasError && this.props.resetKeys && prevProps.resetKeys) {
      const keysChanged = this.props.resetKeys.some(
        (key, idx) => key !== prevProps.resetKeys?.[idx]
      );
      if (keysChanged) {
        this.resetState();
      }
    }
  }

  resetState = (): void => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleResetTool = (): void => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.replace(/^#\/?/, ''));
      const toolId = params.get('tool');
      if (toolId) {
        window.location.hash = `#tool=${encodeURIComponent(toolId)}`;
      } else {
        window.location.hash = '';
      }
    }
    this.resetState();
  };

  handleGoHome = (): void => {
    if (typeof window !== 'undefined') {
      window.location.hash = '';
    }
    this.resetState();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="max-w-xl mx-auto my-12 p-6 sm:p-8 bg-white border border-rose-200 rounded-3xl shadow-sm text-slate-800">
          <div className="flex items-center gap-3 text-rose-600 mb-4">
            <div className="p-3 bg-rose-50 rounded-2xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Tool Failed to Load</h2>
              <p className="text-xs text-rose-600 font-medium">Invalid or corrupted parameters</p>
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            This tool could not be loaded because the shared link parameters or calculation state are malformed or incompatible with this version.
          </p>

          {this.state.error?.message && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 mb-6 font-mono text-xs text-slate-700 overflow-x-auto">
              {this.state.error.message}
            </div>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="primary"
              size="sm"
              onClick={this.handleResetTool}
              className="gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Tool to Defaults</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={this.handleGoHome}
              className="gap-1.5 cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Back to All Tools</span>
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
