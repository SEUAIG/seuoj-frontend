import React from 'react'
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from 'react-router-dom';
export default function SearchResultList({ data }: { data: any[] }) {
  const nav = useNavigate();
  if (!data) {
    return null;
  }

  return (
    <div className="absolute top-full mt-1 w-full z-50 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95">
      <ScrollArea className="max-h-[300px]">
        {data.length > 0 ? (
          <div className="p-1">
            {data.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  nav(`/problem/${item.id}`);
                }}
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
              >
                <span className="font-mono mr-2 text-muted-foreground w-12 shrink-0">
                  {item.id}
                </span>
                <span className="truncate font-medium">{item.title}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-sm text-muted-foreground">
            暂无结果
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
