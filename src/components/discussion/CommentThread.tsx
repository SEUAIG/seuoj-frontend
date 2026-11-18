import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, CornerDownRight, Loader2, MoreHorizontal, Pin } from "lucide-react";
import { toast } from "sonner";
import type { RootState } from "@/app/store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MarkdownImageTextarea } from "@/components/common/MarkdownImageTextarea";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import SubmitterLink from "@/components/common/SubmitterLink";
import { timeAgo } from "@/components/discussion/discussionKit";
import RevisionsDialog from "@/components/discussion/RevisionsDialog";
import {
  createComment,
  deleteComment,
  editComment,
  getCommentSubtree,
  getCommentThread,
  moderateComment,
  voteComment,
} from "@/services/Discussion/comments";
import type { CommentItem, CommentThreadData, ThreadTarget } from "@/models/discussion";
import { cn } from "@/lib/utils";

const MAX_LENGTH = 2000;
/** 净分不高于这个值的发言默认折叠 */
const COLLAPSE_SCORE = -5;

export type ThreadMode =
  | { kind: "thread"; target: ThreadTarget }
  | { kind: "subtree"; commentId: number; contestId?: number };

interface CommentThreadProps {
  mode: ThreadMode;
  /** 打开时滚动到并高亮这条 */
  highlightId?: number;
  /** 「继续这个讨论」链接带上的比赛，用来链回比赛页 */
  contestId?: number;
  /** 拿到数据后通知页面（页面标题、返回链接要用） */
  onData?: (data: CommentThreadData) => void;
}

const PROSE =
  "prose prose-slate prose-sm max-w-none break-words prose-p:my-1.5 prose-pre:my-2 prose-pre:bg-transparent prose-pre:p-0 " +
  "prose-code:font-normal prose-code:before:content-none prose-code:after:content-none " +
  "[&_:not(pre)>code]:rounded [&_:not(pre)>code]:bg-slate-100 [&_:not(pre)>code]:px-1 [&_:not(pre)>code]:py-0.5";

