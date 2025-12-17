import React, { useState } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import TestPointOverview from './TestPointOverview';
import TestPointDetail from './TestPointDetail';
export default function TestPoints() {
    const [selected,setSelected] = useState<string|undefined>(undefined)
  return (
    <Accordion
      type="single"
      collapsible
      value={selected}
      onValueChange={setSelected}
    >
      {/* type 是single 只有一个会完整展示 其他会自动折叠 collapsible 可以折叠当前已展开的项 */}
      <AccordionItem value="test-1">
        <AccordionTrigger className="hover:no-underline group">
          <TestPointOverview active={selected === "test-1"} state="Accepted" />
        </AccordionTrigger>
        <AccordionContent>
          <TestPointDetail />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="test-2">
        <AccordionTrigger className="hover:no-underline group">
          <TestPointOverview active={selected === "test-2"} state="Accepted" />
        </AccordionTrigger>
        <AccordionContent>
          <TestPointDetail />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="test-3">
        <AccordionTrigger className="hover:no-underline group">
          <TestPointOverview active={selected === "test-3"} state="Accepted" />
        </AccordionTrigger>
        <AccordionContent>
          <TestPointDetail />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
