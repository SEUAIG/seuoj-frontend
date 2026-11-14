import React, { useDeferredValue, useEffect, useLayoutEffect, useRef } from "react";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import { cn } from "@/lib/utils";

interface MarkdownSplitEditorProps {
  value: string;
  onChange: (value: string) => void;
  /** Ctrl/⌘ + Enter 触发 */
  onSubmit?: () => void;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  /** 编辑区最小高度，单位 px */
  minHeight?: number;
  className?: string;
}

/** 答疑这类短文本的排版：行内代码用底色而不是 Typography 默认加的反引号 */
export const CHAT_PROSE =
  "prose prose-sm prose-slate max-w-none text-sm prose-p:my-1 prose-pre:my-2 " +
  "prose-code:font-normal prose-code:before:content-none prose-code:after:content-none " +
  "[&_:not(pre)>code]:rounded [&_:not(pre)>code]:bg-slate-100 [&_:not(pre)>code]:px-1 [&_:not(pre)>code]:py-0.5";

function fitHeight(el: HTMLTextAreaElement | null) {
  if (!el) return;
  // 先设 0 再量：设 auto 会被 grid 拉伸到预览栏的高度，量出来就不对了
  el.style.height = "0px";
  el.style.height = `${el.scrollHeight}px`;
}

/** 左边写 Markdown，右边实时预览；窄屏时预览在下方。 */
export function MarkdownSplitEditor({
  value,
  onChange,
  onSubmit,
  placeholder,
  maxLength,
  disabled,
  autoFocus,
  minHeight = 120,
  className,
}: MarkdownSplitEditorProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  // 输入优先，预览可以慢半拍，长公式时打字不卡
  const preview = useDeferredValue(value);

  // 编辑框随内容长高，和右边预览一起撑开，不在框里滚动
  useLayoutEffect(() => fitHeight(ref.current), [value]);

  // 宽度变了（转屏、拖窗口）换行数会变，要重新量，否则文字会被裁掉
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let width = el.clientWidth;
    const ro = new ResizeObserver(() => {
      if (el.clientWidth === width) return; // 自己改高度也会触发，只认宽度变化
      width = el.clientWidth;
      fitHeight(el);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const wrap = (mark: string) => {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const next = value.slice(0, s) + mark + value.slice(s, e) + mark + value.slice(e);
    if (maxLength && next.length > maxLength) return;
    onChange(next);
    requestAnimationFrame(() => el.setSelectionRange(s + mark.length, e + mark.length));
  };

  const onKeyDown = (ev: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!(ev.ctrlKey || ev.metaKey)) return;
    if (ev.key === "Enter" && onSubmit) {
      ev.preventDefault();
      onSubmit();
    } else if (ev.key === "b" || ev.key === "i") {
      ev.preventDefault();
      wrap(ev.key === "b" ? "**" : "*");
    }
  };

  return (
    <div className={cn("overflow-hidden rounded-md border bg-white focus-within:border-primary", className)}>
      <div className="grid md:grid-cols-2">
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          autoFocus={autoFocus}
          style={{ minHeight }}
          className="w-full resize-none overflow-hidden bg-transparent px-2.5 py-1.5 font-mono text-[13px] leading-relaxed outline-none"
        />
        <div
          style={{ minHeight }}
          className="min-w-0 border-t bg-slate-50/60 px-3 py-1.5 md:border-l md:border-t-0"
          aria-label="预览"
        >
          {preview.trim() ? (
            <div className={CHAT_PROSE}>
              <MarkdownRenderer breaks>{preview}</MarkdownRenderer>
            </div>
          ) : (
            <p className="text-sm text-slate-400">预览</p>
          )}
        </div>
      </div>
      <div className="flex gap-3 border-t px-2.5 py-1 text-xs text-slate-400">
        <span>Markdown · $行内公式$ · $$独立公式$$</span>
        <span className="ml-auto hidden sm:inline">
          Ctrl+B 加粗 · Ctrl+I 斜体{onSubmit && " · Ctrl+Enter 提交"}
        </span>
      </div>
    </div>
  );
}
