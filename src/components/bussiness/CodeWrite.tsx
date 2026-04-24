import React, { Dispatch, SetStateAction } from "react";
import SelectLanguage from "./SelectLanguage";
import CodeToolsGroup from "./CodeToolsGroup";
import CodeEditor from "./CodeEditor";
import { useDispatch } from "react-redux";
import { setCodeFile as setCodeFileAction } from "@/features/Code/codeSlice";

import { cn } from "@/lib/utils";

interface CodeWriteProps {
  setCodeFile: Dispatch<SetStateAction<string>>;
  pid: string;
  className?: string;
  headerExtra?: React.ReactNode;
  footer?: React.ReactNode;
}

export default function CodeWrite({
  setCodeFile,
  pid,
  className,
  headerExtra,
  footer,
}: CodeWriteProps) {
  const dispatch = useDispatch();

  const handleClear = () => {
    dispatch(setCodeFileAction({ pid, codeFile: "" }));
  };

  return (
    <div className={cn("flex min-h-0 flex-col space-y-3 p-4 bg-gray-50 min-h-36", className)}>
      <div className="flex items-center justify-between space-x-4 ">
        <SelectLanguage />
        <div className="flex items-center gap-3">
          <CodeToolsGroup onClear={handleClear} />
          {headerExtra}
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg flex-1 min-h-0 flex flex-col">
        <div className="p-4 flex-1 min-h-0">
          <CodeEditor pid={pid} />
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
