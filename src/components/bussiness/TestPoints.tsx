import React, { useState } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import TestPointOverview from './TestPointOverview';
import TestPointDetail from './TestPointDetail';
import { ResultDetailItem } from "../pages/SubmissionPage";

export default function TestPoints({
  resultDetail,
}: {
  resultDetail: ResultDetailItem[] | null;
}) {
    const [selected,setSelected] = useState<string|undefined>(undefined)
  
  if (!resultDetail || resultDetail.length === 0) {
      return null;
  }
  return (
    <Accordion
      type="single"
      collapsible
      value={selected}
      onValueChange={setSelected}
    >
      {/* type 是single 只有一个会完整展示 其他会自动折叠 collapsible 可以折叠当前已展开的项 */}
      {resultDetail.map((item, index) => (
        <AccordionItem key={index} value={`test-${index}`}>
          <AccordionTrigger className="hover:no-underline group">
            <TestPointOverview
              active={selected === `test-${index}`}
              item={item}
              index={index}
            />
          </AccordionTrigger>
          <AccordionContent>
            <TestPointDetail item={item} index={index} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
