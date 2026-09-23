import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
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

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 bg-surface border border-red-500/20 rounded-3xl text-center space-y-4 my-6">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-400">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-bold text-text-main">
            {this.props.fallbackTitle || 'Хуудас ачаалахад алдаа гарлаа'}
          </h2>
          <p className="text-sm text-text-muted max-w-md">
            {this.state.error?.message || 'Системийн түр зуурын алдаа гарсан байна.'}
          </p>
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
      );
    }

    return this.props.children;
  }
}
