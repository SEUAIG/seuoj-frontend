// 我们使用微软开发的monaco editor 作为编辑器 不再从零手搓
import React, { useEffect, useState } from "react";
import MonacoEditor from "@monaco-editor/react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { setCodeFile } from "@/features/Code/codeSlice";
interface CodeEditorProps {
  pid: string;
}
export default function CodeEditor({ pid }: CodeEditorProps) {
  const dispatch = useDispatch();
  const codeFileObjectArray = useSelector(
    (store: RootState) => store.code.codeFileObjectArray
  );
  const { language, fontsize } = useSelector((store: RootState) => store.code);

  const index = codeFileObjectArray.findIndex(
    (i: { pid: string }) => i.pid === pid
  );
  let codeText = "";
  if (index !== -1) {
    codeText = codeFileObjectArray[index].codeFile;
  }
  const [code, setCode] = useState(codeText);
  const getMonacoLanguage = (lang: string) => {
    switch (lang) {
      case "C":
        return "c";
      case "Cpp":
      case "Cpp11":
      case "Cpp17":
      case "Cpp20":
        return "cpp";
      case "Python3_12":
        return "python";
      case "Java17":
        return "java";
      case "Go1_22":
        return "go";
      case "Nodejs22":
        return "javascript";
      default:
        return "cpp";
    }
  };
  // 当 Redux 中的代码改变时同步更新本地状态
  useEffect(() => {
    if (index !== -1) {
      setCode(codeFileObjectArray[index].codeFile);
    } else {
      setCode("");
    }
  }, [codeFileObjectArray, index]);
  // 注意 rtk 不仅允许你直接修改数组对象 且修改前后的 不是一个数组对象 可被监听到变化
  const handleEditorChange = (value: string | undefined) => {
    setCode(value || "");
    dispatch(setCodeFile({ pid: pid, codeFile: value }));
    // 这里不能使用code的值进行更新 因为setCode 不会立即更新状态 所以应该直接使用当前value进行dispatch
  };
  //TODO ：后续可以使用api文档进行进一步开发 使用其api能力 如代码补全等功能
  return (
    <>
      <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200 shadow-inner">
        <MonacoEditor
          height="500px"
          language={getMonacoLanguage(language)}
          theme="vs-light"
          value={code}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false }, // 关闭小地图
            automaticLayout: true, 
            fontSize: fontsize, 
            fontFamily:
              "'Fira Code', 'Consolas', 'Monaco', 'Andale Mono', 'Ubuntu Mono', monospace", 
            fontLigatures: true, // 启用连字
            lineHeight: 1.6 * fontsize, 
            scrollBeyondLastLine: false, // 禁止滚动超过最后一行
            renderWhitespace: "selection", // 仅在选中时显示空白字符
            cursorBlinking: "smooth", // 平滑光标闪烁
            cursorSmoothCaretAnimation: "on", // 平滑光标移动
            smoothScrolling: true, // 平滑滚动
            formatOnPaste: true, // 粘贴格式化
            formatOnType: true, // 输入格式化
            folding: true, // 代码折叠
            lineNumbersMinChars: 3, 
          }}
        />
      </div>
    </>
  );
}
