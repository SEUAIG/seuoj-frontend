import React, { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Pin } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import {
  createContestAnnouncement,
  deleteContestAnnouncement,
  updateContestAnnouncement,
} from "@/services/Contest/notices";
import type { ContestAnnouncement } from "@/models/contest";
import { cn } from "@/lib/utils";
import { parseTime } from "./contestKit";
import { announcementKey, useContestNotices, useSeen } from "./noticeKit";

const when = (a: ContestAnnouncement) => {
  const d = parseTime(a.created_at);
  return d ? format(d, "MM-dd HH:mm") : "";
};

function Editor({
  initial,
  busy,
  onSubmit,
  onCancel,
}: {
  initial?: ContestAnnouncement;
  busy: boolean;
  onSubmit: (v: { title: string; content: string; is_pinned: boolean }) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [pinned, setPinned] = useState(initial?.is_pinned ?? false);
  return (
    <form
      className="space-y-2 border-b border-slate-100 py-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (title.trim()) onSubmit({ title: title.trim(), content, is_pinned: pinned });
      }}
    >
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="标题"
        maxLength={200}
        autoFocus
        className="w-full rounded-md border bg-white px-2.5 py-1.5 text-sm outline-none focus:border-primary"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="正文，支持 Markdown"
        rows={4}
        maxLength={10000}
        className="w-full resize-y rounded-md border bg-white px-2.5 py-1.5 text-sm outline-none focus:border-primary"
      />
      <div className="flex items-center gap-3 text-sm">
        <label className="flex cursor-pointer items-center gap-1.5 text-slate-500">
          <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} />
          置顶
        </label>
        <button type="button" onClick={onCancel} className="ml-auto text-slate-500 hover:text-slate-900">
          取消
        </button>
        <Button type="submit" size="sm" disabled={busy || !title.trim()}>
          {initial ? "保存" : "发布"}
        </Button>
      </div>
    </form>
  );
}

/** 概览页侧栏的公告：选手只读，比赛管理者可发布、修改、删除 */
export default function ContestAnnouncements({ contestId }: { contestId: number }) {
  const qc = useQueryClient();
  const { data } = useContestNotices(contestId);
  const { seen, mark } = useSeen(contestId);
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [busy, setBusy] = useState(false);
  // 进页面时记下“没看过”的公告，用来画小红点；然后标记为已读
  const [fresh, setFresh] = useState<Set<string> | null>(null);

  const list = data?.announcements ?? [];
  const canManage = data?.can_manage ?? false;

  useEffect(() => {
    if (!data) return;
    const keys = data.announcements.map(announcementKey);
    setFresh((prev) => prev ?? new Set(keys.filter((k) => !seen.a.includes(k))));
    mark("a", keys);
    // seen 只在首次计算 fresh 时需要
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, mark]);

  if (!data || (!list.length && !canManage)) return null;

  const run = async (fn: () => Promise<unknown>, done: string) => {
    setBusy(true);
    try {
      await fn();
      toast.success(done);
      setEditing(null);
      await qc.invalidateQueries({ queryKey: ["contestNotices", contestId] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "操作失败");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section>
      <div className="flex items-baseline justify-between border-b border-slate-900 pb-2.5 text-[13px] font-bold tracking-wide">
        公告
        {canManage && editing !== "new" && (
          <button
            type="button"
            onClick={() => setEditing("new")}
            className="font-normal text-slate-500 hover:text-slate-900"
          >
            ＋ 发布
          </button>
        )}
      </div>
      {editing === "new" && (
        <Editor
          busy={busy}
          onCancel={() => setEditing(null)}
          onSubmit={(v) => run(() => createContestAnnouncement(contestId, v), "已发布")}
        />
      )}
      {list.map((a) =>
        editing === a.announcement_id ? (
          <Editor
            key={a.announcement_id}
            initial={a}
            busy={busy}
            onCancel={() => setEditing(null)}
            onSubmit={(v) => run(() => updateContestAnnouncement(contestId, a.announcement_id, v), "已保存")}
          />
        ) : (
          <article key={a.announcement_id} className="group border-b border-slate-100 py-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              {a.is_pinned && <Pin className="h-3 w-3" aria-label="置顶" />}
              <span className="font-mono">{when(a)}</span>
              {canManage && (
                <span className="ml-auto hidden gap-3 group-hover:flex">
                  <button type="button" className="hover:text-slate-900" onClick={() => setEditing(a.announcement_id)}>
                    修改
                  </button>
                  <button
                    type="button"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => {
                      if (window.confirm(`删除公告「${a.title}」？`)) {
                        run(() => deleteContestAnnouncement(contestId, a.announcement_id), "已删除");
                      }
                    }}
                  >
                    删除
                  </button>
                </span>
              )}
            </div>
            <h4 className="mb-1 mt-1 flex items-center text-sm font-semibold">
              <span
                className={cn(
                  "mr-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-red-600",
                  !fresh?.has(announcementKey(a)) && "hidden"
                )}
              />
              {a.title}
            </h4>
            {a.content && (
              <div className="prose prose-sm prose-slate max-w-none text-[13px] text-slate-700">
                <MarkdownRenderer>{a.content}</MarkdownRenderer>
              </div>
            )}
          </article>
        )
      )}
      {!list.length && editing !== "new" && <p className="py-4 text-sm text-slate-400">—</p>}
    </section>
  );
}
