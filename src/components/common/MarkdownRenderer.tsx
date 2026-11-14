import React, { memo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import "katex/dist/katex.min.css";
import "./problem-chinese-font.css";

interface MarkdownRendererProps {
  children: string;
  previewImages?: boolean;
  /** 单个换行也渲染成换行（适合答疑这类随手写的文本） */
  breaks?: boolean;
}

interface MathNode {
  type: string;
  position?: { start: { offset?: number } };
  data?: { hProperties?: Record<string, unknown> };
  children?: MathNode[];
}

/**
 * remark-math 只把 $$ 各占一行的写法当独立公式，同一行的 $$x$$ 会按行内公式渲染。
 * 这里按原文把以 $$ 开头的行内公式改成独立公式，和洛谷、Codeforces 等站的习惯一致。
 */
function remarkInlineDisplayMath() {
  return (tree: MathNode, file: { value: unknown }) => {
    const source = String(file.value);
    const walk = (node: MathNode) => {
      const offset = node.position?.start.offset;
      if (node.type === "inlineMath" && offset !== undefined && source.startsWith("$$", offset)) {
        node.data = {
          ...node.data,
          hProperties: { ...node.data?.hProperties, className: ["language-math", "math-display"] },
        };
      }
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}

const remarkPlugins = [remarkGfm, remarkMath, remarkInlineDisplayMath];
const remarkPluginsWithBreaks = [...remarkPlugins, remarkBreaks];
const rehypePlugins = [rehypeKatex];

function PreviewImage({ src, alt, title }: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [originalSize, setOriginalSize] = useState(false);
  return (
    <Dialog onOpenChange={() => setOriginalSize(false)}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="block w-full cursor-zoom-in rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
          aria-label={`放大图片：${alt || "样例解释"}`}
          title="点击放大"
        >
          <img src={src} alt={alt} title={title} />
        </button>
      </DialogTrigger>
      <DialogContent
        className="flex h-[92dvh] w-[96vw] max-w-[96vw] items-center justify-center p-8 sm:p-10"
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">图片预览：{alt || "样例解释"}</DialogTitle>
        <button
          type="button"
          className="absolute left-4 top-3 rounded border px-2 py-1 text-sm hover:bg-muted"
          onClick={() => setOriginalSize((value) => !value)}
        >
          {originalSize ? "适应窗口" : "原图大小"}
        </button>
        <div className="h-full w-full min-h-0 overflow-auto">
          <img
            src={src}
            alt={alt}
            className={originalSize ? "block max-w-none" : "h-full w-full object-contain"}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

const previewComponents = { img: PreviewImage };

export const MarkdownRenderer = memo(function MarkdownRenderer({
  children,
  previewImages = false,
  breaks = false,
}: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={breaks ? remarkPluginsWithBreaks : remarkPlugins}
      rehypePlugins={rehypePlugins}
      components={previewImages ? previewComponents : undefined}
    >
      {children}
    </ReactMarkdown>
  );
});
