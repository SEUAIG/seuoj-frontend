import React from 'react'
import { ProblemSection } from './ProblemSection'
import { ResultDetailItem } from "../pages/SubmissionPage";

export default function TestPointDetail({
  item,
  index,
}: {
  item: ResultDetailItem;
  index: number;
}) {
  return (
    <div>
      <ProblemSection title={`输入文件（${index + 1}.in）`} download={true}>
        {item.in}
      </ProblemSection>
      <ProblemSection title={`答案文件（${index + 1}.out）`} download={true}>
        {item.ans}
      </ProblemSection>
      <ProblemSection title="用户输出" download={false}>
        {item.out}
      </ProblemSection>
      <ProblemSection title="系统信息" download={false}>
        {item.sys || "Exited with return code 0"}
      </ProblemSection>
    </div>
  );
}
