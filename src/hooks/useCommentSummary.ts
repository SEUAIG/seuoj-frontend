import { useQuery } from "@tanstack/react-query";
import { getCommentSummary } from "@/services/Discussion/comments";
import type { ThreadTarget } from "@/models/discussion";

/** 题目页「💭 讨论」入口：能不能进、有几条；看不了时 can_view = false，不报错 */
export default function useCommentSummary(target: ThreadTarget, enabled = true) {
  return useQuery({
    queryKey: ["commentSummary", target.target_type, target.pid ?? null, target.contest_id ?? null],
    queryFn: () => getCommentSummary(target),
    enabled,
    retry: false,
    staleTime: 30_000,
  });
}
