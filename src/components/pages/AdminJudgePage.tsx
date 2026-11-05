import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Cpu, Loader2 } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getJudgeConcurrency,
  setJudgeConcurrency,
  type JudgeConcurrencyStatus,
  type ProbeSample,
} from "@/services/admin/judgeConcurrency";

const QUERY_KEY = ["adminJudgeConcurrency"];

function quantile(sorted: number[], q: number) {
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

interface GroupRow {
  running: number;
  count: number;
  cpuMedian: number;
  cpuP10: number;
  cpuP90: number;
  /** (P90 − P10) / 中位数 */
  spreadPct: number;
  realMedian: number;
  /** 相对空闲（或最低负载）时 CPU 中位数慢了多少 */
  slowerPct: number | null;
}

/** 按“探针运行时正在评测几份”分组，看负载越高用时偏移、波动有多大 */
function groupByLoad(samples: ProbeSample[]): GroupRow[] {
  const groups = new Map<number, ProbeSample[]>();
  for (const s of samples) {
    const list = groups.get(s.running) ?? [];
    list.push(s);
    groups.set(s.running, list);
  }
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

const timeLabel = (ms: number) =>
  new Date(ms).toLocaleTimeString("zh-CN", { hour12: false, timeZone: "Asia/Shanghai" });

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border p-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

function LimitEditor({ status }: { status: JudgeConcurrencyStatus }) {
  const queryClient = useQueryClient();
  const current = status.judge?.limit ?? status.configured ?? 1;
  const [draft, setDraft] = useState<string | null>(null);
  const value = draft ?? String(current);
  const parsed = Number(value);
  const valid = Number.isInteger(parsed) && parsed >= 1 && parsed <= status.maxLimit;

  const mutation = useMutation({
    mutationFn: (limit: number) => setJudgeConcurrency(limit),
    onSuccess: (next) => {
      queryClient.setQueryData(QUERY_KEY, (old: JudgeConcurrencyStatus | undefined) => ({
        ...next,
        // PUT 返回也带探针样本；保险起见判题端没返回时沿用旧样本
        judge: next.judge ?? old?.judge ?? null,
      }));
      setDraft(null);
      if (next.judgeError) toast.warning(next.judgeError);
      else toast.success(`评测并发已改为 ${next.judge?.limit ?? next.configured}`);
    },
    onError: (err: unknown) => toast.error("修改失败：" + (err instanceof Error ? err.message : String(err))),
  });

  if (!status.canEdit) {
    return <p className="text-sm text-muted-foreground">只有超级管理员可以修改评测并发。</p>;
  }
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={1}
          max={status.maxLimit}
          className="w-28"
          value={value}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && valid && mutation.mutate(parsed)}
        />
        <Button
          onClick={() => mutation.mutate(parsed)}
          disabled={!valid || mutation.isPending || (draft === null && status.configured === current)}
        >
          {mutation.isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
          保存
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        范围 1–{status.maxLimit}，立即生效，正在评测的提交不受影响；调低时等手上的评完再收回名额。
        并发越高，排队消化越快，但同一程序测得的用时也越容易偏大、波动越大，可以对照下方计时波动决定。
      </p>
    </div>
  );
}

export default function AdminJudgePage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: getJudgeConcurrency,
    refetchInterval: 5000,
  });

  const samples = useMemo(() => data?.judge?.probe?.samples ?? [], [data]);
  const rows = useMemo(() => groupByLoad(samples), [samples]);
  const chartData = useMemo(() => samples.map((s) => ({ ...s, time: timeLabel(s.at) })), [samples]);
  const latest = samples.length > 0 ? samples[samples.length - 1] : undefined;

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
        <p className="text-sm text-destructive">
          加载失败：{error instanceof Error ? error.message : String(error)}
        </p>
      )}

      {data && (
        <>
          {data.judgeError && (
            <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {data.judgeError}
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">评测并发</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <Stat
                  label="同时评测上限"
                  value={data.judge ? String(data.judge.limit) : "—"}
                  hint={
                    data.configured != null
                      ? `已保存设置 ${data.configured}`
                      : data.judge
                        ? `未设置，沿用判题端默认 ${data.judge.defaultLimit}`
                        : undefined
                  }
                />
                <Stat label="正在评测" value={data.judge ? String(data.judge.running) : "—"} />
                <Stat label="等待名额" value={data.judge ? String(data.judge.waiting) : "—"} />
                <Stat
                  label="重测队列"
                  value={String(data.rejudgeQueue)}
                  hint={`重测最多同时占 ${data.rejudgeMaxInFlight} 个名额`}
                />
              </div>
              <LimitEditor status={data} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">计时波动</CardTitle>
              <p className="text-sm text-muted-foreground">
                判题端每 {data.judge?.probe?.intervalSeconds ?? 15} 秒在沙箱里跑同一个固定程序，记下测得的用时，保留最近 2 小时。
                程序不变，用时的变化就来自机器负载；选手程序的用时会受到同样比例的影响。
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {data.judge?.probe?.error && (
                <p className="text-sm text-destructive">探针不可用：{data.judge.probe.error}</p>
              )}
              {samples.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {data.judge ? "还没有样本，判题端启动后约 15 秒出现第一个。" : "连不上判题端，暂无数据。"}
                </p>
              ) : (
                <>
                  {latest && (
                    <p className="text-sm">
                      最近一次（{timeLabel(latest.at)}）：CPU 用时{" "}
                      <span className="font-semibold tabular-nums">{latest.cpuMs} ms</span>，实际用时{" "}
                      <span className="font-semibold tabular-nums">{latest.realMs} ms</span>，当时{" "}
                      {latest.running} 份在评测。
                    </p>
                  )}
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="time" tick={{ fontSize: 12 }} minTickGap={40} />
                      <YAxis
                        yAxisId="ms"
                        tick={{ fontSize: 12 }}
                        unit=" ms"
                        width={70}
                        // 不从 0 开始，几毫秒的波动才看得出来
                        domain={[(min: number) => Math.floor(min * 0.95), (max: number) => Math.ceil(max * 1.05)]}
                      />
                      <YAxis
                        yAxisId="load"
                        orientation="right"
                        allowDecimals={false}
                        tick={{ fontSize: 12 }}
                        width={40}
                        domain={[0, (max: number) => Math.max(max, data.judge?.limit ?? 1)]}
                      />
                      <Tooltip
                        formatter={(value, name) =>
                          name === "正在评测" ? [`${value} 份`, name] : [`${value} ms`, name]
                        }
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
                    <p className="mt-2 text-xs text-muted-foreground">
                      波动取 P10 到 P90 区间的一半相对中位数的比例；样本少于 10 个时参考价值有限。
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
