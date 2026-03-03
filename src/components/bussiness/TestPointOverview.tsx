import AnswerState from "../common/AnswerState";
import ScoreBadge from "../common/ScoreBadage";
import { ResultDetailItem } from "../pages/SubmissionPage";

export default function TestPointOverview({
  active,
  item,
  index,
}: {
  active: boolean;
  item: ResultDetailItem;
  index: number;
}) {
  const score = item.type === "Accepted" ? 100 : 0;
  return (
    <div
      className={[
        "grid items-center w-full cursor-pointer no-underline",
        "grid-cols-5 justify-items-start gap-4",
        active ? "text-foreground" : "text-muted-foreground",
        "group-hover:text-foreground",
      ].join(" ")}
    >
      <span className="whitespace-nowrap">测试点 #{index + 1}</span>
      <span className="min-w-0 whitespace-nowrap overflow-hidden text-ellipsis">
        <AnswerState state={item.type} active={active} />
      </span>
      <span className="whitespace-nowrap tabular-nums flex items-center gap-1">
        得分：
        <ScoreBadge score={score} active={active} />
      </span>
      <span className="whitespace-nowrap tabular-nums">
        用时：{item.time}ms
      </span>
      <span className="whitespace-nowrap tabular-nums">
        内存：{(item.mem / 1024).toFixed(0)}KB
      </span>
    </div>
  );
}
