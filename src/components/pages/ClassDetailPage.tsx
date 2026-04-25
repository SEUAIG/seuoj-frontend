import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  Loader2,
  ArrowLeft,
  Users,
  Calendar,
  Trash2,
  Trophy,
  ChevronRight,
  Unlink,
  BarChart3,
  Eye,
  Home,
  BookOpen,
  Megaphone,
  Link as LinkIcon,
  UserPlus,
  Upload,
  Plus,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getClassMemberPage,
  ClassMemberItem,
} from "@/services/Class/getClassMemberPage";
import {
  getLinkedContestPage,
  LinkPageItem,
} from "@/services/Class/getLinkedContestPage";
import { removeMember } from "@/services/Class/removeMember";
import { unlinkContest } from "@/services/Class/unlinkContest";
import ClassPagination from "../bussiness/ClassPagination";
import LinkContestModal from "../bussiness/LinkContestModal";
import AddMemberModal from "../bussiness/AddMemberModal";
import BatchImportMembersModal from "../bussiness/BatchImportMembersModal";
import ClassHomepage from "../bussiness/ClassHomepage";
import AnnouncementList from "../bussiness/AnnouncementList";
import AssignmentList from "../bussiness/AssignmentList";
import CreateAssignmentDialog from "../bussiness/CreateAssignmentDialog";
import AssignmentOverviewDialog from "../bussiness/AssignmentOverviewDialog";
import {
  getClassOverview,
  type AssignmentProgressItem,
} from "@/services/Class/getClassOverview";
import { getClassDetail } from "@/services/Class/getClassDetail";
import { Progress } from "@/components/ui/progress";

