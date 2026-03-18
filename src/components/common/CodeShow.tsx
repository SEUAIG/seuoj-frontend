import React from 'react';
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { githubGist } from "react-syntax-highlighter/dist/esm/styles/hljs";
import cpp from "react-syntax-highlighter/dist/esm/languages/hljs/cpp";
import python from "react-syntax-highlighter/dist/esm/languages/hljs/python";
import java from "react-syntax-highlighter/dist/esm/languages/hljs/java";
import c from "react-syntax-highlighter/dist/esm/languages/hljs/c";

SyntaxHighlighter.registerLanguage("cpp", cpp);
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("java", java);
SyntaxHighlighter.registerLanguage("c", c);

interface CodeShowProps {
  children: string;
  language?: string;
}

export default function CodeShow({ children, language = "cpp" }: CodeShowProps) {
  return (
    <div className="w-full my-4 rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-white font-mono text-sm">
      <div className="flex items-center px-4 py-2 bg-gray-50 border-b border-gray-200 text-gray-500">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <div className="w-3 h-3 rounded-full bg-amber-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
        </div>
        <div className="ml-4 text-xs uppercase tracking-wider">{language}</div>
      </div>
      <SyntaxHighlighter 
        language={language} 
        style={githubGist}
        customStyle={{
          margin: 0,
          padding: '1rem',
          backgroundColor: 'transparent',
          fontSize: '14px',
          lineHeight: '1.5',
        }}
        showLineNumbers={true}
        lineNumberStyle={{
          minWidth: '2.5em',
          paddingRight: '1em',
          color: '#cbd5e1',
          textAlign: 'right',
          borderRight: '1px solid #e2e8f0',
          marginRight: '1em',
        }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
}
