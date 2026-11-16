import { useCallback, useSyncExternalStore } from "react";
import { useQuery } from "@tanstack/react-query";
import { getContestNotices } from "@/services/Contest/notices";
import type { ContestAnnouncement, ContestClarification, ContestNoticesData } from "@/models/contest";
import { isClientError, useCurrentUser } from "./contestKit";

/** 公告与答疑：每 30 秒拉一次，所有比赛页共用同一个查询 */
export function useContestNotices(contestId: number) {
  return useQuery<ContestNoticesData>({
    queryKey: ["contestNotices", contestId],
    queryFn: () => getContestNotices(contestId),
    enabled: !!contestId,
    // 被拒绝（4xx）就停，网络抖动继续轮询；失败不弹全局提示，页面保留上次的数据
    refetchInterval: (query) => (isClientError(query.state.error) ? false : 30_000),
    refetchIntervalInBackground: true,
    retry: false,
    meta: { silentError: true },
  });
}

export const announcementKey = (a: ContestAnnouncement) => `${a.announcement_id}@${a.updated_at ?? a.created_at}`;

/** 对选手有意义的答疑事件：自己的或公开的提问得到回复 */
export const answeredKey = (c: ContestClarification) => `${c.clarification_id}@${c.answered_at}`;

export function answeredEvents(data?: ContestNoticesData) {
  return (data?.clarifications ?? []).filter((c) => c.answer && (c.mine || c.is_public));
}

export function pendingQuestions(data?: ContestNoticesData) {
  return (data?.clarifications ?? []).filter((c) => !c.answer);
}

// ---------- 已读记录：localStorage，按比赛 + 用户区分，标签页之间同步 ----------

interface Seen {
  a: string[];
  c: string[];
}

const EVENT = "contest-notices-seen";
const storageKey = (contestId: number, userKey: string) => `contest:${contestId}:seen:${userKey}`;
const EMPTY = '{"a":[],"c":[]}';

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVENT, cb);
  };
}

function readRaw(key: string) {
  try {
    return localStorage.getItem(key) ?? EMPTY;
  } catch {
    return EMPTY;
  }
}

export function useSeen(contestId: number) {
  const user = useCurrentUser();
  const key = storageKey(contestId, user?.id ?? "guest");
  const raw = useSyncExternalStore(subscribe, () => readRaw(key));
  let seen: Seen;
  try {
    seen = JSON.parse(raw) as Seen;
  } catch {
    seen = { a: [], c: [] };
  }

  const mark = useCallback(
    (kind: keyof Seen, keys: string[]) => {
      let cur: Seen;
      try {
        cur = JSON.parse(readRaw(key)) as Seen;
      } catch {
        cur = { a: [], c: [] };
      }
      const set = new Set(cur[kind]);
      if (keys.every((k) => set.has(k))) return;
      // 只保留当前仍存在的条目，避免无限增长
      cur[kind] = keys;
      try {
        localStorage.setItem(key, JSON.stringify(cur));
      } catch {
        /* 存储不可用时只是不记已读 */
      }
      window.dispatchEvent(new Event(EVENT));
    },
    [key]
  );

  return { seen, mark };
}
