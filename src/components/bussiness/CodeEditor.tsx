// 我们使用微软开发的monaco editor 作为编辑器 不再从零手搓
import React, { useState } from "react";
import MonacoEditor from "@monaco-editor/react";
export default function CodeEditor() {
  const [code, setCode] = useState(
    `#include <iostream>\nint main() {\n  std::cout << "Hello, World!" << std::endl;\n  return 0;\n}`
  );

  const handleEditorChange = (value: string | undefined) => {
    setCode(value || "");
  };
  //TODO ：后续可以使用api文档进行进一步开发 使用其api能力 如代码补全等功能
  return (
    <>
      <h2 className="text-2xl font-semibold mb-4">Code Editor</h2>
      <div className="bg-gray-200 rounded-lg  border border-gray-300">
        <MonacoEditor
          height="500px"
          language="cpp"
          theme="vs-light"
          value={code}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            automaticLayout: true,
            fontSize: 14,
            fontFamily: '"Fira Code", monospace',
            lineHeight: 22,
            renderWhitespace: "boundary",
          }}
        />
      </div>
    </>
  );
}
