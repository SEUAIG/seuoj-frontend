import React, { Dispatch, SetStateAction } from "react";
import ContestCodeWrite from "./ContestCodeWrite";
import FileUpload from "./FileUpload";
import { Button } from "@/components/ui/button";
import { SquarePen } from "lucide-react";
interface ContestProblemCodingProps {
  contest_id: number;
  pid: string;
  setCodeFile: Dispatch<SetStateAction<string>>;
  handleCodeSubmit: () => void;
  headerExtra?: React.ReactNode;
}
export default function ContestProblemCoding({
  contest_id,
  pid,
  setCodeFile,
  handleCodeSubmit,
  headerExtra,
}: ContestProblemCodingProps) {
  return (
    <div className="flex flex-col h-full min-h-0">
      <ContestCodeWrite
        setCodeFile={setCodeFile}
        contest_id={contest_id}
        pid={pid}
        className="h-full border-none shadow-none"
        headerExtra={headerExtra}
        footer={
          <div className="flex flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <FileUpload pid={pid} />
            </div>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              size="sm"
              onClick={handleCodeSubmit}
            >
              <SquarePen className="mr-2 h-4 w-4" />
              提交
            </Button>
          </div>
        }
      />
    </div>
  );
}
