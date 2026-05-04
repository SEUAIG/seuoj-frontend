import React, { Dispatch, SetStateAction, Suspense, lazy } from "react";
import SelectContestLanguage from "./SelectContestLanguage";
import { cn } from "@/lib/utils";
interface ContestCodeWriteProps {
  setCodeFile: Dispatch<SetStateAction<string>>;
  contest_id: number;
  pid: string;
  className?: string;
  headerExtra?: React.ReactNode;
  footer?: React.ReactNode;
}

const ContestCodeEditor = lazy(() => import("./ContestCodeEditor"));

export default function ContestCodeWrite({
  setCodeFile,
  contest_id,
  pid,
  className,
  headerExtra,
  footer,
}: ContestCodeWriteProps) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-col space-y-3 p-4 bg-gray-50 min-h-36",
        className
      )}
    >
      <div className="flex items-center justify-between space-x-4 ">
        <SelectContestLanguage />
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
            <ContestCodeEditor contest_id={contest_id} pid={pid} />
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
