import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getContestStandings } from "@/services/Contest/getContestStandings";
import type {
  ContestStandingsRecord,
  ContestStandingsScoreDetail,
  ContestProblemOverview,
} from "@/models/contest";
import { cn } from "@/lib/utils";

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-700 font-bold text-sm">
        1
      </span>
    );
  if (rank === 2)
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-200 text-slate-600 font-bold text-sm">
        2
      </span>
    );
  if (rank === 3)
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-orange-100 text-orange-600 font-bold text-sm">
        3
      </span>
    );
  return <span className="text-sm text-muted-foreground">{rank}</span>;
}

function AcmProblemCell({
  detail,
}: {
  detail?: ContestStandingsScoreDetail;
}) {
  if (!detail || detail.accepted === null || detail.accepted === undefined)
    return (
      <TableCell className="text-center text-muted-foreground text-xs">-</TableCell>
    );

  return (
    <TableCell className="text-center">
      {detail.accepted ? (
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-emerald-600 font-bold text-sm">
            {detail.unacceptedCount ? `+${detail.unacceptedCount}` : "+"}
          </span>
          {detail.penaltyTime != null && (
            <span className="text-xs text-muted-foreground">
              {detail.penaltyTime}
            </span>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-red-500 font-bold text-sm">
            {detail.unacceptedCount ? `-${detail.unacceptedCount}` : "-"}
          </span>
        </div>
      )}
    </TableCell>
  );
}

function ScoreProblemCell({
  detail,
}: {
  detail?: ContestStandingsScoreDetail;
}) {
  if (!detail || detail.score == null)
    return (
      <TableCell className="text-center text-muted-foreground text-xs">-</TableCell>
    );

  return (
    <TableCell className="text-center">
      <span
        className={cn(
          "font-mono text-sm font-medium",
          detail.score === 100 || detail.accepted
            ? "text-emerald-600"
            : detail.score > 0
              ? "text-amber-600"
              : "text-red-500"
        )}
      >
        {detail.score}
      </span>
    </TableCell>
  );
}

export default function ContestStandingsPage() {
  const { id } = useParams();
  const contestId = Number(id);
  const nav = useNavigate();

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: ["contestStandings", contestId],
    queryFn: () => getContestStandings(contestId!, {}),
    enabled: !!contestId,
  });

  const loading = isLoading || isFetching;
  const ruleType = data?.rule_type ?? "ACM";
  const problems: ContestProblemOverview[] = data?.problems ?? [];
  const records: ContestStandingsRecord[] = data?.records ?? [];

  return (
    <div className="w-4/5 mx-auto py-6 space-y-6 min-h-screen">
      <Helmet>
        <title>比赛排名 - SEUOJ</title>
      </Helmet>

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => nav(`/contest/${contestId}`)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-500" />
            比赛排名
          </h1>
        </div>
        <div className="text-sm text-muted-foreground">
          赛制：<span className="font-semibold text-foreground">{ruleType}</span>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[80px] text-center">排名</TableHead>
                  <TableHead className="min-w-[120px]">用户</TableHead>
                  {ruleType === "ACM" ? (
                    <>
                      <TableHead className="text-center w-[80px]">解题数</TableHead>
                      <TableHead className="text-center w-[80px]">罚时</TableHead>
                    </>
                  ) : (
                    <TableHead className="text-center w-[80px]">总分</TableHead>
                  )}
                  {problems.map((p) => (
                    <TableHead key={p.pid} className="text-center min-w-[70px]">
                      <span
                        className="cursor-pointer hover:text-blue-600 hover:underline"
                        onClick={() =>
                          nav(
                            `/contest/${contestId}/${p.pid}?from=${encodeURIComponent(window.location.pathname)}`
                          )
                        }
                      >
                        {p.title ?? p.pid}
                      </span>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={3 + problems.length + (ruleType === "ACM" ? 2 : 1)}
                      className="h-32 text-center"
                    >
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : records.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3 + problems.length + (ruleType === "ACM" ? 2 : 1)}
                      className="h-32 text-center text-muted-foreground"
                    >
                      暂无排名数据
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((record) => (
                    <TableRow
                      key={record.username}
                      className="hover:bg-muted/50"
                    >
                      <TableCell className="text-center">
                        <RankBadge rank={record.rank} />
                      </TableCell>
                      <TableCell className="font-medium">
                        {record.nickname || record.username}
                        {record.nickname && (
                          <span className="text-xs text-muted-foreground ml-1">
                            @{record.username}
                          </span>
                        )}
                      </TableCell>
                      {ruleType === "ACM" ? (
                        <>
                          <TableCell className="text-center font-mono font-bold text-emerald-600">
                            {record.score}
                          </TableCell>
                          <TableCell className="text-center font-mono text-muted-foreground text-sm">
                            {record.penalty ?? "-"}
                          </TableCell>
                        </>
                      ) : (
                        <TableCell className="text-center font-mono font-bold">
                          {record.score}
                        </TableCell>
                      )}
                      {problems.map((p) =>
                        ruleType === "ACM" ? (
                          <AcmProblemCell
                            key={p.pid}
                            detail={record.score_details?.[p.pid]}
                          />
                        ) : (
                          <ScoreProblemCell
                            key={p.pid}
                            detail={record.score_details?.[p.pid]}
                          />
                        )
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
