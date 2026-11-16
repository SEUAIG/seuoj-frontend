import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Cpu, Loader2, Pause, Play, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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
import {
  addJudgeHost,
  getJudgeHosts,
  removeJudgeHost,
  setAllJudgeHostsEnabled,
  setJudgeHostEnabled,
  type JudgeHost,
  type JudgeHostsStatus,
  type ProbeSample,
} from "@/services/admin/judgeHosts";

export const JUDGE_HOSTS_KEY = ["adminJudgeHosts"];

export const timeLabel = (ms: number) =>
  new Date(ms).toLocaleTimeString("zh-CN", { hour12: false, timeZone: "Asia/Shanghai" });

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

export function hostState(h: JudgeHost): { label: string; className: string } {
  if (h.removing) return { label: h.current ? "删除中" : "已删除", className: "text-muted-foreground" };
  if (!h.enabled) return { label: h.current ? "暂停中" : "已暂停", className: "text-amber-600" };
  if (h.current) return { label: "评测中", className: "text-blue-600" };
  return { label: "空闲", className: "text-green-600" };
}

export const loadText = (load: number[]) => load.map((x) => x.toFixed(2)).join(" / ");

function quantile(sorted: number[], q: number) {
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

/** 按“探针运行时正在评测几份”分组 */
function groupByLoad(samples: ProbeSample[]) {
  const groups = new Map<number, ProbeSample[]>();
  for (const s of samples) groups.set(s.running, [...(groups.get(s.running) ?? []), s]);
  const rows = [...groups.entries()]
    .sort(([a], [b]) => a - b)
    .map(([running, list]) => {
      const cpu = list.map((s) => s.cpuMs).sort((a, b) => a - b);
      const real = list.map((s) => s.realMs).sort((a, b) => a - b);
      const cpuMedian = quantile(cpu, 0.5);
      const cpuP10 = quantile(cpu, 0.1);
      const cpuP90 = quantile(cpu, 0.9);
      return {
        running,
        count: list.length,
        cpuMedian,
        cpuP10,
        cpuP90,
        spreadPct: cpuMedian > 0 ? ((cpuP90 - cpuP10) / cpuMedian) * 100 : 0,
        realMedian: quantile(real, 0.5),
        slowerPct: null as number | null,
      };
    });
  const base = rows[0];
  if (base && base.cpuMedian > 0) {
    for (const r of rows.slice(1)) r.slowerPct = (r.cpuMedian / base.cpuMedian - 1) * 100;
  }
  return rows;
}

function useHostMutation<T>(fn: (arg: T) => Promise<JudgeHostsStatus>, done: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (next) => {
      queryClient.setQueryData(JUDGE_HOSTS_KEY, (old: JudgeHostsStatus | undefined) => ({
        ...next,
        judge: next.judge ?? old?.judge ?? null,
      }));
      if (next.judgeError) toast.warning(next.judgeError);
      else toast.success(done);
    },
    onError: (err: unknown) => toast.error(err instanceof Error ? err.message : String(err)),
  });
}

