import React from "react";
interface ScoreBadgeProps {
  score: number;
  active?: boolean;
}
function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
const SCORE_COLORS: string[] = [
  "#dc2626", 
  "#ef4444", 
  "#f97316", 
  "#fb923c", 
  "#f59e0b", 
  "#eab308", 
  "#a3e635",
  "#84cc16",
  "#22c55e", 
  "#16a34a", 
  "#15803d", 
];
function getScoreColor(score: number) {
  const s = clamp(score, 0, 100);
  const bucket = Math.floor(s / 10);
  return SCORE_COLORS[bucket];
}
export default function ScoreBadge({ score, active }: ScoreBadgeProps) {
  const color = getScoreColor(score);
  const style = { "--score-color": color } as React.CSSProperties;
  // 设置样式变量 父元素有group 才能在子元素使用grouphover tailwind先静态编译成css 声明也是设置颜色 tailwind要么用css变量 要么就要用写死的字符串 但可以条件判断
  const colorClass =
    active === undefined
      ? "text-[var(--score-color)]"
      : `${
          active ? "text-[var(--score-color)]" : "text-muted-foreground"
        } group-hover:text-[var(--score-color)] transition-colors`;
  return (
    <span
      className={`inline-flex items-center rounded-md py-0.5 text-sm font-semibold ${colorClass}`}
      style={style}
    >
      {score}
    </span>
  );
}
