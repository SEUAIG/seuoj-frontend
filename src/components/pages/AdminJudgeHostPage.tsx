import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Pause, Play, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AnswerStateNew } from "@/components/common/AnswerState";
import {
  getJudgeHostJudgings,
  getJudgeHosts,
  rejudgeJudgeHost,
  setJudgeHostEnabled,
  type JudgeHostsStatus,
} from "@/services/admin/judgeHosts";
import { JUDGE_HOSTS_KEY, hostState, loadText, timeLabel } from "./AdminJudgePage";

const RANGES: { value: string; label: string; hours: number | null }[] = [
  { value: "1", label: "最近 1 小时", hours: 1 },
  { value: "24", label: "最近 24 小时", hours: 24 },
  { value: "168", label: "最近 7 天", hours: 168 },
  { value: "all", label: "全部", hours: null },
];

// 后端给的是北京时间的本地时间串，原样显示
const dateTime = (s: string | null) => (s ? s.replace("T", " ").slice(0, 19) : "—");

const seconds = (ms: number | null) => (ms == null ? "—" : `${(ms / 1000).toFixed(1)} s`);

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-0.5 tabular-nums">{children}</div>
    </div>
  );
}

export default function AdminJudgeHostPage() {
  const id = Number(useParams().hostId);
  const queryClient = useQueryClient();
  const [range, setRange] = useState("24");
  const [confirming, setConfirming] = useState(false);

  const hosts = useQuery({ queryKey: JUDGE_HOSTS_KEY, queryFn: getJudgeHosts, refetchInterval: 5000 });
  const judgings = useQuery({
    queryKey: ["adminJudgeHostJudgings", id],
    queryFn: () => getJudgeHostJudgings(id),
    refetchInterval: 10000,
    enabled: Number.isInteger(id),
  });

  const toggle = useMutation({
    mutationFn: (enabled: boolean) => setJudgeHostEnabled(id, enabled),
    onSuccess: (next) => {
      queryClient.setQueryData(JUDGE_HOSTS_KEY, (old: JudgeHostsStatus | undefined) => ({
        ...next,
        judge: next.judge ?? old?.judge ?? null,
      }));
      if (next.judgeError) toast.warning(next.judgeError);
    },
    onError: (err: unknown) => toast.error(err instanceof Error ? err.message : String(err)),
  });

  const rejudge = useMutation({
    mutationFn: () => rejudgeJudgeHost(id, RANGES.find((r) => r.value === range)?.hours ?? null),
    onSuccess: (o) => {
      toast.success(`已重测 ${o.queued} 份` + (o.busy > 0 ? `，${o.busy} 份正在评测未重测` : ""));
      void queryClient.invalidateQueries({ queryKey: ["adminJudgeHostJudgings", id] });
    },
    onError: (err: unknown) => toast.error(err instanceof Error ? err.message : String(err)),
  });

  const status = hosts.data;
  const host = status?.judge?.hosts.find((h) => h.id === id);
  const name = host?.name ?? `judge-${id}`;
  const state = host ? hostState(host) : null;
  const rangeLabel = RANGES.find((r) => r.value === range)?.label;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
      <Helmet>
        <title>{name} - SEUOJ</title>
      </Helmet>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/judge" title="返回">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="font-mono text-2xl font-bold">{name}</h1>
      </div>

      {hosts.isLoading && <Skeleton className="h-32 w-full" />}
      {status?.judgeError && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {status.judgeError}
        </div>
      )}

      {status && (
        <Card>
          <CardContent className="flex flex-wrap items-end gap-x-10 gap-y-4 pt-6">
            {host ? (
              <>
                <Field label="ID">{host.id}</Field>
                <Field label="CPU 核">{host.core ?? "—"}</Field>
                <Field label="启用">{host.enabled ? "是" : "否"}</Field>
                <Field label="状态">
                  <span className={state?.className}>{state?.label}</span>
                  {host.current && (
                    <>
                      {" "}
                      <Link className="font-mono hover:underline" to={`/submission/${host.current.submissionId}`}>
                        {host.current.submissionId.slice(0, 8)}
                      </Link>{" "}
                      <span className="text-muted-foreground">自 {timeLabel(host.current.startedAt)}</span>
                    </>
                  )}
                </Field>
                <Field label="负载 (5m/15m/1h/5h)">
                  <span className="font-mono">{loadText(host.load)}</span>
                </Field>
                <Field label="已评">{host.judged}</Field>
                {status.canEdit && !host.removing && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={toggle.isPending}
                    onClick={() => toggle.mutate(!host.enabled)}
                  >
                    {host.enabled ? <Pause className="mr-1 h-4 w-4" /> : <Play className="mr-1 h-4 w-4" />}
                    {host.enabled ? "暂停" : "启用"}
                  </Button>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">判题端上没有这台评测机</p>
            )}
          </CardContent>
        </Card>
      )}

      {status?.canEdit && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">重测</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-2">
            <Select value={range} onValueChange={setRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RANGES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="destructive" disabled={rejudge.isPending} onClick={() => setConfirming(true)}>
              <RotateCcw className="mr-1 h-4 w-4" />
              重测 {name} 评过的提交
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">最近评测</CardTitle>
        </CardHeader>
        <CardContent>
          {judgings.isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : judgings.isError ? (
            <p className="text-sm text-destructive">
              {judgings.error instanceof Error ? judgings.error.message : String(judgings.error)}
            </p>
          ) : (judgings.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">暂无</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">提交</th>
                    <th className="py-2 pr-4 font-medium">开始</th>
                    <th className="py-2 pr-4 font-medium">耗时</th>
                    <th className="py-2 pr-4 font-medium">题目</th>
                    <th className="py-2 pr-4 font-medium">用户</th>
                    <th className="py-2 pr-4 font-medium">结果</th>
                  </tr>
                </thead>
                <tbody>
                  {judgings.data?.map((j) => (
                    <tr key={j.submissionNo} className="border-b last:border-0 tabular-nums">
                      <td className="py-2 pr-4 font-mono">
                        <Link
                          className="hover:underline"
                          to={
                            j.contestId != null
                              ? `/contest/${j.contestId}/submission/${j.submissionNo}`
                              : `/submission/${j.submissionNo}`
                          }
                        >
                          {j.submissionNo.slice(0, 8)}
                        </Link>
                      </td>
                      <td className="py-2 pr-4">{dateTime(j.judgeStartedAt)}</td>
                      <td className="py-2 pr-4">{seconds(j.judgeMs)}</td>
                      <td className="py-2 pr-4">
                        {j.pid ? (
                          <span>
                            <span className="font-mono">{j.pid}</span> {j.problemTitle}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-2 pr-4">{j.username ?? "—"}</td>
                      <td className="py-2 pr-4">
                        <AnswerStateNew status={j.status} verdict={j.verdict ?? undefined} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              重测 {name} {rangeLabel}评过的提交？
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={() => rejudge.mutate()}>重测</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
