import React, { Dispatch, SetStateAction } from "react";
import SelectLanguage from "./SelectLanguage";
import CodeToolsGroup from "./CodeToolsGroup";
import CodeEditor from "./CodeEditor";
import { useDispatch } from "react-redux";
import { setCodeFile as setCodeFileAction } from "@/features/Code/codeSlice";

interface CodeWriteProps {
  setCodeFile: Dispatch<SetStateAction<string>>;
  pid: string;
}

export default function CodeWrite({ setCodeFile, pid }: CodeWriteProps) {
  const dispatch = useDispatch();

  const handleClear = () => {
    dispatch(setCodeFileAction({ pid, codeFile: "" }));
  };

  return (
    <div className="flex shadow-md flex-col space-y-6 p-6 bg-gray-50 min-h-36 rounded border">
      <div className="flex items-center justify-between space-x-4 ">
        <SelectLanguage />
        <CodeToolsGroup onClear={handleClear} />
      </div>

      <div className="bg-white shadow-sm rounded-lg p-4 flex-1 overflow-hidden">
        <CodeEditor pid={pid} />
      </div>
    </div>
  );
}
