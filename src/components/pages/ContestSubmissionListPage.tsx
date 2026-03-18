import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getContestSubmissionPage } from "@/services/Contest/getContestSubmissionPage";
import { AnswerStateNew } from "@/components/common/AnswerState";
import ProblemListPageChoose from "@/components/bussiness/ProblemListPageChoose";

export default function ContestSubmissionListPage() {
  const { contest_public_id } = useParams();
  const nav = useNavigate();
  const [page, setPage] = useState(1);
  const size = 20;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["contestSubmissions", contest_public_id, page],
    queryFn: () =>
      getContestSubmissionPage(contest_public_id!, { current: page, size }),
    enabled: !!contest_public_id,
  });

  const records = data?.records || [];
  const total = data?.total || 0;
  const pages = Math.ceil(total / size);

  return (
    <div className="w-4/5 mx-auto py-6 space-y-6">
      <Helmet>
        <title>提交记录 - 比赛 - SeuOJ</title>
      </Helmet>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => nav(`/contest/${contest_public_id}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">提交记录</h1>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[200px] pl-6">运行ID</TableHead>
                  <TableHead>题目</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>分数</TableHead>
                  <TableHead>语言</TableHead>
                  <TableHead>用户</TableHead>
                  <TableHead className="pr-6">提交时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading || isFetching ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : records.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-24 text-center text-muted-foreground"
                    >
                      暂无提交记录
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((record) => (
                    <TableRow
                      key={record.submission_no}
                      className="hover:bg-muted/50"
                    >
                      <TableCell className="font-mono text-sm pl-6">
                        <span
                          className="text-blue-600 hover:underline cursor-pointer"
                          onClick={() =>
                            nav(
                              `/contest/${contest_public_id}/submission/${record.submission_no}`
                            )
                          }
                        >
                          {record.submission_no}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className="hover:underline cursor-pointer text-blue-600"
                          onClick={() =>
                            nav(
                              `/contest/${contest_public_id}/${record.problem.pid}`
                            )
                          }
                        >
                          {record.problem.title}
                        </span>
                      </TableCell>
                      <TableCell>
                        <AnswerStateNew
                          status={record.status}
                          verdict={record.verdict || undefined}
                        />
                      </TableCell>
                      <TableCell className="font-mono">
                        {record.score !== null ? record.score : "-"}
                      </TableCell>
                      <TableCell>{record.language || "Unknown"}</TableCell>
                      <TableCell>{record.username}</TableCell>
                      <TableCell className="text-muted-foreground text-sm pr-6">
                        {new Date(record.submit_time).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {pages > 1 && (
        <div className="flex justify-center mt-6">
          <ProblemListPageChoose
            pages={pages}
            current={page}
            dispatch={((action: any) => {
              if (typeof action === "function") {
                action((newPage: number) => setPage(newPage));
              } else if (action?.payload) {
                setPage(action.payload);
              }
              return { type: "", payload: 0 };
            }) as any}
            refetch={() => {}}
            setCurrentAction={((val: number) => ({
              type: "SET_CURRENT",
              payload: val,
              match: (action: any) => action.type === "SET_CURRENT",
            })) as any}
          />
        </div>
      )}
    </div>
  );
}
