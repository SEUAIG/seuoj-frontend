import React, { ReactNode } from "react";
import "./problem-statement.css";
interface ProblemSectionProps {
  title: string;
  children: ReactNode;
}

export function ProblemSection({ title, children }: ProblemSectionProps) {
  return (
    <section className="problem-section">
      <h2>{title}</h2>
      <div className="problem-prose">{children}</div>
    </section>
  );
}
