import React, { useState } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import TestPointOverview from './TestPointOverview';
import TestPointDetail from './TestPointDetail';
import type { ResultDetailItem, SubtaskItem } from "@/models/submission";
import { Badge } from "@/components/ui/badge";

export default function TestPoints({
  resultDetail,
  subtasks,
}: {
  resultDetail: ResultDetailItem[] | null;
  subtasks?: SubtaskItem[];
}) {
  const [selected, setSelected] = useState<string | undefined>(undefined);

  if (!resultDetail || resultDetail.length === 0) {
    return null;
  }

  const renderTestPoints = (points: ResultDetailItem[], startIndex: number = 0) => (
    <Accordion
      type="single"
      collapsible
      value={selected}
      onValueChange={setSelected}
      className="w-full"
    >
      {points.map((item, localIndex) => {
        const actualIndex = startIndex + localIndex;
        return (
          <AccordionItem key={actualIndex} value={`test-${actualIndex}`}>
            <AccordionTrigger className="hover:no-underline group">
              <TestPointOverview
                active={selected === `test-${actualIndex}`}
                item={item}
                index={actualIndex}
              />
            </AccordionTrigger>
            <AccordionContent>
              <TestPointDetail item={item} index={actualIndex} />
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );

  if (subtasks && subtasks.length > 0) {
    return (
      <div className="space-y-6 mt-4">
        {subtasks.map((subtask, index) => {
          // Subtask's cases are 1-based IDs usually, mapping to resultDetail index
          const subtaskCases = subtask.cases.map(id => {
            // Find by id if id exists, otherwise assume index = id - 1
            const found = resultDetail.find(r => r.id === id);
            return found || resultDetail[id - 1];
          }).filter(Boolean);

          return (
            <div key={index} className="border rounded-lg overflow-hidden shadow-sm">
              <div className="bg-muted/50 p-4 border-b flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <h3 className="font-semibold text-lg">Subtask #{subtask.id}</h3>
                  <Badge variant="outline">{subtask.type === 'min' ? 'Min' : 'Sum'} Score</Badge>
                  {subtask.pre_subtasks && subtask.pre_subtasks.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      Dependencies: {subtask.pre_subtasks.join(', ')}
                    </span>
                  )}
                </div>
                <div className="font-mono font-bold">
                  Score: <span className="text-primary">{subtask.score}</span>
                </div>
              </div>
              <div className="p-2">
                {renderTestPoints(subtaskCases as ResultDetailItem[], subtask.cases[0] ? subtask.cases[0] - 1 : 0)}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return renderTestPoints(resultDetail);
}
