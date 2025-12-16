import React from 'react'
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";

// 我们依然使用syntax highlighter 方案 
export default function CodeShow({children}:{children:string}) {
  return (
    <div className='border shadow p-3 w-full rounded bg-slate-100'>
      <SyntaxHighlighter language="cpp" style={docco}>
        {children}
      </SyntaxHighlighter>
    </div>
  );
}
