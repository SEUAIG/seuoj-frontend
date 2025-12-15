import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface ProblemSectionProps {
  title: string;
  children: React.ReactNode;
}

export function ProblemSection({ title, children }: ProblemSectionProps) {
  return (
    <Card className="overflow-hidden border shadow-sm">
      <CardHeader className="bg-gray-50 border-b py-3 px-4">
        <CardTitle className="text-sm font-bold text-gray-700">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 text-gray-700 leading-relaxed">
        {children}
      </CardContent>
    </Card>
  );
}
