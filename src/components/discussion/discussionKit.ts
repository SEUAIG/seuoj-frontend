import { format, formatDistanceToNowStrict } from "date-fns";
import { zhCN } from "date-fns/locale";
import { parseTime } from "@/components/contest/contestKit";

/** 相对时间（「3 小时前」）和悬停显示的完整时间 */
export function timeAgo(s?: string | null) {
  const d = parseTime(s ?? undefined);
  if (!d) return { text: "", title: "" };
  // 一分钟内或客户端时钟偏慢（时间落在将来）时都显示「刚刚」，不出现「X 秒内」
  const fresh = Date.now() - d.getTime() < 60_000;
  return {
    text: fresh ? "刚刚" : formatDistanceToNowStrict(d, { addSuffix: true, locale: zhCN }),
    title: format(d, "yyyy-MM-dd HH:mm:ss"),
  };
}

/** 题目页「题解」标签的地址：比赛入口和题库入口分开 */
export function solutionsTabPath(pid: string, contestId?: number | null) {
  return contestId ? `/contest/${contestId}/${pid}?tab=solutions` : `/problemsLibrary/${pid}?tab=solutions`;
}

/** 题解详情页地址，从比赛进来的带上 contest_id 方便链回 */
export function postPath(id: number, contestId?: number | null) {
  return contestId ? `/post/${id}?contest_id=${contestId}` : `/post/${id}`;
}
