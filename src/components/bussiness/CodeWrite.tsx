import React, { Suspense, lazy } from "react";
import SelectLanguage from "./SelectLanguage";

import { cn } from "@/lib/utils";

interface CodeWriteProps {
  pid: string;
  className?: string;
  headerExtra?: React.ReactNode;
  footer?: React.ReactNode;
}

const CodeEditor = lazy(() => import("./CodeEditor"));

export default function CodeWrite({
  pid,
  className,
  headerExtra,
  footer,
}: CodeWriteProps) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-col space-y-3 p-4 bg-gray-50 min-h-36",
        className
      )}
    >
      <div className="flex items-center justify-between space-x-4 ">
        <SelectLanguage />
        <div className="flex items-center gap-3">{headerExtra}</div>
      </div>

      <div className="bg-white shadow-sm rounded-lg flex-1 min-h-0 flex flex-col">
        <div className="p-4 flex-1 min-h-0">
          <Suspense
            fallback={
              <div className="flex h-full min-h-[240px] items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-sm text-muted-foreground">
                编辑器加载中...
              </div>
            }
          >
            <CodeEditor pid={pid} />
          </Suspense>
        </div>
        {footer ? (
          <div className="flex-none px-4 py-2 border-t border-gray-100">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
