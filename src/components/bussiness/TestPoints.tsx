import React, { useState } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import TestPointOverview from './TestPointOverview';
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
        <AccordionTrigger >
          <TestPointOverview active={selected === "test-1"} state="Accepted" />
        </AccordionTrigger>
        <AccordionContent>是的，组件遵循 WAI-ARIA 设计模式。</AccordionContent>
      </AccordionItem>
      <AccordionItem value="test-2">
        <AccordionTrigger>它符合可访问性规范吗？</AccordionTrigger>
        <AccordionContent>是的，组件遵循 WAI-ARIA 设计模式。</AccordionContent>
      </AccordionItem>
      <AccordionItem value="test-3">
        <AccordionTrigger>它符合可访问性规范吗？</AccordionTrigger>
        <AccordionContent>是的，组件遵循 WAI-ARIA 设计模式。</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
