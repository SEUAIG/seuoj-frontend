import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Activity } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getProblemStatistics } from "@/services/Problem/getProblemStatistics";
import { useState } from "react";
import RejudgeDialog from "@/components/bussiness/RejudgeDialog";
import { rejudgeProblem } from "@/services/Submission/rejudge";

const SCORE_COLORS = [
  "hsl(0, 84%, 60%)",
  "hsl(10, 80%, 58%)",
  "hsl(25, 85%, 55%)",
  "hsl(35, 90%, 52%)",
  "hsl(43, 96%, 50%)",
  "hsl(55, 85%, 48%)",
  "hsl(75, 65%, 48%)",
  "hsl(100, 55%, 48%)",
  "hsl(130, 55%, 45%)",
  "hsl(142, 71%, 40%)",
];

export default function ProblemStatisticsPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const from = encodeURIComponent(`${window.location.pathname}${window.location.search}`);

  const [rejudgeOpen, setRejudgeOpen] = useState(false);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["problemStatistics", id],
    queryFn: () => getProblemStatistics(id!),
    enabled: !!id,
  });

  const stats = data?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-6 space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-80 rounded-lg" />
          <Skeleton className="h-80 rounded-lg" />
        </div>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-4">
          <p className="text-red-500 text-lg">加载统计数据失败</p>
          <Button variant="outline" onClick={() => nav(`/problemsLibrary/${id}?from=${from}`)}>
            返回题目
          </Button>
        </div>
      </div>
    );
  }

  const hasScoreData = stats.scoreDistribution.some((d) => d.count > 0);

  return (
    <>
      <Helmet>
        <title>{`#${id} 统计 - SEUOJ`}</title>
      </Helmet>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-6 space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => nav(`/problemsLibrary/${id}?from=${from}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              返回题目
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Activity className="h-6 w-6" />
              #{id} 题目统计
            </h1>
            <Button variant="outline" size="sm" className="ml-auto" onClick={() => setRejudgeOpen(true)}>
              重测整题
            </Button>
            <RejudgeDialog
              open={rejudgeOpen}
              target={` #${id} 的全部提交`}
              note="只重测题库、题单和作业里的提交；比赛里的提交请到对应比赛的提交页重测，避免改动已结束比赛的榜单。"
              onOpenChange={setRejudgeOpen}
              run={() => rejudgeProblem(id!)}
              onDone={() => refetch()}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-sm text-muted-foreground">总提交</div>
                <div className="text-3xl font-bold mt-1">{stats.totalSubmit}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-sm text-muted-foreground">总通过</div>
                <div className="text-3xl font-bold mt-1 text-green-600">
                  {stats.totalAccept}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-sm text-muted-foreground">通过率</div>
                <div className="text-3xl font-bold mt-1 text-blue-600">
                  {stats.acceptRate}%
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>得分分布</CardTitle>
            </CardHeader>
            <CardContent>
              {hasScoreData ? (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart
                    data={stats.scoreDistribution}
                    margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip
                      formatter={(value) => [`${value}`, "提交数"]}
                      labelFormatter={(label) => `分数段: ${label}`}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {stats.scoreDistribution.map((_, i) => (
                        <Cell key={i} fill={SCORE_COLORS[i]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-40 text-muted-foreground">
                  暂无得分数据
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>近 30 天提交趋势</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart
                  data={stats.submissionTrend}
                  margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                >
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(d: string) => {
                      const parts = d.split("-");
                      return `${parts[1]}/${parts[2]}`;
                    }}
                    interval="preserveStartEnd"
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip
                    formatter={(value) => [`${value}`, "提交数"]}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(221, 83%, 53%)"
                    strokeWidth={2}
                    fill="url(#colorCount)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
