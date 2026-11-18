import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { Loader2, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSolutions } from "@/services/Discussion/posts";
import type { SolutionItem } from "@/models/post";
import { postPath, timeAgo } from "@/components/discussion/discussionKit";
import { cn } from "@/lib/utils";

interface SolutionListProps {
  pid: string;
  /** 从比赛进来时带上，链接都留在比赛里 */
  contestId?: number;
}

/** 题目「题解」标签：精选在前，其余按净分；第 1 页顶上是我自己的草稿和被隐藏的 */
export default function SolutionList({ pid, contestId }: SolutionListProps) {
  const [page, setPage] = useState(1);
  const { isAuthenticated } = useSelector((s: RootState) => s.auth);
  const { data, error, isLoading } = useQuery({
    queryKey: ["solutions", pid, contestId ?? null, page],
    queryFn: () => getSolutions(pid, contestId, page),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-10 text-sm text-slate-400">
        <Loader2 className="h-4 w-4 animate-spin" /> 加载题解
      </div>
    );
  }
  if (error || !data) {
    return <div className="py-10 text-sm text-slate-500">{error instanceof Error ? error.message : "题解加载失败"}</div>;
  }

  const newPath = `/post/new?problem=${encodeURIComponent(pid)}${contestId ? `&contest=${contestId}` : ""}`;
  const why = !isAuthenticated
    ? "登录后才能写题解"
    : !data.has_accepted
    ? "AC 这道题之后才能写题解"
    : data.my_count >= data.max_per_problem
      ? `每道题最多写 ${data.max_per_problem} 篇`
      : null;
  const pages = Math.max(1, Math.ceil(data.total / Math.max(1, data.size)));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-slate-500">{data.total} 篇题解</span>
        <div className="flex items-center gap-2">
          {why && <span className="text-xs text-slate-400">{why}</span>}
          {data.can_post ? (
            <Button asChild size="sm" className="gap-1.5">
              <Link to={newPath}>
                <PenLine className="h-4 w-4" />
                写题解
              </Link>
            </Button>
          ) : (
            <Button size="sm" className="gap-1.5" disabled title={why ?? undefined}>
              <PenLine className="h-4 w-4" />
              写题解
            </Button>
          )}
        </div>
      </div>

      {data.mine_pending.length > 0 && (
        <section className="rounded-md border border-dashed border-slate-300">
          <div className="border-b border-dashed border-slate-200 px-3 py-1.5 text-xs text-slate-500">
            只有你看得到
          </div>
          <ul>
            {data.mine_pending.map((s) => (
              <Row key={s.id} item={s} contestId={contestId} />
            ))}
          </ul>
        </section>
      )}

      {data.items.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">还没有题解。</p>
      ) : (
        <ul className="border-t border-slate-100">
          {data.items.map((s) => (
            <Row key={s.id} item={s} contestId={contestId} />
          ))}
        </ul>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2 text-sm">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            上一页
          </Button>
          <span className="text-slate-500">
            {page} / {pages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
            下一页
          </Button>
        </div>
      )}
    </div>
  );
}

function Row({ item, contestId }: { item: SolutionItem; contestId?: number }) {
  const when = timeAgo(item.published_at ?? item.updated_at);
  const name = item.author ? item.author.nickname || item.author.username : "";
  return (
    <li className="border-b border-slate-100 last:border-b-0">
      <Link to={postPath(item.id, contestId)} className="flex items-center gap-3 px-3 py-3 hover:bg-slate-50">
        <span
          title="净分（赞 − 踩）"
          className={cn(
            "w-10 shrink-0 text-center text-sm font-semibold tabular-nums",
            item.score > 0 ? "text-orange-600" : item.score < 0 ? "text-indigo-600" : "text-slate-400"
          )}
        >
          {item.score}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {item.featured && <span className="rounded bg-amber-100 px-1.5 py-px text-xs text-amber-800">精选</span>}
            {item.status === "DRAFT" && <span className="rounded bg-slate-100 px-1.5 py-px text-xs text-slate-600">草稿</span>}
            {item.hidden && <span className="rounded bg-red-50 px-1.5 py-px text-xs text-red-700">已隐藏</span>}
            <span className="truncate text-sm font-medium text-slate-900">{item.title}</span>
          </div>
          <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-slate-400">
            {name && <span>{name}</span>}
            <span title={when.title}>{when.text}</span>
          </div>
        </div>
        <span
          className={cn("shrink-0 text-xs tabular-nums text-slate-500", item.comment_count === 0 && "opacity-40")}
          aria-label={`评论 ${item.comment_count} 条`}
        >
          💬 {item.comment_count}
        </span>
      </Link>
    </li>
  );
}
