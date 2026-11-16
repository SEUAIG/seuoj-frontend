import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ContestShell from "@/components/contest/ContestShell";
import useQueryToGetContestDetail from "@/hooks/useQueryToGetContestDetail";
import { getContestProblemListInEditPage } from "@/services/Contest/getContestProblemListInEditPage";
import {
  deliverContestBalloon,
  listContestBalloons,
  setContestBalloonColor,
  type ContestBalloonItem,
} from "@/services/Contest/balloon";

const POLL_MS = 5000;

function formatClock(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString("zh-CN", { hour12: false });
}

function displayName(item: ContestBalloonItem) {
  return item.nickname?.trim() || item.username || "未知选手";
}

export default function ContestBalloonPage() {
  const { id } = useParams();
  const contestId = Number(id);
  const queryClient = useQueryClient();
  const [showDelivered, setShowDelivered] = useState(false);

  const { data: detail } = useQueryToGetContestDetail(contestId);
  const canManage = Boolean(detail?.can_write);

  const balloonsQuery = useQuery({
    queryKey: ["contest-balloons", contestId],
    queryFn: () => listContestBalloons(contestId),
    enabled: Number.isFinite(contestId) && contestId > 0,
    refetchInterval: POLL_MS,
    refetchIntervalInBackground: false,
  });

  const problemsQuery = useQuery({
    queryKey: ["contest-balloon-problems", contestId],
    queryFn: () => getContestProblemListInEditPage(contestId),
    enabled: canManage,
  });

  const deliver = useMutation({
    mutationFn: (balloonId: number) => deliverContestBalloon(contestId, balloonId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["contest-balloons", contestId] });
    },
    onError: (error: unknown) => {
      toast.error("标记送达失败：" + (error instanceof Error ? error.message : String(error)));
    },
  });

  const colorMutation = useMutation({
    mutationFn: ({ pid, color }: { pid: string; color: string | null }) =>
      setContestBalloonColor(contestId, pid, color),
    onSuccess: () => toast.success("颜色已保存"),
    onError: (error: unknown) => {
      toast.error("保存颜色失败：" + (error instanceof Error ? error.message : String(error)));
    },
  });

  const balloons = balloonsQuery.data ?? [];
  const problems = problemsQuery.data?.problem_list ?? [];
  const pending = balloons.filter((item) => item.status === "PENDING");
  const delivered = balloons.filter((item) => item.status === "DELIVERED");
  const visible = showDelivered ? balloons : pending;

  const colorByPid = useMemo(() => {
    const map = new Map<string, string>();
    balloons.forEach((item) => {
      if (item.pid && !map.has(item.pid)) map.set(item.pid, item.color);
    });
    return map;
  }, [balloons]);

  return (
    <ContestShell contestId={contestId} tab="balloon" fill>
      <Helmet>
        <title>气球 - SEUOJ</title>
      </Helmet>
      <div className="mx-auto w-full max-w-[1160px] px-4 py-5 sm:px-7">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <h1 className="text-lg font-semibold">气球队列</h1>
          <Badge variant="secondary">待送 {pending.length}</Badge>
          <Badge variant="outline">已送 {delivered.length}</Badge>
          <span className="text-xs text-muted-foreground">
            每 {POLL_MS / 1000} 秒自动刷新
          </span>
          <div className="ml-auto flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowDelivered((prev) => !prev)}
            >
              {showDelivered ? "只看待送" : "显示已送达"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => void balloonsQuery.refetch()}
              disabled={balloonsQuery.isFetching}
            >
              <RefreshCw className={balloonsQuery.isFetching ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            </Button>
          </div>
        </div>

        {!canManage ? (
          <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
            只有拥有该比赛管理权限的账号（教师/管理员或比赛负责人）可以查看气球队列。
          </div>
        ) : (
          <>
            <div className="mb-5 overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[96px]">时间</TableHead>
                    <TableHead className="w-[110px]">题目</TableHead>
                    <TableHead className="w-[110px]">气球</TableHead>
                    <TableHead>选手</TableHead>
                    <TableHead className="w-[110px] text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                        {balloonsQuery.isLoading ? "加载中..." : "队列是空的，等待选手 AC"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    visible.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatClock(item.createdAt)}
                        </TableCell>
                        <TableCell className="font-medium">{item.pid ?? "-"}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-2 text-xs">
                            <span
                              className="inline-block h-3 w-3 rounded-full border"
                              style={{ backgroundColor: item.color }}
                            />
                            {item.color}
                          </span>
                        </TableCell>
                        <TableCell>{displayName(item)}</TableCell>
                        <TableCell className="text-right">
                          {item.status === "PENDING" ? (
                            <Button
                              size="sm"
                              onClick={() => deliver.mutate(item.id)}
                              disabled={deliver.isPending}
                            >
                              送达
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              {formatClock(item.deliveredAt)}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="rounded-md border p-4">
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-sm font-semibold">题目配色</h2>
                <span className="text-xs text-muted-foreground">
                  未设置时按题目顺序自动分配
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                {problems.length === 0 ? (
                  <span className="text-xs text-muted-foreground">暂无题目</span>
                ) : (
                  problems.map((problem) => {
                    const current = colorByPid.get(problem.pid) ?? "#94a3b8";
                    return (
                      <label
                        key={problem.pid}
                        className="flex items-center gap-2 rounded-md border px-2 py-1.5 text-xs"
                        title={problem.title}
                      >
                        <span className="font-medium">{problem.pid}</span>
                        <input
                          type="color"
                          className="h-6 w-8 cursor-pointer rounded border-0 bg-transparent p-0"
                          value={current}
                          onChange={(event) =>
                            colorMutation.mutate({ pid: problem.pid, color: event.target.value })
                          }
                        />
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-foreground"
                          onClick={() => colorMutation.mutate({ pid: problem.pid, color: null })}
                        >
                          自动
                        </button>
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </ContestShell>
  );
}
