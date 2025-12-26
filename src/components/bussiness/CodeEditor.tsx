// 我们使用微软开发的monaco editor 作为编辑器 不再从零手搓
import React, { useEffect, useState } from "react";
import MonacoEditor from "@monaco-editor/react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { setCodeFile } from "@/features/Code/codeSlice";
export default function CodeEditor({pid}) {
  const dispatch = useDispatch()
  const codeFileObjectArray = useSelector((store:RootState)=>store.code.codeFileObjectArray)
  const index = codeFileObjectArray.findIndex((i)=>i.pid===pid)
  let codeText = ""
  if(index!==-1)
  {
   codeText = codeFileObjectArray[index].codeFile
  }
  const [code, setCode] = useState(
    codeText
  );
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
    dispatch(setCodeFile({pid:pid,codeFile:value}))
    // 这里不能使用code的值进行更新 因为setCode 不会立即更新状态 所以应该直接使用当前value进行dispatch
  };
  //TODO ：后续可以使用api文档进行进一步开发 使用其api能力 如代码补全等功能
  // TODO 现在默认是cpp 后续会根据language值进行更改language
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
