interface ProblemAccessStateProps {
  code?: number | null;
  className?: string;
}

export default function ProblemAccessState({
  code,
  className = "",
}: ProblemAccessStateProps) {
  const resolvedCode = Number(code);
  const isNotFound = resolvedCode === 40401;
  const isDeleted = resolvedCode === 40402;

  const title = isNotFound
    ? "题目不存在"
    : isDeleted
      ? "题目已删除"
      : "加载题目失败";
  const description = isNotFound
    ? "该题目不存在，可能 PID 输入有误。"
    : isDeleted
      ? "该题目已被删除，暂时无法访问。"
      : "请稍后重试，或返回上一页。";

  const handleBack = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const from = params.get("from");
      if (from) {
        if (from.startsWith("/")) {
          window.location.assign(from);
          return;
        }
      }
      if (document.referrer) {
        const ref = new URL(document.referrer);
        if (ref.origin === window.location.origin) {
          window.location.assign(ref.toString());
          return;
        }
      }
    } catch {}
    window.location.assign("/problemsLibrary");
  };

  return (
    <div className={`w-full h-full flex items-center justify-center p-6 ${className}`}>
      <div className="max-w-md w-full rounded-xl border bg-white p-6 text-center space-y-3">
        <div className="text-xl font-semibold">{title}</div>
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="pt-2">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center rounded-md border px-4 py-2 text-sm hover:bg-muted"
          >
            返回上一页
          </button>
        </div>
      </div>
    </div>
  );
}
