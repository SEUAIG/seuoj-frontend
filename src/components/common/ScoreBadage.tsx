import React from "react";

interface ScoreBadgeProps {
  score: number; 
}
function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function getScoreColor(score: number) {
  const s = clamp(score, 0, 100) / 100;
  const red = { r: 239, g: 68, b: 68 };
  const yellow = { r: 234, g: 179, b: 8 };
  const green = { r: 34, g: 197, b: 94 };
  let from, to, t;
  if (s < 0.5) {
    from = red;
    to = yellow;
    t = s / 0.5;
  } else {
    from = yellow;
    to = green;
    t = (s - 0.5) / 0.5;
  }
  const r = Math.round(lerp(from.r, to.r, t));
  const g = Math.round(lerp(from.g, to.g, t));
  const b = Math.round(lerp(from.b, to.b, t));
  return `rgb(${r}, ${g}, ${b})`;
}

export default function ScoreBadge({ score }: ScoreBadgeProps) {
  const color = getScoreColor(score);
  return (
    <span
      className="inline-flex items-center rounded-md  py-0.5 text-sm font-semibold"
      style={{ color }}
    >
      {score}
    </span>
  );
}
