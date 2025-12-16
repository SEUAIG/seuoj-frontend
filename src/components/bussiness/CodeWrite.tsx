import React from "react";
import SelectLanguage from "./SelectLanguage";
import CodeToolsGroup from "./CodeToolsGroup";
import CodeEditor from "./CodeEditor";

export default function CodeWrite() {
  return (
    <div className="flex shadow-md flex-col space-y-6 p-6 bg-gray-50 min-h-36 rounded border">
      <div className="flex items-center justify-between space-x-4 ">
        <SelectLanguage />
        <CodeToolsGroup />
      </div>

      <div className="bg-white shadow-sm rounded-lg p-4 flex-1 overflow-hidden">
        <CodeEditor />
      </div>
    </div>
  );
}
