import React, { Dispatch, SetStateAction } from "react";
import SelectContestLanguage from "./SelectContestLanguage";
import CodeToolsGroup from "./CodeToolsGroup";
import ContestCodeEditor from "./ContestCodeEditor";
import { useDispatch } from "react-redux";
import { setContestCodeFile } from "@/features/Code/contestCodeSlice";
import { cn } from "@/lib/utils";
interface ContestCodeWriteProps {
  setCodeFile: Dispatch<SetStateAction<string>>;
  contest_id: number;
  pid: string;
  className?: string;
  headerExtra?: React.ReactNode;
  footer?: React.ReactNode;
}
export default function ContestCodeWrite({
  setCodeFile,
  contest_id,
  pid,
  className,
  headerExtra,
  footer,
}: ContestCodeWriteProps) {
  const dispatch = useDispatch();
  const handleClear = () => {
    dispatch(
      setContestCodeFile({ contest_id: contest_id, pid: pid, codeFile: "" })
    );
  };
  return (
    <div
      className={cn(
        "flex min-h-0 flex-col space-y-3 p-4 bg-gray-50 min-h-36",
        className
      )}
    >
      <div className="flex items-center justify-between space-x-4 ">
        <SelectContestLanguage />
        <div className="flex items-center gap-3">
          <CodeToolsGroup onClear={handleClear} />
          {headerExtra}
        </div>
      </div>
      <div className="bg-white shadow-sm rounded-lg flex-1 min-h-0 flex flex-col">
        <div className="p-4 flex-1 min-h-0">
          <ContestCodeEditor contest_id={contest_id} pid={pid} />
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