function useNarrowScreen() {
  const query = "(max-width: 640px)";
  const [narrow, setNarrow] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setNarrow(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return narrow;
}

/** 同一层回复：净分高的在前，同分先发的在前 */
const byScore = (a: CommentItem, b: CommentItem) => b.score - a.score || a.id - b.id;

const subtreeLink = (id: number, contestId?: number, highlight?: number) => {
  const params = new URLSearchParams();
  if (contestId) params.set("contest_id", String(contestId));
  if (highlight) params.set("highlight", String(highlight));
  const qs = params.toString();
  return `/comment/${id}${qs ? `?${qs}` : ""}`;
};

export default function CommentThread({ mode, highlightId, contestId, onData }: CommentThreadProps) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((s: RootState) => s.auth);
  const narrow = useNarrowScreen();
  const maxLevel = narrow ? 3 : 6;
  const [sort, setSort] = useState<"hot" | "new">("hot");
  const [page, setPage] = useState(1);
  const [flash, setFlash] = useState<number | null>(null);

  const queryKey =
    mode.kind === "thread"
      ? [
          "comments",
          "thread",
          mode.target.target_type,
          mode.target.pid ?? null,
          mode.target.contest_id ?? null,
          mode.target.post_id ?? null,
          sort,
          page,
        ]
      : ["comments", "subtree", mode.commentId, mode.contestId ?? null];
  const { data, error, isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      mode.kind === "thread"
        ? getCommentThread(mode.target, sort, page)
        : getCommentSubtree(mode.commentId, mode.contestId),
    retry: false,
  });

  useEffect(() => {
    if (data) onData?.(data);
  }, [data, onData]);

  const refresh = useCallback(async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ["comments"] }),
      qc.invalidateQueries({ queryKey: ["commentSummary"] }),
      qc.invalidateQueries({ queryKey: ["contestDiscussion"] }),
    ]);
  }, [qc]);

  /** 投票后就地改分数，不重新拉取，免得列表因重新排序跳动 */
  const patchComment = useCallback(
    (id: number, patch: Partial<CommentItem>) => {
      qc.setQueriesData<CommentThreadData>({ queryKey: ["comments"] }, (old) =>
        old
          ? {
              ...old,
              comments: old.comments.map((c) => (c.id === id ? { ...c, ...patch } : c)),
              pinned: old.pinned.map((c) => (c.id === id ? { ...c, ...patch } : c)),
            }
          : old
      );
    },
    [qc]
  );

  const children = useMemo(() => {
    const map = new Map<number, CommentItem[]>();
    for (const c of data?.comments ?? []) {
      if (c.parent_id == null) continue;
      const list = map.get(c.parent_id) ?? [];
      list.push(c);
      map.set(c.parent_id, list);
    }
    for (const list of map.values()) list.sort(byScore);
    return map;
  }, [data]);

  const roots = useMemo(() => {
    if (!data) return [];
    if (mode.kind === "thread") return data.comments.filter((c) => c.parent_id == null);
    const byId = new Map(data.comments.map((c) => [c.id, c]));
    let top = data.focus_id != null ? byId.get(data.focus_id) : undefined;
    // 要高亮的那条比根深太多时会被收进「继续这个讨论」，改从它往上 maxLevel 层的祖先开始显示
    const target = highlightId != null ? byId.get(highlightId) : undefined;
    if (top && target && target.depth - top.depth > maxLevel) {
      let cur = target;
      for (let i = 0; i < maxLevel && cur.parent_id != null && byId.has(cur.parent_id); i++) {
        cur = byId.get(cur.parent_id)!;
      }
      top = cur;
    }
    return top ? [top] : [];
  }, [data, mode.kind, highlightId, maxLevel]);
  const shownFromAncestor = mode.kind === "subtree" && roots[0] && roots[0].id !== data?.focus_id;

  const scrollTo = useCallback((id: number) => {
    const el = document.getElementById(`comment-${id}`);
    if (!el) return false;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setFlash(id);
    window.setTimeout(() => setFlash((cur) => (cur === id ? null : cur)), 2500);
    return true;
  }, []);

  useEffect(() => {
    if (!highlightId || !data) return;
    const t = window.setTimeout(() => scrollTo(highlightId), 50);
    return () => window.clearTimeout(t);
  }, [highlightId, data, scrollTo]);

  const linkContest = contestId ?? data?.contest_id ?? undefined;
  const jumpToOriginal = (c: CommentItem) => {
    if (data?.comments.some((x) => x.id === c.id) && scrollTo(c.id)) return;
    navigate(subtreeLink(c.root_id, linkContest ?? undefined, c.id));
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-10 text-sm text-slate-400">
        <Loader2 className="h-4 w-4 animate-spin" /> 加载讨论
      </div>
    );
  }
  if (error || !data) {
    return <div className="py-10 text-sm text-slate-500">{error instanceof Error ? error.message : "讨论加载失败"}</div>;
  }

  const pages = Math.max(1, Math.ceil(data.total / Math.max(1, data.size)));
  const ctx: NodeContext = {
    data,
    children,
    maxLevel,
    flash,
    isAuthenticated,
    linkContest: linkContest ?? undefined,
    patchComment,
    refresh,
  };

  return (
    <div className="space-y-5">
      {mode.kind === "thread" &&
        (data.can_post ? (
          <Composer
            placeholder="说点什么……支持 Markdown 和公式"
            submitLabel="发言"
            onSubmit={async (content) => {
              await createComment({ ...mode.target, content });
              setSort("new");
              setPage(1);
              await refresh();
            }}
          />
        ) : (
          <p className="rounded-md border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500">
            <Link to="/login" className="text-primary underline-offset-2 hover:underline">
              登录
            </Link>
            后参与讨论
          </p>
        ))}

      {mode.kind === "thread" && (
        <div className="flex items-center justify-between border-b border-slate-200 pb-2 text-xs text-slate-500">
          <span>{data.total} 条发言</span>
          <div className="flex gap-1">
            {(["hot", "new"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setSort(s);
                  setPage(1);
                }}
                className={cn(
                  "rounded px-2 py-0.5",
                  sort === s ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"
                )}
              >
                {s === "hot" ? "最热" : "最新"}
              </button>
            ))}
          </div>
        </div>
      )}

      {data.pinned.length > 0 && (
        <section className="space-y-2 rounded-md border border-amber-200 bg-amber-50/60 px-3 py-2">
          <div className="flex items-center gap-1 text-xs font-medium text-amber-800">
            <Pin className="h-3.5 w-3.5" /> 置顶
          </div>
          {data.pinned.map((c) => (
            <div key={`pin-${c.id}`} className="flex gap-2">
              <div className="min-w-0 flex-1">
                <CommentBody comment={c} ctx={ctx} compact />
              </div>
              <button
                type="button"
                title="跳到原位置"
                aria-label="跳到原位置"
                onClick={() => jumpToOriginal(c)}
                className="self-start rounded p-1 text-slate-400 hover:bg-amber-100 hover:text-slate-900"
              >
                <CornerDownRight className="h-4 w-4" />
              </button>
            </div>
          ))}
        </section>
      )}

      {shownFromAncestor && roots[0].parent_id != null && (
        <Link
          to={subtreeLink(roots[0].parent_id, linkContest ?? undefined)}
          className="inline-block text-xs text-primary hover:underline"
        >
          ↑ 查看上层讨论
        </Link>
      )}

      {roots.length === 0 ? (
        <p className="py-6 text-sm text-slate-400">{mode.kind === "thread" ? "还没有人发言。" : "这条发言不存在。"}</p>
      ) : (
        <div className="space-y-4">
          {roots.map((c) => (
            <CommentNode key={c.id} comment={c} level={0} ctx={ctx} />
          ))}
        </div>
      )}

      {mode.kind === "thread" && pages > 1 && (
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

interface NodeContext {
  data: CommentThreadData;
  children: Map<number, CommentItem[]>;
  maxLevel: number;
  flash: number | null;
  isAuthenticated: boolean;
  linkContest?: number;
  patchComment: (id: number, patch: Partial<CommentItem>) => void;
  refresh: () => Promise<void>;
}

function CommentNode({ comment, level, ctx }: { comment: CommentItem; level: number; ctx: NodeContext }) {
  const kids = ctx.children.get(comment.id) ?? [];
  const [collapsed, setCollapsed] = useState(!comment.deleted && comment.score <= COLLAPSE_SCORE);
  const [replying, setReplying] = useState(false);
  const missing = comment.reply_count - kids.length;
  const tooDeep = level + 1 > ctx.maxLevel;

  return (
    <div id={`comment-${comment.id}`} className="scroll-mt-24">
      <div
        className={cn(
          "flex gap-2 rounded-md transition-colors duration-700",
          ctx.flash === comment.id && "bg-amber-100/80"
        )}
      >
        <VoteColumn comment={comment} ctx={ctx} />
        <div className="min-w-0 flex-1 py-0.5">
          {collapsed ? (
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              className="text-left text-xs text-slate-400 hover:text-slate-700"
            >
              [+] {comment.author ? comment.author.nickname || comment.author.username : "发言"}
              {comment.score <= COLLAPSE_SCORE && " · 分数过低已折叠"}
              {comment.reply_count > 0 && ` · ${comment.reply_count} 条回复`}
            </button>
          ) : (
            <>
              <CommentBody comment={comment} ctx={ctx} onReply={() => setReplying(true)} />
              {replying && (
                <div className="mt-2">
                  <Composer
                    autoFocus
                    placeholder="回复……"
                    submitLabel="回复"
                    onCancel={() => setReplying(false)}
                    onSubmit={async (content) => {
                      await createComment({ parent_id: comment.id, content });
                      setReplying(false);
                      await ctx.refresh();
                    }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {!collapsed && (kids.length > 0 || missing > 0) && (
        <div className="relative ml-3 mt-2 pl-4">
          <button
            type="button"
            aria-label="折叠这条和它的回复"
            title="折叠"
            onClick={() => setCollapsed(true)}
            className="group absolute bottom-0 left-0 top-0 w-3 -translate-x-1/2"
          >
            <span className="mx-auto block h-full w-px bg-slate-200 group-hover:bg-slate-500" />
          </button>
          {tooDeep ? (
            <Link
              to={subtreeLink(comment.id, ctx.linkContest)}
              className="text-xs text-primary hover:underline"
            >
              继续这个讨论 →
            </Link>
          ) : (
            <div className="space-y-3">
              {kids.map((k) => (
                <CommentNode key={k.id} comment={k} level={level + 1} ctx={ctx} />
              ))}
              {missing > 0 && (
                <Link
                  to={subtreeLink(comment.id, ctx.linkContest)}
                  className="block text-xs text-primary hover:underline"
                >
                  还有 {missing} 条回复，继续这个讨论 →
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function VoteColumn({ comment, ctx }: { comment: CommentItem; ctx: NodeContext }) {
  const [busy, setBusy] = useState(false);
  // 已删除、被隐藏的发言不能投票，也不显示分数
  const disabled = comment.deleted || comment.hidden;
  const cast = async (want: -1 | 1) => {
    if (!ctx.isAuthenticated) {
      toast.info("登录后才能投票");
      return;
    }
    if (busy || comment.deleted || comment.hidden) return;
    const value = comment.my_vote === want ? 0 : want;
    setBusy(true);
    try {
      const res = await voteComment(comment.id, value);
      ctx.patchComment(comment.id, { score: res.score, my_vote: res.my_vote });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "投票失败");
    } finally {
      setBusy(false);
    }
  };
  if (disabled) return <div className="w-6 shrink-0" />;
  return (
    <div className="flex w-6 shrink-0 flex-col items-center pt-0.5 text-slate-400">
      <button
        type="button"
        aria-label="赞"
        aria-pressed={comment.my_vote === 1}
        onClick={() => cast(1)}
        className={cn("rounded hover:bg-slate-100 hover:text-orange-600", comment.my_vote === 1 && "text-orange-600")}
      >
        <ChevronUp className="h-5 w-5" />
      </button>
      <span
        className={cn(
          "text-xs font-semibold tabular-nums",
          comment.my_vote === 1 ? "text-orange-600" : comment.my_vote === -1 ? "text-indigo-600" : "text-slate-600"
        )}
      >
        {comment.score}
      </span>
      <button
        type="button"
        aria-label="踩"
        aria-pressed={comment.my_vote === -1}
        onClick={() => cast(-1)}
        className={cn("rounded hover:bg-slate-100 hover:text-indigo-600", comment.my_vote === -1 && "text-indigo-600")}
      >
        <ChevronDown className="h-5 w-5" />
      </button>
    </div>
  );
}

function CommentBody({
  comment,
  ctx,
  compact = false,
  onReply,
}: {
  comment: CommentItem;
  ctx: NodeContext;
  compact?: boolean;
  onReply?: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const when = timeAgo(comment.created_at);
  const canManage = ctx.data.can_manage;
  const editedAt = timeAgo(comment.edited_at);

  const run = async (fn: () => Promise<unknown>, done: string) => {
    setBusy(true);
    try {
      await fn();
      toast.success(done);
      await ctx.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "操作失败");
    } finally {
      setBusy(false);
    }
  };

  if (comment.deleted) {
    return <p className="text-sm italic text-slate-400">[已删除]</p>;
  }
  if (comment.hidden && comment.content == null) {
    return <p className="text-sm italic text-slate-400">[已被管理者隐藏]</p>;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-400">
        {comment.author && (
          <SubmitterLink
            username={comment.author.username}
            nickname={comment.author.nickname ?? undefined}
            userId={comment.author.id}
            className="font-medium text-slate-700 hover:underline"
          />
        )}
        <span title={when.title}>{when.text}</span>
        {comment.revision > 1 && (
          <span title={editedAt.title ? `最后修改于 ${editedAt.title}` : undefined}>
            <RevisionsDialog commentId={comment.id} revision={comment.revision} />
          </span>
        )}
        {comment.pinned && !compact && <span title="已置顶">📌</span>}
        {comment.hidden && (
          <span className="rounded bg-amber-100 px-1.5 py-px text-amber-800">
            已隐藏{comment.hidden_reason ? `：${comment.hidden_reason}` : ""}
          </span>
        )}
      </div>
      {editing ? (
        <div className="mt-1">
          <Composer
            autoFocus
            initial={comment.content ?? ""}
            placeholder="修改发言……"
            submitLabel="保存修改"
            onCancel={() => setEditing(false)}
            onSubmit={async (content) => {
              await editComment(comment.id, content);
              setEditing(false);
              await ctx.refresh();
            }}
          />
        </div>
      ) : (
        <div className={cn(PROSE, "mt-1 text-slate-800")}>
          <MarkdownRenderer breaks highlightCode>
            {comment.content ?? ""}
          </MarkdownRenderer>
        </div>
      )}
      {!compact && (
        <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
          {ctx.data.can_post && !comment.hidden && onReply && (
            <button type="button" onClick={onReply} className="hover:text-slate-900">
              回复
            </button>
          )}
          {comment.mine && !editing && (
            <button type="button" onClick={() => setEditing(true)} className="hover:text-slate-900">
              编辑
            </button>
          )}
          {comment.can_delete && (
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                if (!window.confirm(comment.reply_count > 0 ? "删除这条发言？下面的回复会保留。" : "删除这条发言？")) return;
                run(() => deleteComment(comment.id), "已删除");
              }}
              className="hover:text-red-600"
            >
              删除
            </button>
          )}
          {canManage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" aria-label="管理" className="rounded hover:text-slate-900" disabled={busy}>
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {!comment.hidden && (
                  <DropdownMenuItem
                    onClick={() =>
                      run(
                        () => moderateComment(comment.id, { pinned: !comment.pinned }),
                        comment.pinned ? "已取消置顶" : "已置顶"
                      )
                    }
                  >
                    {comment.pinned ? "取消置顶" : "置顶"}
                  </DropdownMenuItem>
                )}
                {comment.hidden ? (
                  <DropdownMenuItem onClick={() => run(() => moderateComment(comment.id, { hidden: false }), "已取消隐藏")}>
                    取消隐藏
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() => {
                      const reason = window.prompt("隐藏原因（作者能看到，可留空）", "");
                      if (reason === null) return;
                      run(() => moderateComment(comment.id, { hidden: true, reason }), "已隐藏");
                    }}
                  >
                    隐藏
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}
    </div>
  );
}

function Composer({
  placeholder,
  submitLabel,
  onSubmit,
  onCancel,
  autoFocus,
  initial = "",
}: {
  initial?: string;
  placeholder: string;
  submitLabel: string;
  onSubmit: (content: string) => Promise<void>;
  onCancel?: () => void;
  autoFocus?: boolean;
}) {
  const [text, setText] = useState(initial);
  const [busy, setBusy] = useState(false);
  const length = text.trim().length;

  const submit = async () => {
    if (!length || busy) return;
    if (text.length > MAX_LENGTH) {
      toast.error(`最多 ${MAX_LENGTH} 字`);
      return;
    }
    setBusy(true);
    try {
      await onSubmit(text);
      setText("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "发送失败");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <MarkdownImageTextarea
        value={text}
        onValueChange={setText}
        autoFocus={autoFocus}
        placeholder={placeholder}
        className="min-h-[88px] text-sm"
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            submit();
          }
        }}
      />
      <div className="flex items-center gap-2">
        <Button size="sm" disabled={!length || busy} onClick={submit}>
          {busy && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
          {submitLabel}
        </Button>
        {onCancel && (
          <Button size="sm" variant="ghost" onClick={onCancel} disabled={busy}>
            取消
          </Button>
        )}
        <span className={cn("ml-auto text-xs", text.length > MAX_LENGTH ? "text-red-600" : "text-slate-400")}>
          {text.length} / {MAX_LENGTH} · Ctrl+Enter 发送
        </span>
      </div>
    </div>
  );
}
