import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { isValid, parseISO } from "date-fns";
import type { RootState } from "@/app/store";
import { getContestStandings } from "@/services/Contest/getContestStandings";
import type {
  ContestProblemOverview,
  ContestRuleType,
  ContestStandingsData,
  ContestStandingsRecord,
  ContestStandingsScoreDetail,
  ContestStatus,
} from "@/models/contest";

export const letterOf = (sortOrder?: number) =>
  String.fromCharCode(64 + (sortOrder ?? 1));

export const sortProblems = (list?: ContestProblemOverview[]) =>
  [...(list ?? [])].sort((a, b) => a.sort_order - b.sort_order);

/** 分钟数 → h:mm */
export const hm = (minutes: number) =>
  `${Math.floor(minutes / 60)}:${String(Math.floor(minutes % 60)).padStart(2, "0")}`;

/** 秒数 → h:mm:ss */
export const hms = (seconds: number) => {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 3600)}:${String(Math.floor(s / 60) % 60).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

export const parseTime = (value?: string) => {
  if (!value) return null;
  const d = parseISO(value);
  return isValid(d) ? d : null;
};

export function contestStatusOf(d?: {
  status?: ContestStatus;
  start_time?: string;
  end_time?: string;
}): ContestStatus {
  if (d?.status) return d.status;
  const start = parseTime(d?.start_time);
  const end = parseTime(d?.end_time);
  if (!start || !end) return "NOT_STARTED";
  const now = new Date();
  if (now < start) return "NOT_STARTED";
  if (now > end) return "FINISHED";
  return "IN_PROGRESS";
}

export const STATUS_LABEL: Record<ContestStatus, string> = {
  NOT_STARTED: "未开始",
  IN_PROGRESS: "进行中",
  FINISHED: "已结束",
};

export const isAcm = (rule?: ContestRuleType) => rule === "ACM";

export function useContestStandings(contestId: number, live = false) {
  return useQuery<ContestStandingsData | undefined>({
    queryKey: ["contestStandings", contestId],
    queryFn: () => getContestStandings(contestId, {}),
    enabled: !!contestId,
    refetchInterval: live ? 30_000 : false,
    retry: false,
  });
}

export function useCurrentUser() {
  return useSelector((state: RootState) => state.auth.user);
}

export function isMine(
  record: { user_id?: number; username?: string },
  user: { id?: string; username?: string } | null
) {
  if (!user) return false;
  if (record.user_id != null && user.id != null) return String(record.user_id) === String(user.id);
  return !!record.username && record.username === user.username;
}

export const displayName = (r: ContestStandingsRecord) =>
  r.display_name || r.nickname || r.username;

/**
 * 一道题对某人的状态，只用于染色：
 * ok 通过 · part 部分分 · bad 尝试未通过 · tried 只有不计罚时的提交 · undefined 没交过
 */
export type CellState = "ok" | "part" | "bad" | "tried";

export function cellStateOf(
  d: ContestStandingsScoreDetail | undefined,
  rule?: ContestRuleType
): CellState | undefined {
  if (!d) return undefined;
  if (isAcm(rule)) {
    if (d.accepted) return "ok";
    return d.unacceptedCount ? "bad" : "tried";
  }
  if (d.score == null) return undefined;
  if (d.accepted || d.score >= 100) return "ok";
  return d.score > 0 ? "part" : "bad";
}

export const STATE_TEXT: Record<CellState, string> = {
  ok: "text-green-700",
  part: "text-orange-700",
  bad: "text-red-600",
  tried: "text-slate-400",
};

export interface ProblemStat {
  solvers: number;
  tried: number;
  /** ACM：本题最早通过的分钟数 */
  firstAc: number | null;
}

export function problemStats(data?: ContestStandingsData): Record<string, ProblemStat> {
  const out: Record<string, ProblemStat> = {};
  for (const p of data?.problems ?? []) out[p.pid] = { solvers: 0, tried: 0, firstAc: null };
  for (const r of data?.records ?? []) {
    for (const [pid, d] of Object.entries(r.score_details ?? {})) {
      const st = (out[pid] ??= { solvers: 0, tried: 0, firstAc: null });
      const state = cellStateOf(d, data?.rule_type);
      if (!state) continue;
      st.tried++;
      if (state === "ok") {
        st.solvers++;
        if (d.acceptedTime != null && (st.firstAc == null || d.acceptedTime < st.firstAc)) {
          st.firstAc = d.acceptedTime;
        }
      }
    }
  }
  return out;
}

/** IOI 分数配色：0 红，满分深绿，中间由橙过渡到绿 */
export const scoreColor = (s: number) =>
  s <= 0 ? "hsl(0 72% 46%)" : s >= 100 ? "hsl(135 62% 30%)" : `hsl(${30 + s * 0.6} 80% 38%)`;
