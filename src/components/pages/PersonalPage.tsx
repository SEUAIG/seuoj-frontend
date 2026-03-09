import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { toast } from "sonner";
import AnswerState from "@/components/common/AnswerState";
import ProblemListPageChoose from "@/components/bussiness/ProblemListPageChoose";
import { setCurrent as setSubmissionCurrent } from "@/features/SubmissionList/submissionListSlice";
import nahida from "@/assets/nahida.png";
import seu from "@/assets/seu.png";
import useQueryToGetSubmission from "@/hooks/useQueryToGetSubmission";
import SubmissionHeatmap from "@/components/profile/SubmissionHeatmap";

export default function PersonalPage() {
  const dispatch = useDispatch();
  const { current, size } = useSelector(
    (state: RootState) => state.submissionList
  );
  const [activeTab, setActiveTab] = useState("practice");
  const isSubmissionActive = activeTab === "submissions";
  const { data, isLoading, isFetching, isError, error, refetch } =
    useQueryToGetSubmission(current, size, isSubmissionActive);
  const records = data?.records || [];
  const total = data?.total || 0;
  const loadError = isError
    ? error instanceof Error
      ? error.message
      : "加载提交记录失败"
    : null;
  const pages = useMemo(() => {
    if (!total) return 0;
    return Math.ceil(total / Number(size));
  }, [total, size]);
  useEffect(() => {
    if (isError && loadError) {
      toast.error(loadError, { position: "top-center" });
    }
  }, [isError, loadError]);
  return (
    <>
      <Helmet>
        <title>个人主页 - SeuOJ</title>
      </Helmet>
      <div className="w-4/5 mx-auto py-6">
        <section className="relative overflow-hidden rounded-2xl border">
          <div
            className="absolute inset-0 bg-center bg-cover"
            style={{ backgroundImage: `url(${seu})` }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_55%)]" />
          <div className="relative z-10 px-8 py-10 text-white">
            <div className="text-2xl font-semibold">个人主页</div>
            <div className="text-sm text-white/70 mt-2">1</div>
          </div>
        </section>
        <div className="mt-6 grid gap-6 lg:grid-cols-[300px,1fr]">
          <aside className="space-y-6">
            <Card className="overflow-hidden">
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={nahida} />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-lg font-semibold">用户名</div>
                    <div className="text-sm text-muted-foreground">
                      Problem Solver
                    </div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">Tagline</div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm">编辑资料</Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-3 p-6">
                {[
                  { label: "解题数", value: "1024" },
                  { label: "竞赛分", value: "1211" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium text-foreground">
                      {item.value}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-3 p-6">
                <div className="text-sm font-medium">个人简介</div>
                <div className="text-sm text-muted-foreground">用户权限</div>
              </CardContent>
            </Card>
          </aside>
          <section className="space-y-4">
            <SubmissionHeatmap year={new Date().getFullYear()} />
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-4"
            >
              <div className="sticky top-4 z-10 rounded-xl border bg-background/90 px-4 py-2 backdrop-blur">
                <TabsList className="w-full justify-start gap-2 bg-transparent p-0">
                  <TabsTrigger value="practice">题单</TabsTrigger>
                  <TabsTrigger value="stats">解题数据</TabsTrigger>
                  <TabsTrigger value="submissions">提交记录</TabsTrigger>
                  <TabsTrigger value="discussion">讨论</TabsTrigger>
                  <TabsTrigger value="achievement">成就</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="practice">
                <div className="grid gap-4 md:grid-cols-2">
                  {["题单列表", "最近更新", "HOT 标签"].map((name) => (
                    <Card key={name}>
                      <CardContent className="p-6 text-sm text-muted-foreground">
                        {name}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="stats">
                <div className="grid gap-4 md:grid-cols-2">
                  {["解题总览", "难度分布", "排名趋势"].map((name) => (
                    <Card key={name}>
                      <CardContent className="p-6 text-sm text-muted-foreground">
                        {name}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="submissions">
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        共计{" "}
                        <span className="font-semibold text-foreground">
                          {total}
                        </span>{" "}
                        条记录
                      </div>
                      <div className="flex items-center gap-3">
                        {isFetching && records.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            更新中...
                          </div>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => refetch()}
                        >
                          刷新
                        </Button>
                      </div>
                    </div>
                    {isLoading && records.length === 0 && (
                      <div className="flex items-center justify-center py-10 text-muted-foreground">
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        加载提交记录中...
                      </div>
                    )}
                    {loadError && records.length === 0 && (
                      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-8 text-sm text-muted-foreground">
                        {loadError}
                        <Button size="sm" onClick={() => refetch()}>
                          重试
                        </Button>
                      </div>
                    )}
                    {loadError && records.length > 0 && (
                      <div className="rounded-lg border border-dashed px-4 py-2 text-xs text-muted-foreground">
                        {loadError}
                      </div>
                    )}
                    {!isLoading && !loadError && records.length === 0 && (
                      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                        暂无提交记录
                      </div>
                    )}
                    {records.length > 0 && (
                      <div className={isFetching ? "opacity-70" : ""}>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-center">
                                提交号
                              </TableHead>
                              <TableHead className="text-center">
                                题目
                              </TableHead>
                              <TableHead className="text-center">
                                状态
                              </TableHead>
                              <TableHead className="text-center">
                                语言
                              </TableHead>
                              <TableHead className="text-center">
                                提交者
                              </TableHead>
                              <TableHead className="text-center">
                                提交时间
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {records.map((record) => (
                              <TableRow key={record.submission_no}>
                                <TableCell className="text-center font-mono">
                                  <span title={record.submission_no}>
                                    {record.submission_no.slice(0, 8)}
                                  </span>
                                </TableCell>
                                <TableCell className="text-center">
                                  #{record.pid}
                                </TableCell>
                                <TableCell className="text-center">
                                  {record.verdict ? (
                                    <AnswerState state={record.verdict} />
                                  ) : (
                                    <span className="text-muted-foreground">
                                      {record.status}
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell className="text-center">
                                  {record.language}
                                </TableCell>
                                <TableCell className="text-center">
                                  {record.username}
                                </TableCell>
                                <TableCell className="text-center">
                                  {record.submit_time}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                    {!!pages && (
                      <ProblemListPageChoose
                        pages={pages}
                        current={current}
                        dispatch={dispatch}
                        refetch={() => refetch()}
                        setCurrentAction={setSubmissionCurrent}
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="discussion">
                <div className="grid gap-4 md:grid-cols-2">
                  {["最近发帖", "最近回复"].map((name) => (
                    <Card key={name}>
                      <CardContent className="p-6 text-sm text-muted-foreground">
                        {name}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="achievement">
                <div className="grid gap-4 md:grid-cols-2">
                  {["徽章墙", "里程碑记录"].map((name) => (
                    <Card key={name}>
                      <CardContent className="p-6 text-sm text-muted-foreground">
                        {name}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </div>
    </>
  );
}
