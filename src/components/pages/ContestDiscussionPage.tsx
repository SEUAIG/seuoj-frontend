import React from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { FileText, Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import ContestShell from "@/components/contest/ContestShell";
import CommentThread from "@/components/discussion/CommentThread";
import { letterOf, parseTime } from "@/components/contest/contestKit";
import { EDITORIAL_PROSE, fileSize } from "@/components/contest/editorialKit";
import useQueryToGetContestDetail from "@/hooks/useQueryToGetContestDetail";
import { getContestDiscussion, openEditorialAttachment } from "@/services/Contest/discussion";
import type { ContestEditorial } from "@/models/contest";
import { cn } from "@/lib/utils";

const fmt = (s?: string | null) => {
  const d = parseTime(s ?? undefined);
  return d ? format(d, "yyyy-MM-dd HH:mm") : "";
};

/** 管理者看到的状态说明：选手此刻能不能看到、什么时候能看到 */
function editorialState(e: ContestEditorial) {
  if (e.status === "DRAFT") return { text: "草稿，选手看不到", tone: "text-amber-700" };
  if (e.visible) return { text: "已公开", tone: "text-emerald-700" };
  if (e.visible_after) return { text: `已发布，${fmt(e.visible_after)} 后对选手公开（且比赛已结束）`, tone: "text-sky-700" };
  return { text: "已发布，比赛结束后对选手公开", tone: "text-sky-700" };
}

export default function ContestDiscussionPage() {
  const { id } = useParams();
  const contestId = Number(id);
  const { data: detail } = useQueryToGetContestDetail(contestId);
  const { data, error, isLoading } = useQuery({
    queryKey: ["contestDiscussion", contestId],
    queryFn: () => getContestDiscussion(contestId),
    enabled: !!contestId,
    retry: false,
  });

  const editorial = data?.editorial ?? null;
  const canManage = data?.can_manage ?? false;
  const [opening, setOpening] = React.useState<number | null>(null);

  const open = async (attachmentId: number) => {
    setOpening(attachmentId);
    try {
      await openEditorialAttachment(contestId, attachmentId);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "打开附件失败");
    } finally {
      setOpening(null);
    }
  };

  return (
    <ContestShell contestId={contestId} tab="discussion">
      <Helmet>
        <title>{detail?.title ? `讨论 - ${detail.title} - SEUOJ` : "讨论 - SEUOJ"}</title>
      </Helmet>
      {isLoading ? (
        <div className="flex items-center gap-2 py-16 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" /> 加载中
        </div>
      ) : error || !data ? (
        <div className="py-16 text-sm text-slate-500">{error instanceof Error ? error.message : "加载失败"}</div>
      ) : (
        <div className="max-w-4xl space-y-12">
          {canManage && (
            <div className="space-y-1 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] text-slate-600">
              <p>你是比赛管理者，随时能看到这一页。选手要等比赛结束后才能看到。</p>
              {!data.discussion_enabled && (
                <p className="text-amber-700">
                  本场没有开启「展示题解与讨论页面」，选手看不到这一页。需要的话在
                  <Link to={`/contest/${contestId}/edit`} className="mx-1 underline underline-offset-2">
                    比赛设置
                  </Link>
                  里打开。
                </p>
              )}
            </div>
          )}

          <section>
            <div className="flex items-end justify-between gap-4 border-b border-slate-900 pb-2.5">
              <span className="text-[13px] font-bold tracking-wide">官方题解</span>
              {canManage && (
                <Button asChild size="sm" variant="outline" className="h-7 gap-1.5 text-xs">
                  <Link to={`/contest/${contestId}/discussion/editorial`}>
                    <Pencil className="h-3.5 w-3.5" />
                    {editorial ? "编辑" : "写官方题解"}
                  </Link>
                </Button>
              )}
            </div>
            {editorial ? (
              <article className="pt-5">
                <h2 className="text-xl font-bold text-slate-900">{editorial.title}</h2>
                <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                  {editorial.author_name && <span>{editorial.author_name}</span>}
                  {editorial.status === "PUBLISHED" && editorial.published_at && (
                    <span>发布于 {fmt(editorial.published_at)}</span>
                  )}
                  {canManage && (
                    <span className={cn("font-medium", editorialState(editorial).tone)}>
                      {editorialState(editorial).text}
                    </span>
                  )}
                </div>
                {editorial.attachments.length > 0 && (
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {editorial.attachments.map((a) => (
                      <li key={a.id}>
                        <button
                          type="button"
                          onClick={() => open(a.id)}
                          disabled={opening === a.id}
                          className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:border-slate-400 hover:text-slate-900 disabled:opacity-60"
                          title="在新标签页打开"
                        >
                          {opening === a.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <FileText className="h-4 w-4 text-red-600" />
                          )}
                          {a.file_name}
                          <span className="text-xs text-slate-400">{fileSize(a.file_size)}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {editorial.content.trim() && (
                  <div className={cn(EDITORIAL_PROSE, "mt-6")}>
                    <MarkdownRenderer highlightCode>{editorial.content}</MarkdownRenderer>
                  </div>
                )}
              </article>
            ) : (
              <p className="py-6 text-sm text-slate-400">
                {canManage ? "还没有官方题解。" : "本场比赛暂时没有官方题解。"}
              </p>
            )}
          </section>

          <section>
            <div className="border-b border-slate-900 pb-2.5 text-[13px] font-bold tracking-wide">题目</div>
            {data.problems.length === 0 ? (
              <p className="py-6 text-sm text-slate-400">本场比赛没有题目。</p>
            ) : (
              <ul>
                {data.problems.map((p) => (
                  <li key={p.pid} className="flex items-baseline gap-4 border-b border-slate-100 py-3 text-sm">
                    <Link
                      to={`/contest/${contestId}/${p.pid}`}
                      className="flex min-w-0 flex-1 items-baseline gap-4 text-slate-700 hover:text-primary"
                    >
                      <span className="w-6 font-mono font-semibold text-slate-900">{letterOf(p.sort_order)}</span>
                      <span className="truncate">{p.title}</span>
                    </Link>
                    <Link
                      to={`/contest/${contestId}/${p.pid}/discussion`}
                      title={`讨论 ${p.comment_count} 条`}
                      aria-label={`讨论 ${p.comment_count} 条`}
                      className={cn(
                        "shrink-0 rounded px-1.5 tabular-nums text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                        p.comment_count === 0 && "opacity-40"
                      )}
                    >
                      💭 {p.comment_count}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <div className="border-b border-slate-900 pb-2.5 text-[13px] font-bold tracking-wide">
              关于整场比赛，你有什么分享/建议/吐槽？
            </div>
            <div className="pt-5">
              <CommentThread
                mode={{ kind: "thread", target: { target_type: "CONTEST", contest_id: contestId } }}
                contestId={contestId}
              />
            </div>
          </section>
        </div>
      )}
    </ContestShell>
  );
}