function HostsTable({ status }: { status: JudgeHostsStatus }) {
  const hosts = status.judge?.hosts ?? [];
  const [removing, setRemoving] = useState<JudgeHost | null>(null);
  const toggle = useHostMutation(
    ({ id, enabled }: { id: number; enabled: boolean }) => setJudgeHostEnabled(id, enabled),
    "已更新",
  );
  const remove = useHostMutation((id: number) => removeJudgeHost(id), "已删除");
  const live = hosts.filter((h) => !h.removing).length;

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="py-2 pr-4 font-medium">ID</th>
              <th className="py-2 pr-4 font-medium">名称</th>
              <th className="py-2 pr-4 font-medium">CPU 核</th>
              <th className="py-2 pr-4 font-medium">启用</th>
              <th className="py-2 pr-4 font-medium">状态</th>
              <th className="py-2 pr-4 font-medium" title="忙碌比例：5 分钟 / 15 分钟 / 1 小时 / 5 小时">
                负载 (5m/15m/1h/5h)
              </th>
              <th className="py-2 pr-4 font-medium">已评</th>
              <th className="py-2 pr-4 font-medium">最近评测</th>
              {status.canEdit && <th className="py-2" />}
            </tr>
          </thead>
          <tbody>
            {hosts.map((h) => {
              const state = hostState(h);
              const judging = h.current ?? h.last;
              return (
                <tr key={h.id} className="border-b last:border-0 tabular-nums">
                  <td className="py-2 pr-4">
                    <Link className="hover:underline" to={`/admin/judge/${h.id}`}>
                      {h.id}
                    </Link>
                  </td>
                  <td className="py-2 pr-4 font-mono">
                    <Link className="hover:underline" to={`/admin/judge/${h.id}`}>
                      {h.name}
                    </Link>
                  </td>
                  <td className="py-2 pr-4">{h.core ?? "—"}</td>
                  <td className="py-2 pr-4">{h.enabled ? "是" : "否"}</td>
                  <td className={`py-2 pr-4 ${state.className}`}>
                    <span className="inline-flex items-center gap-1">
                      {h.current ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      {state.label}
                    </span>
                  </td>
                  <td className="py-2 pr-4 font-mono">{loadText(h.load)}</td>
                  <td className="py-2 pr-4">{h.judged}</td>
                  <td className="py-2 pr-4">
                    {judging ? (
                      <Link className="font-mono hover:underline" to={`/submission/${judging.submissionId}`}>
                        {judging.submissionId.slice(0, 8)}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  {status.canEdit && (
                    <td className="py-2 text-right whitespace-nowrap">
                      {!h.removing && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            title={h.enabled ? "暂停" : "启用"}
                            disabled={toggle.isPending}
                            onClick={() => toggle.mutate({ id: h.id, enabled: !h.enabled })}
                          >
                            {h.enabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="删除"
                            disabled={live <= 1 || remove.isPending}
                            onClick={() => setRemoving(h)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <AlertDialog open={removing != null} onOpenChange={(open) => !open && setRemoving(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除 {removing?.name}？</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={() => removing && remove.mutate(removing.id)}>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function HostActions({ status }: { status: JudgeHostsStatus }) {
  const all = useHostMutation((enabled: boolean) => setAllJudgeHostsEnabled(enabled), "已更新");
  const add = useHostMutation(() => addJudgeHost(), "已添加");
  const count = status.judge?.hosts.filter((h) => !h.removing).length ?? 0;
  const [confirmPause, setConfirmPause] = useState(false);
  if (!status.canEdit) return null;
  return (
    <div className="flex flex-wrap gap-2">
      <AlertDialog open={confirmPause} onOpenChange={setConfirmPause}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>暂停全部评测机？</AlertDialogTitle>
          </AlertDialogHeader>
          <p className="text-sm text-muted-foreground">暂停后全站新提交都会排队等待，直到重新启动。比赛进行中请谨慎。</p>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={() => all.mutate(false)}>全部暂停</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Button size="sm" variant="outline" disabled={all.isPending} onClick={() => all.mutate(true)}>
        <Play className="mr-1 h-4 w-4" />
        全部启动
      </Button>
      <Button size="sm" variant="outline" disabled={all.isPending} onClick={() => setConfirmPause(true)}>
        <Pause className="mr-1 h-4 w-4" />
        全部暂停
      </Button>
      <Button size="sm" disabled={add.isPending || count >= status.maxHosts} onClick={() => add.mutate(undefined)}>
        <Plus className="mr-1 h-4 w-4" />
        添加评测机
      </Button>
    </div>
  );
}

function TimingProbe({ status }: { status: JudgeHostsStatus }) {
  const samples = useMemo(() => status.judge?.probe?.samples ?? [], [status]);
  const rows = useMemo(() => groupByLoad(samples), [samples]);
  const chartData = useMemo(() => samples.map((s) => ({ ...s, time: timeLabel(s.at) })), [samples]);
  const hostCount = status.judge?.hosts.length ?? 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">计时波动</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {status.judge?.probe?.error && (
          <p className="text-sm text-destructive">探针不可用：{status.judge.probe.error}</p>
        )}
        {samples.length === 0 ? (
          <p className="text-sm text-muted-foreground">暂无样本</p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} minTickGap={40} />
                <YAxis
                  yAxisId="ms"
                  tick={{ fontSize: 12 }}
                  unit=" ms"
                  width={70}
                  domain={[(min: number) => Math.floor(min * 0.95), (max: number) => Math.ceil(max * 1.05)]}
                />
                <YAxis
                  yAxisId="load"
                  orientation="right"
                  allowDecimals={false}
                  tick={{ fontSize: 12 }}
                  width={40}
                  domain={[0, (max: number) => Math.max(max, hostCount)]}
                />
                <Tooltip
                  formatter={(value, name) => (name === "正在评测" ? [`${value} 份`, name] : [`${value} ms`, name])}
                />
                <Legend />
                <Area
                  yAxisId="load"
                  type="stepAfter"
                  dataKey="running"
                  name="正在评测"
                  fill="hsl(215, 20%, 85%)"
                  fillOpacity={0.45}
                  stroke="none"
                  isAnimationActive={false}
                />
                <Line
                  yAxisId="ms"
                  type="monotone"
                  dataKey="cpuMs"
                  name="CPU 用时"
                  stroke="hsl(221, 83%, 53%)"
                  dot={false}
                  strokeWidth={2}
                  isAnimationActive={false}
                />
                <Line
                  yAxisId="ms"
                  type="monotone"
                  dataKey="realMs"
                  name="实际用时"
                  stroke="hsl(25, 90%, 55%)"
                  dot={false}
                  strokeWidth={1.5}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">当时在评测</th>
                    <th className="py-2 pr-4 font-medium">样本数</th>
                    <th className="py-2 pr-4 font-medium">CPU 用时中位数</th>
                    <th className="py-2 pr-4 font-medium">P10 – P90</th>
                    <th className="py-2 pr-4 font-medium">波动</th>
                    <th className="py-2 pr-4 font-medium">比最低负载时</th>
                    <th className="py-2 font-medium">实际用时中位数</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.running} className="border-b last:border-0 tabular-nums">
                      <td className="py-2 pr-4">{r.running} 份</td>
                      <td className="py-2 pr-4">{r.count}</td>
                      <td className="py-2 pr-4">{fmt(r.cpuMedian)} ms</td>
                      <td className="py-2 pr-4">
                        {fmt(r.cpuP10)} – {fmt(r.cpuP90)} ms
                      </td>
                      <td className="py-2 pr-4">±{fmt(r.spreadPct / 2)}%</td>
                      <td className="py-2 pr-4">
                        {r.slowerPct == null ? "基准" : `${r.slowerPct >= 0 ? "+" : ""}${fmt(r.slowerPct)}%`}
                      </td>
                      <td className="py-2">{fmt(r.realMedian)} ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminJudgePage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: JUDGE_HOSTS_KEY,
    queryFn: getJudgeHosts,
    refetchInterval: 5000,
  });

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
      <Helmet>
        <title>评测机 - SEUOJ</title>
      </Helmet>
      <h1 className="flex items-center gap-2 text-2xl font-bold">
        <Cpu className="h-6 w-6" />
        评测机
      </h1>

      {isLoading && <Skeleton className="h-48 w-full" />}
      {isError && (
        <p className="text-sm text-destructive">加载失败：{error instanceof Error ? error.message : String(error)}</p>
      )}

      {data && (
        <>
          {data.judgeError && (
            <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {data.judgeError}
            </div>
          )}

          <Card>
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
              <div className="flex items-baseline gap-4">
                <CardTitle className="text-lg">评测机</CardTitle>
                <span className="text-sm text-muted-foreground tabular-nums">
                  排队 {data.judge?.waiting ?? "—"} · 重测队列 {data.rejudgeQueue}
                </span>
              </div>
              <HostActions status={data} />
            </CardHeader>
            <CardContent>
              {data.judge ? <HostsTable status={data} /> : <p className="text-sm text-muted-foreground">—</p>}
            </CardContent>
          </Card>

          <TimingProbe status={data} />
        </>
      )}
    </div>
  );
}
