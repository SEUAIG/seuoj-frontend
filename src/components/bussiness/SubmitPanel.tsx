import React, { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import useQueryToGetLanguages from "@/hooks/useQueryToGetLanguages";
import { languageLabel } from "@/lib/language";
import { loginPath } from "@/lib/loginRedirect";

/** 按文件扩展名猜语言，猜不到返回 null */
const EXT_LANGUAGE: Record<string, string[]> = {
  c: ["C"],
  cpp: ["Cpp20", "Cpp"],
  cc: ["Cpp20", "Cpp"],
  cxx: ["Cpp20", "Cpp"],
  py: ["Python"],
  java: ["Java"],
  js: ["Nodejs"],
  go: ["Go"],
  rs: ["Rust"],
};

interface SubmitPanelProps {
  code: string;
  onCodeChange: (code: string) => void;
  language: string;
  onLanguageChange: (language: string) => void;
  onSubmit: () => void;
  isAuthenticated: boolean;
  submitting?: boolean;
  /** 不能提交时的原因，例如作业已关闭、没有测试点 */
  disabledReason?: string;
}

/** 题面底部的提交区：选语言、粘贴或上传代码、提交 */
export default function SubmitPanel({
  code,
  onCodeChange,
  language,
  onLanguageChange,
  onSubmit,
  isAuthenticated,
  submitting = false,
  disabledReason,
}: SubmitPanelProps) {
  const location = useLocation();
  const fileRef = useRef<HTMLInputElement>(null);
  const { data, isLoading, isError } = useQueryToGetLanguages();
  const languages = (Array.isArray(data?.data?.languages) ? data.data.languages : []).filter(
    (lang) => lang.available
  );

  // 当前语言不可用时换成第一个可用的
  useEffect(() => {
    if (languages.length > 0 && !languages.some((lang) => lang.name === language)) {
      onLanguageChange(languages[0].name);
    }
  }, [languages, language, onLanguageChange]);

  if (!isAuthenticated) {
    return (
      <section className="mt-10 border-t border-slate-200 pt-6 text-sm text-slate-500">
        <Link to={loginPath(`${location.pathname}${location.search}`)} className="text-primary hover:underline">
          登录
        </Link>
        后提交代码
      </section>
    );
  }

  const readFile = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        toast.error("读取文件失败");
        return;
      }
      onCodeChange(reader.result);
      const guess = EXT_LANGUAGE[ext]?.find((name) => languages.some((lang) => lang.name === name));
      if (guess) onLanguageChange(guess);
    };
    reader.onerror = () => toast.error("读取文件失败");
    reader.readAsText(file);
  };

  // Tab 键插入四个空格，而不是跳到下一个控件
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Tab" || e.shiftKey) return;
    e.preventDefault();
    const el = e.currentTarget;
    const { selectionStart: s, selectionEnd: t } = el;
    const next = `${code.slice(0, s)}    ${code.slice(t)}`;
    onCodeChange(next);
    requestAnimationFrame(() => el.setSelectionRange(s + 4, s + 4));
  };

  const blocked = !!disabledReason;

  return (
    <section className="mt-10 border-t border-slate-200 pt-6">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <h2 className="mr-1 text-base font-semibold text-slate-900">提交</h2>
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          aria-label="编程语言"
          className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 outline-none focus:border-primary"
        >
          {isLoading && <option value={language}>加载中…</option>}
          {isError && <option value={language}>语言列表加载失败</option>}
          {languages.map((lang) => (
            <option key={lang.name} value={lang.name}>
              {languageLabel(lang.name)}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="text-sm text-slate-500 hover:text-slate-900"
        >
          上传文件
        </button>
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          accept=".c,.cpp,.cc,.cxx,.h,.hpp,.py,.java,.js,.go,.rs,.txt"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) readFile(file);
            e.target.value = "";
          }}
        />
        <div className="ml-auto flex items-center gap-3">
          {blocked && <span className="text-xs text-slate-400">{disabledReason}</span>}
          <Button onClick={onSubmit} disabled={submitting || blocked || !code.trim()}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            提交
          </Button>
        </div>
      </div>
      <textarea
        value={code}
        onChange={(e) => onCodeChange(e.target.value)}
        onKeyDown={onKeyDown}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          const file = e.dataTransfer.files?.[0];
          if (file) {
            e.preventDefault();
            readFile(file);
          }
        }}
        spellCheck={false}
        rows={16}
        placeholder="粘贴代码，或把源文件拖到这里"
        className="w-full resize-y rounded-md border border-slate-200 bg-white p-3 font-mono text-[13px] leading-relaxed text-slate-800 outline-none focus:border-primary"
      />
    </section>
  );
}
