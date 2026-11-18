import React, { useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useSelector } from "react-redux";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronLeft, ChevronUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { RootState } from "@/app/store";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import SubmitterLink from "@/components/common/SubmitterLink";
import CommentThread from "@/components/discussion/CommentThread";
import { solutionsTabPath, timeAgo } from "@/components/discussion/discussionKit";
import { EDITORIAL_PROSE } from "@/components/contest/editorialKit";
import { deleteSolution, getPost, moderatePost, votePost } from "@/services/Discussion/posts";
import type { PostDetail } from "@/models/post";
import { cn } from "@/lib/utils";

/** 用户题解详情 /post/:id[?contest_id=]：正文、投票、评论区 */
export default function PostPage() {
  const { id } = useParams();
  const postId = Number(id);
  const [search] = useSearchParams();
  const contestId = Number(search.get("contest_id")) || undefined;
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { isAuthenticated } = useSelector((s: RootState) => s.auth);
  const [busy, setBusy] = useState(false);

  const queryKey = ["post", postId, contestId ?? null];
  const { data, error, isLoading } = useQuery({
    queryKey,
    queryFn: () => getPost(postId, contestId),
    enabled: !!postId,
    retry: false,
  });

  const refresh = async (next?: PostDetail) => {
    if (next) qc.setQueryData(queryKey, next);
    await qc.invalidateQueries({ queryKey: ["solutions"] });
    await qc.invalidateQueries({ queryKey: ["commentSummary"] });
    await qc.invalidateQueries({ queryKey: ["contestDiscussion"] });
  };

  const run = async (fn: () => Promise<PostDetail | unknown>, done: string) => {
    setBusy(true);
    try {
      const res = await fn();
      toast.success(done);
      await refresh(res && typeof res === "object" && "id" in res ? (res as PostDetail) : undefined);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "操作失败");
    } finally {
      setBusy(false);
    }
  };

  const vote = async (want: -1 | 1) => {
    if (!data) return;
    if (!isAuthenticated) {
      toast.info("登录后才能投票");
      return;
    }
    const value = data.my_vote === want ? 0 : want;
    try {
      const res = await votePost(data.id, value);
      qc.setQueryData<PostDetail>(queryKey, (old) => (old ? { ...old, score: res.score, my_vote: res.my_vote } : old));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "投票失败");
    }
  };

  if (isLoading) {
    return (
      <Page>
        <div className="flex items-center gap-2 py-16 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" /> 加载中
        </div>
      </Page>
    );
  }
  if (error || !data) {
    return (
      <Page>
        <div className="py-16 text-sm text-slate-500">{error instanceof Error ? error.message : "题解不存在"}</div>
      </Page>
    );
  }

  const published = data.status === "PUBLISHED";
  const canVote = published && !data.hidden;
  const when = timeAgo(data.published_at ?? data.updated_at);
  const back = solutionsTabPath(data.pid, contestId);

  return (
    <Page>
      <Helmet>
        <title>{`${data.title} - ${data.pid} 题解 - SEUOJ`}</title>
      </Helmet>
      <div className="space-y-1">
        <Link to={back} className="inline-flex items-center text-xs text-slate-500 hover:text-slate-900">
          <ChevronLeft className="h-3.5 w-3.5" />
          {data.pid}. {data.problem_title} 的题解
        </Link>
      </div>

      <article className="flex gap-3">
        {canVote && (
          <div className="flex w-8 shrink-0 flex-col items-center pt-1 text-slate-400">
            <button
              type="button"
              aria-label="赞"
              aria-pressed={data.my_vote === 1}
              onClick={() => vote(1)}
              className={cn("rounded hover:bg-slate-100 hover:text-orange-600", data.my_vote === 1 && "text-orange-600")}
            >
              <ChevronUp className="h-7 w-7" />
            </button>
            <span
              className={cn(
                "text-sm font-semibold tabular-nums",
                data.my_vote === 1 ? "text-orange-600" : data.my_vote === -1 ? "text-indigo-600" : "text-slate-700"
              )}
            >
              {data.score}
            </span>
            <button
              type="button"
              aria-label="踩"
              aria-pressed={data.my_vote === -1}
              onClick={() => vote(-1)}
              className={cn("rounded hover:bg-slate-100 hover:text-indigo-600", data.my_vote === -1 && "text-indigo-600")}
            >
              <ChevronDown className="h-7 w-7" />
            </button>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {data.featured && <span className="rounded bg-amber-100 px-1.5 py-px text-xs text-amber-800">精选</span>}
            {!published && <span className="rounded bg-slate-100 px-1.5 py-px text-xs text-slate-600">草稿，只有你看得到</span>}
            {data.hidden && (
              <span className="rounded bg-red-50 px-1.5 py-px text-xs text-red-700">
                已被管理者隐藏{data.hidden_reason ? `：${data.hidden_reason}` : ""}
              </span>
            )}
          </div>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">{data.title}</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
            {data.author && (
              <SubmitterLink
                username={data.author.username}
                nickname={data.author.nickname ?? undefined}
                userId={data.author.id}
                className="font-medium text-slate-700 hover:underline"
              />
            )}
            {when.text && <span title={when.title}>{published ? `发布于 ${when.text}` : `保存于 ${when.text}`}</span>}
            <div className="ml-auto flex flex-wrap items-center gap-3">
              {data.mine && (
                <Link
                  to={`/post/${data.id}/edit${contestId ? `?contest=${contestId}` : ""}`}
                  className="text-slate-500 hover:text-slate-900"
                >
                  编辑
                </Link>
              )}
              {(data.mine || data.can_manage) && (
                <button
                  type="button"
                  disabled={busy}
                  className="text-slate-500 hover:text-red-600"
                  onClick={async () => {
                    if (!window.confirm("删除这篇题解？下面的评论也会一起看不到。")) return;
                    setBusy(true);
                    try {
                      await deleteSolution(data.id);
                      toast.success("已删除");
                      await refresh();
                      navigate(back);
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : "删除失败");
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  删除
                </button>
              )}
              {data.can_manage && published && !data.hidden && (
                <button
                  type="button"
                  disabled={busy}
                  className="text-slate-500 hover:text-amber-700"
                  onClick={() =>
                    run(() => moderatePost(data.id, { featured: !data.featured }, contestId), data.featured ? "已取消精选" : "已设为精选")
                  }
                >
                  {data.featured ? "取消精选" : "设为精选"}
                </button>
              )}
              {data.can_manage && published && (
                <button
                  type="button"
                  disabled={busy}
                  className="text-slate-500 hover:text-red-600"
                  onClick={() => {
                    if (data.hidden) {
                      run(() => moderatePost(data.id, { hidden: false }, contestId), "已取消隐藏");
                      return;
                    }
                    const reason = window.prompt("隐藏原因（作者能看到，可留空）", "");
                    if (reason === null) return;
                    run(() => moderatePost(data.id, { hidden: true, reason }, contestId), "已隐藏");
                  }}
                >
                  {data.hidden ? "取消隐藏" : "隐藏"}
                </button>
              )}
            </div>
          </div>
          <div className={cn(EDITORIAL_PROSE, "mt-6")}>
            <MarkdownRenderer highlightCode>{data.content}</MarkdownRenderer>
          </div>
        </div>
      </article>

      <section className="space-y-4 border-t border-slate-200 pt-6">
        <h2 className="text-sm font-bold text-slate-900">评论</h2>
        {canVote && data.allow_comment ? (
          <CommentThread
            mode={{ kind: "thread", target: { target_type: "POST", post_id: data.id } }}
            contestId={contestId}
          />
        ) : (
          <p className="text-sm text-slate-400">题解公开后才能评论。</p>
        )}
      </section>
    </Page>
  );
}

function Page({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-4xl space-y-6 px-5 py-6 md:px-8">{children}</div>
    </div>
  );
}
