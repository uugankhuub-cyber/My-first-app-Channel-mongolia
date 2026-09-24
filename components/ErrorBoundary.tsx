import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onBack?: () => void;
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
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleBack = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onBack) {
      this.props.onBack();
    } else if (typeof window !== 'undefined') {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = '/admin/articles';
      }
    }
  };

  public render() {
    if (this.state.hasError) {
      const errorMessage =
        this.state.error?.message ||
        (typeof this.state.error === 'string' ? this.state.error : 'Системийн түр зуурын алдаа гарсан байна.');

      return (
        <div className="min-h-[450px] flex flex-col items-center justify-center p-8 bg-surface border border-red-500/20 rounded-3xl text-center space-y-5 my-6 max-w-xl mx-auto shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 shadow-inner">
            <AlertTriangle size={32} />
          </div>

          <div className="space-y-2 w-full">
            <h2 className="text-xl font-bold text-text-main">
              {this.props.fallbackTitle || 'Хуудас ачаалахад алдаа гарлаа'}
            </h2>
            <div className="p-3.5 bg-red-500/5 border border-red-500/15 rounded-xl text-xs font-mono text-red-600 dark:text-red-400 text-left max-h-48 overflow-y-auto break-words whitespace-pre-wrap">
              {errorMessage}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={this.handleBack}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-surfaceHighlight hover:bg-border text-text-main font-semibold text-sm rounded-xl transition-all border border-border shadow-sm active:scale-95"
            >
              <ArrowLeft size={16} />
              Буцах
            </button>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-purple hover:bg-brand-purple/90 text-white font-semibold text-sm rounded-xl transition-all shadow-md active:scale-95"
            >
              <RefreshCw size={16} />
              Дахин ачааллах
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
