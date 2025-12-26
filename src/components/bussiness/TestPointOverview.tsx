import AnswerState from "../common/AnswerState";

export default function TestPointOverview({
  active,
  state,
}: {
  active: boolean;
  state: string;
}) {
  return (
    <div
      className={[
        "flex items-center justify-between w-full cursor-pointer no-underline",
        active ? "text-foreground" : "text-muted-foreground",
        "group-hover:text-foreground",
      ].join(" ")}
    >
      <span>测试点 #1</span>

      <AnswerState state={state} active={active} />

      <span>得分：100</span>
      <span>用时：1ms</span>
      <span>内存：284kb</span>
    </div>
  );
}
