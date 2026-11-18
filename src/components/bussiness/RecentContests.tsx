import React from "react";
import { Link } from "react-router-dom";
import { format, isValid, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import useQueryToGetContestList from "@/hooks/useQueryToGetContestList";
import type { ContestStatus } from "@/models/contest";

const STATUS_LABEL: Record<ContestStatus, string> = {
  NOT_STARTED: "未开始",
  IN_PROGRESS: "进行中",
  FINISHED: "已结束",
};

const STATUS_CLASS: Record<ContestStatus, string> = {
  NOT_STARTED: "bg-blue-50 text-blue-700 border-blue-200",
  IN_PROGRESS: "bg-emerald-50 text-emerald-700 border-emerald-200",
  FINISHED: "bg-slate-50 text-slate-600 border-slate-200",
};

function formatTime(value?: string) {
  if (!value) return "";
  const parsed = parseISO(value);
  return isValid(parsed) ? format(parsed, "MM-dd HH:mm") : value;
}

export default function RecentContests({ size = 5 }: { size?: number }) {
  const { data, isLoading, isError } = useQueryToGetContestList(
    { current: 1, size },
    true
  );
  const records = data?.records ?? [];

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle>最近比赛</CardTitle>
        <Link to="/contest" className="text-sm text-muted-foreground hover:text-foreground">
          全部比赛 →
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground text-sm">加载中…</p>
        ) : isError ? (
          <p className="text-muted-foreground text-sm">比赛列表加载失败。</p>
        ) : records.length === 0 ? (
          <p className="text-muted-foreground text-sm">暂无比赛。</p>
        ) : (
          <ul className="divide-y">
            {records.map((c) => (
              <li key={c.contest_id}>
                <Link
                  to={`/contest/${c.contest_id}`}
                  className="flex items-center gap-3 py-2.5 hover:bg-muted/50 -mx-2 px-2 rounded-md"
                >
                  <span className="flex-1 min-w-0 truncate font-medium">
                    {c.title || `比赛 #${c.contest_id}`}
                  </span>
                  {c.rule_type && (
                    <span className="text-xs text-muted-foreground shrink-0">{c.rule_type}</span>
                  )}
                  <span className="text-xs text-muted-foreground shrink-0 tabular-nums hidden sm:inline">
                    {formatTime(c.start_time)} ~ {formatTime(c.end_time)}
                  </span>
                  {c.status && (
                    <Badge variant="outline" className={`shrink-0 ${STATUS_CLASS[c.status] ?? ""}`}>
                      {STATUS_LABEL[c.status] ?? c.status}
                    </Badge>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
