import React from 'react'
import TestPointOverview from './TestPointOverview';
import type { ResultDetailItem } from "@/models/submission";
import { Card } from '../ui/card';

export default function ContestTestPoints({
  resultDetail,
}: {
  resultDetail: ResultDetailItem[] | null;
}) {
  if (!resultDetail || resultDetail.length === 0) {
      return null;
  }

  return (
    <div className="space-y-2">
      {resultDetail.map((item, index) => (
        <Card key={index} className="p-4 hover:bg-muted/50 transition-colors">
            <TestPointOverview
              active={true} 
              item={item}
              index={index}
            />
        </Card>
      ))}
    </div>
  );
}
