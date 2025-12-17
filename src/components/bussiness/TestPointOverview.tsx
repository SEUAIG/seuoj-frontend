import AnswerState, { States, stateColorMap } from "../common/AnswerState";

const hoverStateColorMap: Record<States, string> = {
  "Accepted": "group-hover:text-green-500",
  "Wrong Answer": "group-hover:text-red-500",
  "Time Limit Exceeded": "group-hover:text-yellow-500",
  "Compile Error": "group-hover:text-blue-500",
  "Runtime Error": "group-hover:text-purple-500",
  "Memory Limit Exceeded": "group-hover:text-orange-500",
};

export default function TestPointOverview({
  active,
  state,
}: {
  active: boolean;
  state: States;
}) {
  const stateColor = stateColorMap[state];

  return (
    <div
      className={[
        "flex items-center justify-between w-full cursor-pointer no-underline",
        active ? "text-foreground" : "text-muted-foreground",
        "group-hover:text-foreground",
      ].join(" ")}
    >
      <span>测试点 #1</span>

      <AnswerState
        state={state}
        className={[active ? stateColor : "", hoverStateColorMap[state]].join(
          " "
        )}
      />

      <span>得分：100</span>
      <span>用时：1ms</span>
      <span>内存：284kb</span>
    </div>
  );
}
