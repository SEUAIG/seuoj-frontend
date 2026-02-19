import React, { Dispatch, SetStateAction } from "react";
import ContestCodeWrite from "./ContestCodeWrite";
import FileUpload from "./FileUpload";
import { Button } from "@/components/ui/button";
import { SquarePen } from "lucide-react";
interface ContestProblemCodingProps {
  contest_id: string;
  pid: string;
  setCodeFile: Dispatch<SetStateAction<string>>;
  handleCodeSubmit: () => void;
}
export default function ContestProblemCoding({
  contest_id,
  pid,
  setCodeFile,
  handleCodeSubmit,
}: ContestProblemCodingProps) {
  return (
    <div className="flex flex-col h-full gap-4 p-4 md:p-6 bg-gray-50">
      <div className="flex-1 overflow-hidden flex flex-col">
        <ContestCodeWrite
          setCodeFile={setCodeFile}
          contest_id={contest_id}
          pid={pid}
          className="h-full border-none shadow-none"
        />
      </div>
      <div className="flex-none px-4 py-2 bg-white border-t border-gray-100">
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
      </div>
    </div>
  );
}