export default function ClassDetailPage() {
  const { id } = useParams<{ id: string }>();
  const classId = Number(id);
  const nav = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");
  const size = parseInt(searchParams.get("size") || "20");

  // Class detail (introduction, name, etc.)
  const {
    data: classDetailResponse,
    isLoading: isClassDetailLoading,
    refetch: refetchClassDetail,
  } = useQuery({
    queryKey: ["classDetail", classId],
    queryFn: () => getClassDetail(classId),
    enabled: !!id,
  });
  const classDetail = classDetailResponse?.data;
  const canEdit = classDetail?.can_write ?? false;

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["classMemberPage", classId, page, size],
    queryFn: () => getClassMemberPage(classId, { current: page, size }),
    enabled: !!id,
    placeholderData: keepPreviousData,
  });

  const [contestPage, setContestPage] = useState(1);
  const contestSize = 20;

  const {
    data: contestData,
    isLoading: isContestLoading,
    isFetching: isContestFetching,
    isError: isContestError,
    error: contestError,
    refetch: refetchContests,
  } = useQuery({
    queryKey: ["classLinkedContests", classId, contestPage, contestSize],
    queryFn: () =>
      getLinkedContestPage(classId, { current: contestPage, size: contestSize }),
    enabled: !!id,
    placeholderData: keepPreviousData,
  });

  const [activeTab, setActiveTab] = useState("homepage");

  const [memberToRemove, setMemberToRemove] = useState<ClassMemberItem | null>(
    null
  );
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const [contestToUnlink, setContestToUnlink] = useState<LinkPageItem | null>(
    null
  );
  const [isUnlinkDialogOpen, setIsUnlinkDialogOpen] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);

  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isBatchImportModalOpen, setIsBatchImportModalOpen] = useState(false);
  const [assignmentDrilldown, setAssignmentDrilldown] = useState<AssignmentProgressItem | null>(null);
  const [isCreateAssignmentOpen, setIsCreateAssignmentOpen] = useState(false);

  const {
    data: overviewData,
    isLoading: isOverviewLoading,
    isError: isOverviewError,
    error: overviewError,
  } = useQuery({
    queryKey: ["classOverview", classId],
    queryFn: () => getClassOverview(classId),
    enabled: !!id && canEdit && activeTab === "overview",
  });

  const overview = overviewData?.data;

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: newPage.toString(), size: size.toString() });
  };

  const handleRemoveClick = (member: ClassMemberItem) => {
    setMemberToRemove(member);
    setIsRemoveDialogOpen(true);
  };

  const confirmRemove = async () => {
    if (!memberToRemove || !id) return;
    setIsRemoving(true);
    try {
      const res = await removeMember(classId, memberToRemove.user_id);
      if (res.code === 0) {
        toast.success(`已移除成员: ${memberToRemove.username}`);
        setIsRemoveDialogOpen(false);
        setMemberToRemove(null);
        refetch();
      } else {
        toast.error(res.message || "移除失败");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "移除请求发生错误");
    } finally {
      setIsRemoving(false);
    }
  };

  const handleUnlinkClick = (e: React.MouseEvent, contest: LinkPageItem) => {
    e.preventDefault();
    e.stopPropagation();
    setContestToUnlink(contest);
    setIsUnlinkDialogOpen(true);
  };

  const confirmUnlink = async () => {
    if (!contestToUnlink || !id) return;
    setIsUnlinking(true);
    try {
      const res = await unlinkContest(classId, Number(contestToUnlink.id));
      if (res.code === 0) {
        toast.success(`已解除与比赛 "${contestToUnlink.title}" 的关联`);
        setIsUnlinkDialogOpen(false);
        setContestToUnlink(null);
        refetchContests();
      } else {
        toast.error(res.message || "解除关联失败");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "解除关联请求发生错误");
    } finally {
      setIsUnlinking(false);
    }
  };

  const records = data?.data?.records || [];
  const total = data?.data?.total || 0;
  const totalPages = Math.ceil(total / size);

  const contestRecords = contestData?.data?.records || [];
  const contestTotal = contestData?.data?.total || 0;
  const contestTotalPages = Math.ceil(contestTotal / contestSize);

  if (isClassDetailLoading) {
    return (
      <div className="container mx-auto py-8 min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 min-h-screen flex flex-col">
      <Helmet>
        <title>{classDetail?.name || "班级详情"} - SEUOJ</title>
      </Helmet>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => nav(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {classDetail?.name || "班级详情"}
            </h1>
            {classDetail?.description && (
              <p className="text-muted-foreground mt-1">
                {classDetail.description}
              </p>
            )}
          </div>
        </div>
        {canEdit && (
          <div className="flex items-center gap-2">
            {activeTab === "members" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsBatchImportModalOpen(true)}
                >
                  <Upload className="h-4 w-4 mr-2" />批量导入
                </Button>
                <Button onClick={() => setIsAddMemberModalOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />添加成员
                </Button>
              </>
            )}
            {activeTab === "contests" && (
              <Button onClick={() => setIsLinkModalOpen(true)}>
                <LinkIcon className="h-4 w-4 mr-2" />关联比赛
              </Button>
            )}
            {activeTab === "assignments" && (
              <Button onClick={() => setIsCreateAssignmentOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />新建作业
              </Button>
            )}
          </div>
        )}
      </div>

      <Tabs
        defaultValue="homepage"
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <TabsList className={`grid w-full ${canEdit ? "grid-cols-6" : "grid-cols-5"} max-w-3xl mb-4`}>
          <TabsTrigger value="homepage">
            <Home className="h-4 w-4 mr-1" />首页
          </TabsTrigger>
          <TabsTrigger value="announcements">
            <Megaphone className="h-4 w-4 mr-1" />公告
          </TabsTrigger>
          <TabsTrigger value="assignments">
            <BookOpen className="h-4 w-4 mr-1" />作业
          </TabsTrigger>
          <TabsTrigger value="members">成员列表</TabsTrigger>
          <TabsTrigger value="contests">已关联比赛</TabsTrigger>
          {canEdit && (
            <TabsTrigger value="overview">
              <BarChart3 className="h-4 w-4 mr-1" />学情概览
            </TabsTrigger>
          )}
        </TabsList>

        {/* Homepage tab (default) */}
        <TabsContent value="homepage" className="!mt-0">
          {classDetail && (
            <ClassHomepage
              classId={classId}
              classDetail={classDetail}
              canEdit={canEdit}
              onRefresh={() => {
                refetchClassDetail();
                queryClient.invalidateQueries({ queryKey: ["classOverview", classId] });
                queryClient.invalidateQueries({ queryKey: ["classAnnouncements", classId] });
              }}
              onSwitchToOverview={() => setActiveTab("overview")}
              onSwitchToAnnouncements={() => setActiveTab("announcements")}
              onSwitchToAssignments={() => setActiveTab("assignments")}
            />
          )}
        </TabsContent>

        {/* Announcements tab */}
        <TabsContent value="announcements" className="!mt-0">
          <AnnouncementList classId={classId} canEdit={canEdit} />
        </TabsContent>

        {/* Assignments tab */}
        <TabsContent value="assignments" className="!mt-0">
          <AssignmentList classId={classId} canEdit={canEdit} />
        </TabsContent>

        <TabsContent value="members" className="!mt-0">
          <Card className="flex-1 flex flex-col border-none shadow-none bg-transparent">
            <CardHeader className="flex flex-row items-center justify-between border-b px-0 pt-0 pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Users className="h-5 w-5" />
                成员列表 ({total})
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 pt-4 flex flex-col">
              {isLoading ? (
                <div className="flex-1 flex items-center justify-center min-h-[300px]">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : isError ? (
                <div className="flex-1 flex items-center justify-center text-red-500 min-h-[300px]">
                  加载失败:{" "}
                  {error instanceof Error ? error.message : "未知错误"}
                </div>
              ) : records.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 min-h-[300px] text-center bg-muted/10">
                  <p className="text-muted-foreground text-lg mb-4">
                    暂无成员加入该班级
                  </p>
                </div>
              ) : (
                <div
                  className={`flex-1 flex flex-col ${isFetching ? "opacity-60 transition-opacity" : ""
                    }`}
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-muted-foreground bg-muted/50 uppercase border-b">
                        <tr>
                          <th scope="col" className="px-6 py-4 font-medium">
                            用户 ID
                          </th>
                          <th scope="col" className="px-6 py-4 font-medium">
                            用户名
                          </th>
                          <th scope="col" className="px-6 py-4 font-medium">
                            加入时间
                          </th>
                          {canEdit && (
                            <th
                              scope="col"
                              className="px-6 py-4 font-medium text-right"
                            >
                              操作
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {records.map((member) => (
                          <tr
                            key={member.user_id}
                            className="bg-card hover:bg-muted/50 transition-colors"
                          >
                            <td className="px-6 py-4 font-mono text-muted-foreground">
                              {member.user_id}
                            </td>
                            <td className="px-6 py-4 font-medium">
                              {member.nickname || member.username}
                            </td>
                            <td className="px-6 py-4 text-muted-foreground flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              {member.joined_at
                                ? format(
                                  new Date(member.joined_at),
                                  "yyyy-MM-dd HH:mm"
                                )
                                : "-"}
                            </td>
                            {canEdit && (
                              <td className="px-6 py-4 text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleRemoveClick(member)}
                                  title="移除成员"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-4 border-t mt-auto">
                    <ClassPagination
                      totalPages={totalPages}
                      currentPage={page}
                      onPageChange={handlePageChange}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contests" className="!mt-0">
          <Card className="flex-1 flex flex-col border-none shadow-none bg-transparent">
            <CardHeader className="flex flex-row items-center justify-between border-b px-0 pt-0 pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Trophy className="h-5 w-5" />
                已关联比赛 ({contestTotal})
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 pt-4 flex flex-col">
              {isContestLoading ? (
                <div className="flex-1 flex items-center justify-center min-h-[300px]">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : isContestError ? (
                <div className="flex-1 flex items-center justify-center text-red-500 min-h-[300px]">
                  加载失败:{" "}
                  {contestError instanceof Error
                    ? contestError.message
                    : "未知错误"}
                </div>
              ) : contestRecords.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 min-h-[300px] text-center bg-muted/10 rounded-md">
                  <p className="text-muted-foreground text-lg mb-4">
                    暂未关联任何比赛
                  </p>
                  {canEdit && (
                    <Button
                      variant="outline"
                      onClick={() => setIsLinkModalOpen(true)}
                    >
                      立即关联
                    </Button>
                  )}
                </div>
              ) : (
                <div
                  className={`flex-1 flex flex-col ${isContestFetching ? "opacity-60 transition-opacity" : ""
                    }`}
                >
                  <div className="grid gap-3">
                    {contestRecords.map((contest) => (
                      <div
                        key={contest.id}
                        className="flex items-center justify-between p-4 bg-card rounded-lg border hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer group"
                        onClick={() => nav(`/contest/${contest.id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <Trophy className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-medium text-base group-hover:text-primary transition-colors">
                              {contest.title}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              ID: {contest.id}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {canEdit && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 z-10"
                              onClick={(e) => handleUnlinkClick(e, contest)}
                              title="解除关联"
                            >
                              <Unlink className="h-4 w-4" />
                            </Button>
                          )}
                          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                  {contestTotalPages > 1 && (
                    <div className="p-4 mt-auto flex justify-center">
                      <ClassPagination
                        totalPages={contestTotalPages}
                        currentPage={contestPage}
                        onPageChange={setContestPage}
                      />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {canEdit && (
        <TabsContent value="overview" className="!mt-0">
          <Card className="flex-1 flex flex-col border-none shadow-none bg-transparent">
            <CardHeader className="flex flex-row items-center justify-between border-b px-0 pt-0 pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <BarChart3 className="h-5 w-5" />
                学情概览
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 pt-4 flex flex-col">
              {isOverviewLoading ? (
                <div className="flex-1 flex items-center justify-center min-h-[300px]">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : isOverviewError ? (
                <div className="flex-1 flex items-center justify-center text-red-500 min-h-[300px]">
                  加载失败:{" "}
                  {overviewError instanceof Error
                    ? overviewError.message
                    : "未知错误"}
                </div>
              ) : !overview ? (
                <div className="flex items-center justify-center text-muted-foreground min-h-[300px]">
                  暂无数据
                </div>
              ) : (
                <div className="space-y-6">
                  {/* 统计卡片 */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-lg border p-4 text-center">
                      <div className="text-xs text-muted-foreground">班级人数</div>
                      <div className="text-2xl font-bold mt-1">{overview.member_count}</div>
                    </div>
                    <div className="rounded-lg border p-4 text-center">
                      <div className="text-xs text-muted-foreground">总题数</div>
                      <div className="text-2xl font-bold mt-1">{overview.total_problems}</div>
                    </div>
                    <div className="rounded-lg border p-4 text-center">
                      <div className="text-xs text-muted-foreground">已发布作业</div>
                      <div className="text-2xl font-bold mt-1">{overview.assignments.length}</div>
                    </div>
                  </div>

                  {/* 作业完成率柱状图 */}
                  {overview.assignments.length > 0 && (
                    <div>
                      <h3 className="text-base font-semibold mb-3">各作业平均完成率</h3>
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart
                          data={overview.assignments.map((a) => ({
                            name: a.title.length > 8 ? a.title.slice(0, 8) + "..." : a.title,
                            avg_completion_rate: a.avg_completion_rate,
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
                            formatter={(value) => [`${value}%`, "平均完成率"]}
                          />
                          <Bar
                            dataKey="avg_completion_rate"
                            fill="hsl(221, 83%, 53%)"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* 学生做题统计表 */}
                  <div>
                    <h3 className="text-base font-semibold mb-3">
                      学生做题统计（共 {overview.total_problems} 题）
                    </h3>
                    {overview.students.length === 0 ? (
                      <p className="text-muted-foreground">暂无班级成员</p>
                    ) : (
                      <div className="overflow-x-auto border rounded-lg">
                        <table className="w-full text-sm text-left">
                          <thead className="text-xs text-muted-foreground bg-muted/50 uppercase border-b">
                            <tr>
                              <th scope="col" className="px-6 py-3 font-medium">用户名</th>
                              <th scope="col" className="px-6 py-3 font-medium text-center">AC 数 / 总题数</th>
                              <th scope="col" className="px-6 py-3 font-medium text-center">完成率</th>
                              <th scope="col" className="px-6 py-3 font-medium text-center">提交次数</th>
                              <th scope="col" className="px-6 py-3 font-medium text-center">通过率</th>
                              <th scope="col" className="px-6 py-3 font-medium" style={{ minWidth: 200 }}>进度</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {overview.students.map((s) => {
                              const rate = overview.total_problems > 0
                                ? Math.round((s.ac_count / overview.total_problems) * 100)
                                : 0;
                              const passRate = s.submit_count > 0
                                ? Math.round((s.ac_count / s.submit_count) * 100)
                                : 0;
                              return (
                                <tr key={s.user_id} className="bg-card hover:bg-muted/50 transition-colors">
                                  <td className="px-6 py-3 font-medium">{s.nickname || s.username}</td>
                                  <td className="px-6 py-3 text-center font-mono">
                                    {s.ac_count} / {overview.total_problems}
                                  </td>
                                  <td className="px-6 py-3 text-center font-semibold">{rate}%</td>
                                  <td className="px-6 py-3 text-center font-mono">{s.submit_count}</td>
                                  <td className="px-6 py-3 text-center font-semibold">{passRate}%</td>
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

                  {/* 作业列表（可钻取） */}
                  <div>
                    <h3 className="text-base font-semibold mb-3">作业列表</h3>
                    {overview.assignments.length === 0 ? (
                      <p className="text-muted-foreground">暂无已发布作业</p>
                    ) : (
                      <div className="space-y-3">
                        {overview.assignments.map((a) => (
                          <div
                            key={a.assignment_id}
                            className="flex items-center gap-4 p-3 bg-card rounded-lg border hover:border-primary/50 transition-colors cursor-pointer group"
                            onClick={() => nav(`/class/${classId}/assignment/${a.assignment_id}`)}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-primary shrink-0" />
                                <span className="font-medium truncate group-hover:text-primary transition-colors">
                                  {a.title}
                                </span>
                                <span className="text-xs text-muted-foreground shrink-0">
                                  {a.problem_count} 题
                                </span>
                                {a.deadline && (
                                  <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {format(new Date(a.deadline), "MM/dd HH:mm")}
                                  </span>
                                )}
                              </div>
                              <div className="mt-2">
                                <Progress value={a.avg_completion_rate} className="h-2" />
                              </div>
                            </div>
                            <div className="text-right shrink-0 w-16">
                              <span className="text-sm font-semibold">
                                {a.avg_completion_rate}%
                              </span>
                            </div>
                            <Eye className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        )}
      </Tabs>

      <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认移除成员？</DialogTitle>
            <DialogDescription>
              此操作将从班级中移除成员 "{memberToRemove?.username}"。
              该成员将无法访问班级内的私有内容。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsRemoveDialogOpen(false)}
              disabled={isRemoving}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={confirmRemove}
              disabled={isRemoving}
            >
              {isRemoving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  移除中...
                </>
              ) : (
                "确认移除"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isUnlinkDialogOpen} onOpenChange={setIsUnlinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认解除关联？</DialogTitle>
            <DialogDescription>
              此操作将解除班级与比赛 "{contestToUnlink?.title}" 的关联。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsUnlinkDialogOpen(false)}
              disabled={isUnlinking}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={confirmUnlink}
              disabled={isUnlinking}
            >
              {isUnlinking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  解除中...
                </>
              ) : (
                "确认解除"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {id && isAddMemberModalOpen && (
        <AddMemberModal
          isOpen={isAddMemberModalOpen}
          onClose={() => setIsAddMemberModalOpen(false)}
          classId={classId}
        />
      )}
      {id && isLinkModalOpen && (
        <LinkContestModal
          isOpen={isLinkModalOpen}
          onClose={() => setIsLinkModalOpen(false)}
          classId={classId}
        />
      )}
      {id && isBatchImportModalOpen && (
        <BatchImportMembersModal
          isOpen={isBatchImportModalOpen}
          onClose={() => setIsBatchImportModalOpen(false)}
          classId={classId}
          onSuccess={() => refetch()}
        />
      )}
      {id && assignmentDrilldown && (
        <AssignmentOverviewDialog
          isOpen={!!assignmentDrilldown}
          onClose={() => setAssignmentDrilldown(null)}
          classId={classId}
          assignmentId={assignmentDrilldown.assignment_id}
          assignmentTitle={assignmentDrilldown.title}
        />
      )}
      {isCreateAssignmentOpen && (
        <CreateAssignmentDialog
          isOpen={isCreateAssignmentOpen}
          onClose={() => setIsCreateAssignmentOpen(false)}
          classId={classId}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["assignmentPage", classId] });
            queryClient.invalidateQueries({ queryKey: ["classOverview", classId] });
          }}
        />
      )}
    </div>
  );
}
