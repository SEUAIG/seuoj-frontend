import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Replaces the default card when provided. */
  fallback?: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Catches render/lifecycle errors in its subtree so one broken page cannot
 * unmount the whole application (which shows up as a blank white screen).
 * Pass a `key` (for example the current pathname) to reset it on navigation.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Keep the original stack in the console for troubleshooting.
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  private handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center p-6">
        <div className="w-full max-w-lg rounded-lg border bg-card p-6 text-center shadow-sm">
          <h2 className="text-lg font-semibold">页面出错了</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            这个页面渲染时遇到了未处理的异常，其他页面不受影响。
          </p>
          <p className="mt-3 max-h-32 overflow-auto break-all rounded bg-muted px-3 py-2 text-left text-xs text-muted-foreground">
            {error.message || String(error)}
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={this.handleRetry}
              className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
            >
              重试
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90"
            >
              刷新页面
            </button>
          </div>
        </div>
      </div>
    );
  }
}
