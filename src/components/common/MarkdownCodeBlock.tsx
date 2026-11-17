import React from "react";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { githubGist } from "react-syntax-highlighter/dist/esm/styles/hljs";
import cpp from "react-syntax-highlighter/dist/esm/languages/hljs/cpp";
import c from "react-syntax-highlighter/dist/esm/languages/hljs/c";
import python from "react-syntax-highlighter/dist/esm/languages/hljs/python";
import java from "react-syntax-highlighter/dist/esm/languages/hljs/java";
import rust from "react-syntax-highlighter/dist/esm/languages/hljs/rust";
import go from "react-syntax-highlighter/dist/esm/languages/hljs/go";
import javascript from "react-syntax-highlighter/dist/esm/languages/hljs/javascript";
import bash from "react-syntax-highlighter/dist/esm/languages/hljs/bash";

/** Markdown 围栏代码块的语言名 → 已注册的高亮语言 */
const LANGUAGES: Record<string, string> = {
  cpp: "cpp",
  "c++": "cpp",
  cc: "cpp",
  cxx: "cpp",
  c: "c",
  python: "python",
  py: "python",
  python3: "python",
  java: "java",
  rust: "rust",
  rs: "rust",
  go: "go",
  golang: "go",
  javascript: "javascript",
  js: "javascript",
  bash: "bash",
  sh: "bash",
  shell: "bash",
};

for (const [name, grammar] of Object.entries({ cpp, c, python, java, rust, go, javascript, bash })) {
  SyntaxHighlighter.registerLanguage(name, grammar);
}

const blockStyle: React.CSSProperties = {
  margin: 0,
  padding: "0.75rem 1rem",
  background: "#f8fafc",
  fontSize: "13px",
  lineHeight: "1.55",
  borderRadius: "0.375rem",
  border: "1px solid #e2e8f0",
};

/**
 * 替换 react-markdown 的 <pre>：围栏代码块写了已知语言就高亮，其余原样输出。
 * 只在 MarkdownRenderer 的 highlightCode 打开时使用，题面不受影响。
 */
export function MarkdownCodeBlock({ children, ...rest }: React.HTMLAttributes<HTMLPreElement>) {
  const code = React.Children.toArray(children)[0];
  if (React.isValidElement<{ className?: string; children?: React.ReactNode }>(code)) {
    const lang = /language-([\w+#-]+)/.exec(code.props.className ?? "")?.[1]?.toLowerCase();
    const grammar = lang ? LANGUAGES[lang] : undefined;
    if (grammar) {
      const text = String(code.props.children ?? "").replace(/\n$/, "");
      return (
        <SyntaxHighlighter language={grammar} style={githubGist} customStyle={blockStyle} PreTag="pre">
          {text}
        </SyntaxHighlighter>
      );
    }
  }
  // 没写语言或语言不认识：不高亮，但和高亮块用同一套底色，避免 prose 默认的深色 pre 配色
  return (
    <pre {...rest} style={{ ...blockStyle, color: "#334155", overflowX: "auto" }}>
      {children}
    </pre>
  );
}
