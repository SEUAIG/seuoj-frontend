import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  ArrowLeft,
  BookOpen,
  Calendar,
  Clock,
  ListChecks,
  FileText,
  FileArchive,
  File,
  BarChart3,
  ChevronRight,
  Pencil,
  Info,
  Trash2,
  Save,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import { getDownloadUrl } from "@/services/file/uploadFile";
import {
  getAssignmentDetail,
} from "@/services/Assignment/getAssignmentDetail";
import { getAssignmentProblems } from "@/services/Assignment/getAssignmentProblems";
import {
  getAssignmentOverview,
  type AssignmentOverviewData,
} from "@/services/Class/getAssignmentOverview";
import { replaceAssignmentProblems } from "@/services/Assignment/replaceAssignmentProblems";
import { deleteAssignment } from "@/services/Assignment/deleteAssignment";
import { ContestProblemOverviewInEditPage } from "@/services/Contest/getContestProblemListInEditPage";
import AssignmentIntroEditorDialog from "../bussiness/AssignmentIntroEditorDialog";
import AssignmentEditDialog from "../bussiness/AssignmentEditDialog";
import SortListTable from "../common/SortListTable";
import SubmissionListPanel from "../bussiness/SubmissionListPanel";

function statusBadge(status: string) {
  switch (status) {
    case "DRAFT":
      return <Badge variant="secondary">草稿</Badge>;
    case "PUBLISHED":
      return <Badge variant="default">已发布</Badge>;
    case "CLOSED":
      return <Badge variant="outline">已关闭</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function getFileIcon(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (ext === "pdf" || ext === "doc" || ext === "docx" || ext === "txt") {
    return <FileText className="h-4 w-4 text-blue-500" />;
  }
  if (
    ext === "zip" ||
    ext === "rar" ||
    ext === "7z" ||
    ext === "tar" ||
    ext === "gz"
  ) {
    return <FileArchive className="h-4 w-4 text-amber-500" />;
  }
  return <File className="h-4 w-4 text-muted-foreground" />;
}

export default function AssignmentDetailPage() {
  const { classId: classIdStr, assignmentId: assignmentIdStr } = useParams<{
    classId: string;
    assignmentId: string;
  }>();
  const classId = Number(classIdStr);
  const assignmentId = Number(assignmentIdStr);
  const nav = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("overview");
  const [isIntroEditorOpen, setIsIntroEditorOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditingProblems, setIsEditingProblems] = useState(false);
  const [editProblems, setEditProblems] = useState<ContestProblemOverviewInEditPage[]>([]);
  const [isSavingProblems, setIsSavingProblems] = useState(false);

  const {
    data: detailResp,
    isLoading: isDetailLoading,
  } = useQuery({
    queryKey: ["assignmentDetail", classId, assignmentId],
    queryFn: () => getAssignmentDetail(classId, assignmentId),
    enabled: !!classIdStr && !!assignmentIdStr,
  });
  const detail = detailResp?.data;

  const {
    data: problemsResp,
    isLoading: isProblemsLoading,
  } = useQuery({
    queryKey: ["assignmentProblems", classId, assignmentId],
    queryFn: () => getAssignmentProblems(classId, assignmentId),
    enabled: !!classIdStr && !!assignmentIdStr && activeTab === "problems",
  });
  const problems = problemsResp?.data || [];

  const {
    data: statsResp,
    isLoading: isStatsLoading,
  } = useQuery({
    queryKey: ["assignmentOverview", classId, assignmentId],
    queryFn: () => getAssignmentOverview(classId, assignmentId),
    enabled: !!classIdStr && !!assignmentIdStr && activeTab === "statistics",
  });
  const stats: AssignmentOverviewData | undefined = statsResp?.data;

  if (isDetailLoading) {
    return (
      <div className="container mx-auto py-8 min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="container mx-auto py-8 min-h-screen flex items-center justify-center text-muted-foreground">
        作业不存在
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 min-h-screen flex flex-col">
      <Helmet>
        <title>{detail.title || "作业详情"} - SeuOJ</title>
      </Helmet>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => nav(`/class/${classId}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{detail.title}</h1>
              {statusBadge(detail.status)}
            </div>
            {detail.description && (
              <p className="text-muted-foreground mt-1">{detail.description}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              {detail.deadline && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  截止: {format(new Date(detail.deadline), "yyyy-MM-dd HH:mm")}
                </span>
              )}
              <span>{detail.problem_count} 题</span>
              <span>{detail.member_count} 人</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Pencil className="h-4 w-4 mr-1" />
            编辑
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            删除
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <TabsList className="grid w-full grid-cols-4 max-w-xl mb-4">
          <TabsTrigger value="overview">
            <FileText className="h-4 w-4 mr-1" />
            概览
          </TabsTrigger>
          <TabsTrigger value="problems">
            <ListChecks className="h-4 w-4 mr-1" />
            题目列表
          </TabsTrigger>
          <TabsTrigger value="submissions">
            <BookOpen className="h-4 w-4 mr-1" />
            提交记录
          </TabsTrigger>
          <TabsTrigger value="statistics">
            <BarChart3 className="h-4 w-4 mr-1" />
            统计
          </TabsTrigger>
        </TabsList>

        {/* Tab: Overview */}
        <TabsContent value="overview" className="!mt-0">
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-xs text-muted-foreground">状态</div>
                  <div className="mt-1">{statusBadge(detail.status)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-xs text-muted-foreground">题目数</div>
                  <div className="text-2xl font-bold mt-1">
                    {detail.problem_count}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-xs text-muted-foreground">班级人数</div>
                  <div className="text-2xl font-bold mt-1">
                    {detail.member_count}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-xs text-muted-foreground">截止时间</div>
                  <div className="text-sm font-medium mt-1">
                    {detail.deadline
                      ? format(new Date(detail.deadline), "MM/dd HH:mm")
                      : "无"}
                  </div>
                </CardContent>
              </Card>
            </div>

            {(detail.visible_from || detail.visible_to) && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground flex items-center gap-4">
                    {detail.visible_from && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        可见开始:{" "}
                        {format(
                          new Date(detail.visible_from),
                          "yyyy-MM-dd HH:mm"
                        )}
                      </span>
                    )}
                    {detail.visible_to && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        可见结束:{" "}
                        {format(
                          new Date(detail.visible_to),
                          "yyyy-MM-dd HH:mm"
                        )}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Introduction */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Info className="h-5 w-5" />
                  作业介绍
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsIntroEditorOpen(true)}
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  编辑
                </Button>
              </CardHeader>
              <CardContent>
                {detail.introduction ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <MarkdownRenderer>{detail.introduction}</MarkdownRenderer>
                  </div>
                ) : (
                  <div className="text-muted-foreground text-sm py-8 text-center">
                    暂未设置作业介绍
                    <Button
                      variant="link"
                      className="ml-2 h-auto p-0"
                      onClick={() => setIsIntroEditorOpen(true)}
                    >
                      点击添加
                    </Button>
                  </div>
                )}

                {detail.intro_attachments &&
                  detail.intro_attachments.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="text-sm font-medium mb-2">附件</h4>
                      <div className="space-y-1.5">
                        {detail.intro_attachments.map((att) => (
                          <a
                            key={att.id}
                            href={getDownloadUrl(att.file_path)}
                            className="flex items-center gap-2 p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                            download
                          >
                            {getFileIcon(att.file_name)}
                            <span className="flex-1 text-sm truncate">
                              {att.file_name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatFileSize(att.file_size)}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>

            {detail.problems && detail.problems.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">题目概览</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {detail.problems.slice(0, 5).map((p, i) => (
                      <div
                        key={p.pid}
                        className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer"
                        onClick={() => nav(`/problemsLibrary/${p.pid}?assignment_id=${assignmentId}`)}
                      >
                        <span className="text-xs text-muted-foreground w-6">
                          {i + 1}
                        </span>
                        <span className="font-mono text-sm text-primary">
                          {p.pid}
                        </span>
                        <span className="text-sm flex-1 truncate">
                          {p.title}
                        </span>
                        {p.weight !== 1 && (
                          <Badge variant="outline" className="text-xs">
                            x{p.weight}
                          </Badge>
                        )}
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                    {detail.problems.length > 5 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-muted-foreground"
                        onClick={() => setActiveTab("problems")}
                      >
                        查看全部 {detail.problems.length} 题
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Tab: Problems */}
        <TabsContent value="problems" className="!mt-0">
          {isEditingProblems ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">编辑题目列表</h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingProblems(false)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    取消
                  </Button>
                  <Button
                    size="sm"
                    disabled={isSavingProblems}
                    onClick={async () => {
                      setIsSavingProblems(true);
                      try {
                        const res = await replaceAssignmentProblems(classId, assignmentId, {
                          problems: editProblems.map((p) => ({
                            problem_id: Number(p.pid),
                            weight: 1,
                          })),
                        });
                        if (res.code === 0) {
                          toast.success("题目列表已保存");
                          setIsEditingProblems(false);
                          queryClient.invalidateQueries({
                            queryKey: ["assignmentProblems", classId, assignmentId],
                          });
                          queryClient.invalidateQueries({
                            queryKey: ["assignmentDetail", classId, assignmentId],
                          });
                        } else {
                          toast.error(res.message || "保存失败");
                        }
                      } catch (err: unknown) {
                        const message = err instanceof Error ? err.message : "保存请求失败";
                        toast.error(message);
                      } finally {
                        setIsSavingProblems(false);
                      }
                    }}
                  >
                    {isSavingProblems ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        保存中...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-1" />
                        保存
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <SortListTable
                problems={editProblems}
                isFetching={false}
                setProblems={setEditProblems}
              />
            </div>
          ) : isProblemsLoading ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditProblems(
                      problems.map((p, i) => ({
                        pid: p.pid,
                        title: p.title,
                        sort_order: i + 1,
                      }))
                    );
                    setIsEditingProblems(true);
                  }}
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  编辑题目
                </Button>
              </div>
              {problems.length === 0 ? (
                <div className="flex items-center justify-center min-h-[300px] text-muted-foreground">
                  暂无题目
                </div>
              ) : (
                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground bg-muted/50 uppercase border-b">
                      <tr>
                        <th scope="col" className="px-6 py-3 font-medium w-12">
                          #
                        </th>
                        <th scope="col" className="px-6 py-3 font-medium w-24">
                          题号
                        </th>
                        <th scope="col" className="px-6 py-3 font-medium">
                          标题
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 font-medium text-center w-20"
                        >
                          权重
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {problems.map((p, i) => (
                        <tr
                          key={p.pid}
                          className="bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => nav(`/problemsLibrary/${p.pid}?assignment_id=${assignmentId}`)}
                        >
                          <td className="px-6 py-3 text-muted-foreground">
                            {i + 1}
                          </td>
                          <td className="px-6 py-3 font-mono text-primary">
                            {p.pid}
                          </td>
                          <td className="px-6 py-3 font-medium">{p.title}</td>
                          <td className="px-6 py-3 text-center">
                            {p.weight !== 1 ? (
                              <Badge variant="outline">x{p.weight}</Badge>
                            ) : (
                              <span className="text-muted-foreground">1</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Tab: Submissions */}
        <TabsContent value="submissions" className="!mt-0">
          <SubmissionListPanel
            assignmentId={assignmentId}
            queryKeyPrefix="assignmentSubmissionPanel"
          />
        </TabsContent>

        {/* Tab: Statistics */}
        <TabsContent value="statistics" className="!mt-0">
          {isStatsLoading ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !stats ? (
            <div className="flex items-center justify-center min-h-[300px] text-muted-foreground">
              暂无数据
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg border p-4 text-center">
                  <div className="text-xs text-muted-foreground">
                    班级人数
                  </div>
                  <div className="text-2xl font-bold mt-1">
                    {stats.member_count}
                  </div>
                </div>
                <div className="rounded-lg border p-4 text-center">
                  <div className="text-xs text-muted-foreground">题目数</div>
                  <div className="text-2xl font-bold mt-1">
                    {stats.problem_count}
                  </div>
                </div>
                <div className="rounded-lg border p-4 text-center">
                  <div className="text-xs text-muted-foreground">
                    平均完成率
                  </div>
                  <div className="text-2xl font-bold mt-1">
                    {stats.avg_completion_rate}%
                  </div>
                </div>
              </div>

              {/* Problem AC rate chart */}
              {stats.problems.length > 0 && (
                <div>
                  <h3 className="text-base font-semibold mb-3">
                    各题 AC 率
                  </h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart
                      data={stats.problems.map((p) => ({
                        name: p.pid,
                        ac_rate: p.ac_rate,
                      }))}
                      margin={{ top: 5, right: 20, left: 0, bottom: 40 }}
                    >
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12 }}
                        angle={-30}
                        textAnchor="end"
                      />
                      <YAxis domain={[0, 100]} unit="%" />
                      <RechartsTooltip
                        formatter={(value) => [`${value}%`, "AC率"]}
                      />
                      <Bar
                        dataKey="ac_rate"
                        fill="hsl(221, 83%, 53%)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Student completion table */}
              <div>
                <h3 className="text-base font-semibold mb-3">
                  学生完成情况
                </h3>
                {stats.students.length === 0 ? (
                  <p className="text-muted-foreground">暂无数据</p>
                ) : (
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-muted-foreground bg-muted/50 uppercase border-b">
                        <tr>
                          <th scope="col" className="px-6 py-3 font-medium">
                            用户名
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 font-medium text-center"
                          >
                            AC 数 / 总题数
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 font-medium text-center"
                          >
                            完成率
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 font-medium text-center"
                          >
                            提交次数
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 font-medium text-center"
                          >
                            通过率
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 font-medium"
                            style={{ minWidth: 200 }}
                          >
                            进度
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {stats.students.map((s) => {
                          const rate =
                            stats.problem_count > 0
                              ? Math.round(
                                  (s.ac_count / stats.problem_count) * 100
                                )
                              : 0;
                          const passRate =
                            s.submit_count > 0
                              ? Math.round(
                                  (s.ac_count / s.submit_count) * 100
                                )
                              : 0;
                          return (
                            <tr
                              key={s.user_id}
                              className="bg-card hover:bg-muted/50 transition-colors"
                            >
                              <td className="px-6 py-3 font-medium">
                                {s.nickname || s.username}
                              </td>
                              <td className="px-6 py-3 text-center font-mono">
                                {s.ac_count} / {stats.problem_count}
                              </td>
                              <td className="px-6 py-3 text-center font-semibold">
                                {rate}%
                              </td>
                              <td className="px-6 py-3 text-center font-mono">
                                {s.submit_count}
                              </td>
                              <td className="px-6 py-3 text-center font-semibold">
                                {passRate}%
                              </td>
                              <td className="px-6 py-3">
                                <Progress value={rate} className="h-2" />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AssignmentIntroEditorDialog
        isOpen={isIntroEditorOpen}
        onClose={() => setIsIntroEditorOpen(false)}
        classId={classId}
        assignmentId={assignmentId}
        currentIntroduction={detail.introduction}
        currentAttachments={detail.intro_attachments || []}
        onSuccess={() =>
          queryClient.invalidateQueries({
            queryKey: ["assignmentDetail", classId, assignmentId],
          })
        }
      />

      <AssignmentEditDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        classId={classId}
        assignmentId={assignmentId}
        currentData={{
          title: detail.title,
          description: detail.description,
          status: detail.status,
          deadline: detail.deadline,
          visible_from: detail.visible_from,
          visible_to: detail.visible_to,
        }}
        onSuccess={() => {
          queryClient.invalidateQueries({
            queryKey: ["assignmentDetail", classId, assignmentId],
          });
          queryClient.invalidateQueries({
            queryKey: ["assignmentPage", classId],
          });
        }}
      />

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除作业？</DialogTitle>
            <DialogDescription>
              此操作将删除作业 "{detail.title}"，包括其所有关联的题目数据。此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={async () => {
                setIsDeleting(true);
                try {
                  const res = await deleteAssignment(classId, assignmentId);
                  if (res.code === 0) {
                    toast.success("作业已删除");
                    nav(`/class/${classId}`);
                  } else {
                    toast.error(res.message || "删除失败");
                  }
                } catch (err: unknown) {
                  const message = err instanceof Error ? err.message : "删除请求失败";
                  toast.error(message);
                } finally {
                  setIsDeleting(false);
                }
              }}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  删除中...
                </>
              ) : (
                "确认删除"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
