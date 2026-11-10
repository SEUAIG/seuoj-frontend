import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import "./problem-statement.css";
interface ExampleSectionProps {
  input: string; output: string; isAuthenticated: boolean; explain: string; index: number;
}
export function ExampleSection({ input, output, explain, index }: ExampleSectionProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 1200);
    } catch { toast.error("复制失败，请手动选择并复制"); }
  };
  return (
    <section className="problem-section">
      <h2>样例 {index + 1}</h2>
      <div className="problem-sample-grid">
        {[["输入", input], ["输出", output]].map(([label, value]) => (
          <div key={label} className="problem-sample-cell">
            <div className="problem-sample-heading">
              <span>{label}</span>
              <button type="button" aria-label={`复制样例 ${index + 1} ${label}`} title="复制" onClick={() => copy(label, value)}>
                {copied === label ? <Check size={15} /> : <Copy size={15} />}
              </button>
            </div>
            <pre>{value}</pre>
          </div>
        ))}
      </div>
      {explain && <div className="problem-prose mt-4"><MarkdownRenderer previewImages>{explain}</MarkdownRenderer></div>}
    </section>
  );
}
