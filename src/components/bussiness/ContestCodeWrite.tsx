import React, { Dispatch, SetStateAction } from "react";
import SelectContestLanguage from "./SelectContestLanguage";
import CodeToolsGroup from "./CodeToolsGroup";
import ContestCodeEditor from "./ContestCodeEditor";
import { useDispatch } from "react-redux";
import { setContestCodeFile } from "@/features/Code/contestCodeSlice";
import { cn } from "@/lib/utils";
interface ContestCodeWriteProps {
  setCodeFile: Dispatch<SetStateAction<string>>;
  contest_id: string;
  pid: string;
  className?: string;
}
export default function ContestCodeWrite({
  setCodeFile,
  contest_id,
  pid,
  className,
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
        "flex shadow-md flex-col space-y-6 p-6 bg-gray-50 min-h-36 rounded border",
        className
      )}
    >
      <div className="flex items-center justify-between space-x-4 ">
        <SelectContestLanguage />
        <CodeToolsGroup onClear={handleClear} />
      </div>
      <div className="bg-white shadow-sm rounded-lg p-4 flex-1 overflow-hidden">
        <ContestCodeEditor contest_id={contest_id} pid={pid} />
      </div>
    </div>
  );
}
