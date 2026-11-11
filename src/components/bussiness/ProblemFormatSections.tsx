import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import { formatLabels, type StatementType } from "@/lib/statementType";
import { ProblemSection } from "./ProblemSection";

export function ProblemFormatSections({ kind, input, output }: {
  kind: StatementType;
  input: string;
  output: string;
}) {
  const [first, second] = formatLabels[kind];
  if (kind === "Interactive") {
    // Older interactive statements sometimes needed a placeholder in the required output field.
    const hasSupplement = output?.trim() && output.trim() !== "【占位】";
    return (
      <ProblemSection title={first}>
        <MarkdownRenderer>{input}</MarkdownRenderer>
        {hasSupplement && <MarkdownRenderer>{output}</MarkdownRenderer>}
      </ProblemSection>
    );
  }
  return (
    <>
      {input && <ProblemSection title={first}><MarkdownRenderer>{input}</MarkdownRenderer></ProblemSection>}
      {output && <ProblemSection title={second}><MarkdownRenderer>{output}</MarkdownRenderer></ProblemSection>}
    </>
  );
}
