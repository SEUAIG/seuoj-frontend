import React, { memo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import "katex/dist/katex.min.css";
import "./problem-chinese-font.css";

interface MarkdownRendererProps {
  children: string;
  previewImages?: boolean;
}

const remarkPlugins = [remarkGfm, remarkMath];
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
}: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={remarkPlugins}
      rehypePlugins={rehypePlugins}
      components={previewImages ? previewComponents : undefined}
    >
      {children}
    </ReactMarkdown>
  );
});
