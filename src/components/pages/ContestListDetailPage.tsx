import React from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate } from "react-router-dom";
import { format, isValid, parseISO } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ExternalLink,
  Settings,
  UserPlus,
  UserMinus,
} from "lucide-react";
import useQueryToGetContestDetail from "@/hooks/useQueryToGetContestDetail";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import { ContestStatus } from "@/services/Contest/getContestDetail";
import {
  registerContest,
  unregisterContest,
} from "@/services/Contest/registerContest";
import { toast } from "sonner";
import { useState } from "react";

export default function ContestListDetailPage() {
  const { contest_public_id } = useParams();
  const nav = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const { data, isLoading, isError, error, refetch } =
    useQueryToGetContestDetail(contest_public_id || "");
  const canEdit = true;

  const handleRegister = async () => {
    if (!contest_public_id) return;
    setIsRegistering(true);
    try {
      const res = await registerContest(contest_public_id);
      if (res.code === 200 || res.code === 0) {
        toast.success("报名成功");
        refetch();
      } else {
        toast.error(res.message || "报名失败");
      }
    } catch {
      toast.error("报名请求出错");
    } finally {
      setIsRegistering(false);
    }
  };
  const handleUnregister = async () => {
    if (!contest_public_id) return;
    setIsRegistering(true);
    try {
      const res = await unregisterContest(contest_public_id);
      if (res.code === 200 || res.code === 0) {
        toast.success("取消报名成功");
        refetch();
      } else {
        toast.error(res.message || "取消报名失败");
      }
    } catch {
      toast.error("取消报名请求出错");
    } finally {
      setIsRegistering(false);
    }
  };
  const formatContestTime = (start?: string, end?: string) => {
    const formatOne = (value?: string) => {
      if (!value) return "";
      const parsed = parseISO(value);
      if (!isValid(parsed)) return value;
      return format(parsed, "yyyy年MM月dd日 HH:mm");
    };
    const startText = formatOne(start);
    const endText = formatOne(end);
    if (startText && endText) {
      return `${startText} ~ ${endText}`;
    }
    return startText || endText || "-";
  };
  const getStatus = (start?: string, end?: string): ContestStatus => {
    if (!start || !end) return "NOT_STARTED";
    const now = new Date();
    const startDate = parseISO(start);
    const endDate = parseISO(end);
    if (!isValid(startDate) || !isValid(endDate)) return "NOT_STARTED";
    if (now < startDate) return "NOT_STARTED";
    if (now > endDate) return "FINISHED";
    return "IN_PROGRESS";
  };
  const statusLabelMap: Record<ContestStatus, string> = {
    NOT_STARTED: "未开始",
    IN_PROGRESS: "进行中",
    FINISHED: "已结束",
  };
  const statusColorMap: Record<ContestStatus, string> = {
    NOT_STARTED: "bg-blue-50 text-blue-700 border-blue-200",
    IN_PROGRESS: "bg-emerald-50 text-emerald-700 border-emerald-200",
    FINISHED: "bg-slate-50 text-slate-700 border-slate-200",
  };
  const ruleTypeClassMap: Record<string, string> = {
    NOI: "bg-blue-500 hover:bg-blue-600 text-white border-transparent shadow-sm",
    IOI: "bg-amber-500 hover:bg-amber-600 text-white border-transparent shadow-sm",
    ACM: "bg-emerald-500 hover:bg-emerald-600 text-white border-transparent shadow-sm",
  };
  if (isLoading) {
    return (
      <div className="w-4/5 mx-auto py-6 space-y-6">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-4 w-1/4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }
  if (isError || !data) {
    return (
      <div className="w-4/5 mx-auto py-6 text-center text-muted-foreground">
        <div className="text-xl font-semibold mb-2">加载比赛信息失败</div>
        <p>{error instanceof Error ? error.message : "未知错误"}</p>
        <Button variant="outline" className="mt-4" onClick={() => nav(-1)}>
          返回上一页
        </Button>
      </div>
    );
  }
  const status = data.status ?? getStatus(data.start_time, data.end_time);
  const isRegistered = data.is_registered ?? false;
  return (
    <div className="w-4/5 mx-auto py-6 space-y-6 min-h-screen">
      <Helmet>
        <title>
          {data.title ? `${data.title} - 比赛详情` : "比赛详情"} - SeuOJ
        </title>
      </Helmet>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => nav(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{data.title}</h1>
          {data.subtitle && (
            <p className="text-muted-foreground mt-1">{data.subtitle}</p>
          )}
        </div>
        {canEdit && (
          <Button
            variant="outline"
            onClick={() => nav(`/contest/${contest_public_id}/edit`)}
          >
            <Settings className="mr-2 h-4 w-4" />
            编辑比赛
          </Button>
        )}
        <div className="flex gap-2">
          {isRegistered ? (
            <Button
              variant="outline"
              className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
              onClick={handleUnregister}
              disabled={isRegistering}
            >
              <UserMinus className="mr-2 h-4 w-4" />
              取消报名
            </Button>
          ) : (
            <Button
              variant="outline"
              className="bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
              onClick={handleRegister}
              disabled={isRegistering}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              报名比赛
            </Button>
          )}
        </div>
      </div>
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-center justify-between mb-6 border-b pb-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">比赛时间</div>
              <div className="font-medium flex items-center gap-2">
                {formatContestTime(data.start_time, data.end_time)}
                <Badge
                  variant="outline"
                  className={`${statusColorMap[status]} text-base px-3 py-1`}
                >
                  {statusLabelMap[status]}
                </Badge>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">赛制</div>
              <div className="font-medium">
                <Badge
                  className={`text-base px-3 py-1 ${
                    data.rule_type ? ruleTypeClassMap[data.rule_type] : ""
                  }`}
                >
                  {data.rule_type}
                </Badge>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">公开性</div>
              <div className="font-medium">
                <Badge
                  variant={data.is_public ? "outline" : "secondary"}
                  className="text-base px-3 py-1"
                >
                  {data.is_public ? "公开赛" : "私有赛"}
                </Badge>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">统计</div>
              <div className="font-medium">
                <Badge
                  variant={data.hide_statistics ? "destructive" : "outline"}
                  className="text-base px-3 py-1"
                >
                  {data.hide_statistics ? "隐藏统计" : "公开统计"}
                </Badge>
              </div>
            </div>
          </div>
          {data.description && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">比赛说明</h3>
              <div className="prose prose-sm dark:prose-invert max-w-none bg-muted/30 p-4 rounded-lg">
                <MarkdownRenderer>{data.description}</MarkdownRenderer>
              </div>
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold mb-3">题目列表</h3>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">序号</TableHead>
                    <TableHead className="w-[120px]">题号</TableHead>
                    <TableHead>标题</TableHead>
                    <TableHead className="w-[100px] text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.problem_list && data.problem_list.length > 0 ? (
                    data.problem_list.map((problem) => (
                      <TableRow key={problem.pid}>
                        <TableCell className="font-medium">
                          {String.fromCharCode(65 + (problem.sort_order ?? 0))}
                        </TableCell>
                        <TableCell>{problem.pid}</TableCell>
                        <TableCell>
                          <span className="font-medium">{problem.title}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              nav(
                                `/contest/${contest_public_id}/${problem.pid}`
                              )
                            }
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            查看
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        暂无题目
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
