import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Globe, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import type { RootState } from "@/app/store";
import { Button } from "@/components/ui/button";
import ContestShell from "@/components/contest/ContestShell";
import { letterOf, parseTime, sortProblems } from "@/components/contest/contestKit";
import { answeredEvents, answeredKey, useContestNotices, useSeen } from "@/components/contest/noticeKit";
import useQueryToGetContestDetail from "@/hooks/useQueryToGetContestDetail";
import {
  answerContestClarification,
  askContestClarification,
  deleteContestClarification,
} from "@/services/Contest/notices";
import type { ContestClarification } from "@/models/contest";
import { cn } from "@/lib/utils";

const FIELD = "w-full rounded-md border bg-white px-2.5 py-1.5 text-sm outline-none focus:border-primary";

const when = (v?: string) => {
  const d = parseTime(v);
  return d ? format(d, "MM-dd HH:mm") : "";
};

function AnswerForm({
  initial,
  busy,
  onSubmit,
  onCancel,
}: {
  initial?: ContestClarification;
  busy: boolean;
  onSubmit: (answer: string, isPublic: boolean) => void;
  onCancel?: () => void;
}) {
  const [answer, setAnswer] = useState(initial?.answer ?? "");
  const [isPublic, setIsPublic] = useState(initial?.is_public ?? false);
  return (
    <form
      className="mt-3 space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (answer.trim()) onSubmit(answer.trim(), isPublic);
      }}
    >
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        rows={2}
        maxLength={4000}
        placeholder="回复"
        className={cn(FIELD, "resize-y")}
      />
      <div className="flex items-center gap-3 text-sm">
        <label className="flex cursor-pointer items-center gap-1.5 text-slate-500">
          <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
          公开给所有人
        </label>
        {onCancel && (
          <button type="button" onClick={onCancel} className="ml-auto text-slate-500 hover:text-slate-900">
            取消
          </button>
        )}
        <Button type="submit" size="sm" className={onCancel ? "" : "ml-auto"} disabled={busy || !answer.trim()}>
          回复
        </Button>
      </div>
    </form>
  );
}

export default function ContestClarificationsPage() {
  const { id } = useParams();
  const contestId = Number(id);
  const qc = useQueryClient();
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);
  const { data: detail } = useQueryToGetContestDetail(contestId || 0);
  const { data, isLoading, isError, error } = useContestNotices(contestId);
  const { mark } = useSeen(contestId);
  const [pid, setPid] = useState("");
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);

  const problems = sortProblems(detail?.problem_list);
  const letters = Object.fromEntries(problems.map((p) => [p.pid, letterOf(p.sort_order)]));
  const canManage = data?.can_manage ?? false;

  useEffect(() => {
    if (data) mark("c", answeredEvents(data).map(answeredKey));
  }, [data, mark]);

  const refresh = () => qc.invalidateQueries({ queryKey: ["contestNotices", contestId] });
  const run = async (fn: () => Promise<unknown>, done: string, after?: () => void) => {
    setBusy(true);
    try {
      await fn();
      toast.success(done);
      after?.();
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "操作失败");
    } finally {
      setBusy(false);
    }
  };

  // 管理者：未回复的在前（先问先答），已回复的按时间倒序；选手：按时间倒序
  const list = [...(data?.clarifications ?? [])];
  if (canManage) {
    const pending = list.filter((c) => !c.answer).reverse();
    list.splice(0, list.length, ...pending, ...list.filter((c) => c.answer));
  }

  return (
    <ContestShell contestId={contestId} tab="clarifications">
      <Helmet>
        <title>{detail?.title ? `答疑 - ${detail.title} - SEUOJ` : "答疑 - SEUOJ"}</title>
      </Helmet>
      <div className="max-w-3xl">
        {isAuthenticated && !canManage && (
          <form
            className="mb-10 space-y-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!question.trim()) return;
              run(
                () => askContestClarification(contestId, { problem_pid: pid || undefined, question: question.trim() }),
                "已提交",
                () => setQuestion("")
              );
            }}
          >
            <div className="flex gap-2">
              <select
                value={pid}
                onChange={(e) => setPid(e.target.value)}
                className="rounded-md border bg-white px-2 py-1.5 text-sm text-slate-700 outline-none focus:border-primary"
                aria-label="关于哪道题"
              >
                <option value="">全场</option>
                {problems.map((p) => (
                  <option key={p.pid} value={p.pid}>
                    {letterOf(p.sort_order)}. {p.title}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
              maxLength={2000}
              placeholder="问题"
              className={cn(FIELD, "resize-y")}
            />
            <div className="flex justify-end">
              <Button type="submit" size="sm" disabled={busy || !question.trim()}>
                提问
              </Button>
            </div>
          </form>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : isError ? (
          <p className="py-20 text-center text-slate-500">{error instanceof Error ? error.message : "加载失败"}</p>
        ) : list.length === 0 ? (
          <p className="border-t border-slate-900 py-16 text-center text-slate-400">—</p>
        ) : (
          <div className="border-t border-slate-900">
            {list.map((c) => (
              <article key={c.clarification_id} className="group border-b border-slate-100 py-5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                  <span className="font-display text-sm font-semibold text-slate-900">
                    {c.problem_pid ? letters[c.problem_pid] ?? c.problem_pid : "全场"}
                  </span>
                  <span className="font-mono">{when(c.created_at)}</span>
                  {canManage && (
                    <span>
                      {c.asker_name}
                      {c.asker_username && c.asker_username !== c.asker_name && (
                        <span className="ml-1.5 font-mono text-slate-400">{c.asker_username}</span>
                      )}
                    </span>
                  )}
                  {!canManage && c.mine && <span>我的提问</span>}
                  {c.answer &&
                    (c.is_public ? (
                      <Globe className="h-3 w-3" aria-label="公开" />
                    ) : (
                      <Lock className="h-3 w-3" aria-label="仅提问者可见" />
                    ))}
                  {canManage && c.answer && editing !== c.clarification_id && (
                    <span className="ml-auto hidden gap-3 group-hover:flex">
                      <button type="button" className="hover:text-slate-900" onClick={() => setEditing(c.clarification_id)}>
                        修改回复
                      </button>
                      <button
                        type="button"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => {
                          if (window.confirm("删除这条提问？")) {
                            run(() => deleteContestClarification(contestId, c.clarification_id), "已删除");
                          }
                        }}
                      >
                        删除
                      </button>
                    </span>
                  )}
                </div>
                <p className="mt-1.5 whitespace-pre-wrap text-sm text-slate-900">{c.question}</p>

                {c.answer && editing !== c.clarification_id ? (
                  <div className="mt-3 border-l-2 border-primary pl-3">
                    <p className="whitespace-pre-wrap text-sm text-slate-700">{c.answer}</p>
                    <span className="font-mono text-xs text-slate-400">{when(c.answered_at)}</span>
                  </div>
                ) : canManage ? (
                  <AnswerForm
                    initial={c}
                    busy={busy}
                    onCancel={c.answer ? () => setEditing(null) : undefined}
                    onSubmit={(answer, isPublic) =>
                      run(
                        () => answerContestClarification(contestId, c.clarification_id, { answer, is_public: isPublic }),
                        "已回复",
                        () => setEditing(null)
                      )
                    }
                  />
                ) : (
                  <p className="mt-2 text-xs text-slate-400">等待回复</p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </ContestShell>
  );
}
