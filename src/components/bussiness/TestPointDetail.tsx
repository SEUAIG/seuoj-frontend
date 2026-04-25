import React from 'react'
import { ProblemSection } from './ProblemSection'
import type { ResultDetailItem } from "@/models/submission";

export default function TestPointDetail({
  item,
  index,
}: {
  item: ResultDetailItem;
  index: number;
}) {
  return (
    <div>
      <ProblemSection title={`输入文件（${index + 1}.in）`}>
        {item.in}
      </ProblemSection>
      <ProblemSection title={`答案文件（${index + 1}.out）`}>
        {item.ans}
      </ProblemSection>
      <ProblemSection title="用户输出">
        {item.out}
      </ProblemSection>
      <ProblemSection title="系统信息">
        {item.sys || "Exited with return code 0"}
      </ProblemSection>
    </div>
  );
}
