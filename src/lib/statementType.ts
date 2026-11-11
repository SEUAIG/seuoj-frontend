export const statementLabels = {
  Standard: "传统题",
  Interactive: "交互题",
  InteractiveWithInput: "交互题（含初始输入）",
  Communication: "通信题（两阶段题面）",
} as const;

export type StatementType = keyof typeof statementLabels;
export type StoredStatementType = StatementType | "Special";

export function statementTypeFor(content: {
  statement_type?: StoredStatementType;
  info?: { problem_type?: string; checker_type?: string };
}): StatementType {
  const { info, statement_type } = content;
  if (!info?.problem_type) return statement_type === "Special" ? "Standard" : statement_type ?? "Standard";
  if (info.problem_type.toLowerCase() === "interactive" || info.checker_type?.toLowerCase() === "interactor") {
    return statement_type === "InteractiveWithInput" ? statement_type : "Interactive";
  }
  if (statement_type === "Communication") return statement_type;
  return "Standard";
}

export const formatLabels: Record<StatementType, readonly [string, string]> = {
  Standard: ["输入格式", "输出格式"],
  Interactive: ["交互格式", "补充交互说明（可选）"],
  InteractiveWithInput: ["初始输入", "交互格式"],
  Communication: ["第一次运行", "第二次运行"],
};
