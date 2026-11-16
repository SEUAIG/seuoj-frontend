import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Replaces the default card when provided. */
  fallback?: ReactNode;
  /** 变化时（例如换路径）清除出错状态；不用 key，避免每次换路径整棵子树重挂载 */
  resetKey?: unknown;
}

interface State {
  error: Error | null;
}

const CHUNK_RELOAD_KEY = "seuoj:chunk-reload-at";
const CHUNK_ERROR_RE =
  /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i;

export function isChunkLoadError(error: unknown): boolean {
  return error instanceof Error && CHUNK_ERROR_RE.test(error.message);
}

/**
 * 新版本部署后旧 chunk 会 404，React.lazy 会缓存失败结果，只能整页刷新。
 * 10 秒内只自动刷新一次，防止新版本本身有问题时无限刷新。返回是否已触发刷新。
 */
export function reloadOnceForStaleChunk(): boolean {
  try {
    const last = Number(sessionStorage.getItem(CHUNK_RELOAD_KEY) || 0);
    if (Date.now() - last < 10_000) return false;
    sessionStorage.setItem(CHUNK_RELOAD_KEY, String(Date.now()));
  } catch {
    // sessionStorage 不可用时不自动刷新，避免没有防循环标记
    return false;
  }
  window.location.reload();
  return true;
}

/**
 * Catches render/lifecycle errors in its subtree so one broken page cannot
 * unmount the whole application (which shows up as a blank white screen).
 * Pass `resetKey` (for example the current pathname) to reset it on navigation.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Keep the original stack in the console for troubleshooting.
    console.error("[ErrorBoundary]", error, info.componentStack);
    if (isChunkLoadError(error)) reloadOnceForStaleChunk();
  }

  componentDidUpdate(prevProps: Props) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
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
