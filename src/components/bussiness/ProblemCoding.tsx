import React, { Dispatch, SetStateAction } from "react";
import CodeWrite from "./CodeWrite";
import FileUpload from "./FileUpload";
import { Button } from "@/components/ui/button";
import { SquarePen } from "lucide-react";
interface ProblemCodingProps {
  pid: string;
  setCodeFile: Dispatch<SetStateAction<string>>;
  handleCodeSubmit: () => void;
  submitDisabled?: boolean;
}
export default function ProblemCoding({
  pid,
  setCodeFile,
  handleCodeSubmit,
  submitDisabled = false,
}: ProblemCodingProps) {
  return (
    <div className="flex flex-col h-full gap-4 p-4 md:p-6 bg-gray-50">
      <div className="flex-1 overflow-hidden flex flex-col">
        <CodeWrite 
          setCodeFile={setCodeFile} 
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
            disabled={submitDisabled}
          >
            <SquarePen className="mr-2 h-4 w-4" />
            提交
          </Button>
        </div>
      </div>
    </div>
  );
}
