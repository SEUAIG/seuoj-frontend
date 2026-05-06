import React from "react";
import CodeWrite from "./CodeWrite";
import FileUpload from "./FileUpload";
import { Button } from "@/components/ui/button";
import { SquarePen } from "lucide-react";
interface ProblemCodingProps {
  pid: string;
  handleCodeSubmit: () => void;
  submitDisabled?: boolean;
  submitDisabledReason?: string;
  headerExtra?: React.ReactNode;
}
export default function ProblemCoding({
  pid,
  handleCodeSubmit,
  submitDisabled = false,
  submitDisabledReason,
  headerExtra,
}: ProblemCodingProps) {
  return (
    <div className="flex flex-col h-full min-h-0">
      <CodeWrite
        pid={pid}
        className="h-full border-none shadow-none"
        headerExtra={headerExtra}
        footer={
          <div className="flex flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <FileUpload pid={pid} />
            </div>
            <div className="flex items-center gap-2">
              {submitDisabledReason && (
                <span className="text-sm text-muted-foreground">
                  {submitDisabledReason}
                </span>
              )}
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
        }
      />
    </div>
  );
}
