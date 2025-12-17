import React from 'react'
import { ProblemSection } from './ProblemSection'

export default function TestPointDetail() {
  return (
    <div>
      <ProblemSection title="输入文件（1.in）" download={true}>
        {"1 2"}
      </ProblemSection>
      <ProblemSection title="答案文件（1.out）" download={true}>
        {"3"}
      </ProblemSection>
      <ProblemSection title="用户输出" download={false}>
        {"3"}
      </ProblemSection>
      <ProblemSection title="系统信息" download={false}>
        {"Exited with return code 0"}
      </ProblemSection>
    </div>
  );
}
