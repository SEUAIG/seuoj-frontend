import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import { timeAgo } from "@/components/discussion/discussionKit";
import { getCommentRevisions } from "@/services/Discussion/comments";
import { cn } from "@/lib/utils";

const PROSE =
  "prose prose-slate prose-sm max-w-none break-words prose-p:my-1.5 prose-pre:my-2 prose-pre:bg-transparent prose-pre:p-0 " +
  "prose-code:font-normal prose-code:before:content-none prose-code:after:content-none " +
  "[&_:not(pre)>code]:rounded [&_:not(pre)>code]:bg-slate-100 [&_:not(pre)>code]:px-1 [&_:not(pre)>code]:py-0.5";

/** 「已编辑 · rev. N」：点开看这条发言的每一版全文，新的在上 */
export default function RevisionsDialog({ commentId, revision }: { commentId: number; revision: number }) {
  const [open, setOpen] = useState(false);
  const { data, error, isLoading } = useQuery({
    queryKey: ["commentRevisions", commentId, revision],
    queryFn: () => getCommentRevisions(commentId),
    enabled: open,
    retry: false,
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className="hover:text-slate-700 hover:underline" title="查看历史版本">
          已编辑 · rev. {revision}
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogTitle>历史版本</DialogTitle>
        {isLoading ? (
          <div className="flex items-center gap-2 py-6 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" /> 加载中
          </div>
        ) : error || !data ? (
          <p className="py-6 text-sm text-slate-500">{error instanceof Error ? error.message : "加载失败"}</p>
        ) : (
          <ol className="space-y-4">
            {[...data.versions].reverse().map((v) => {
              const when = timeAgo(v.started_at);
              return (
                <li key={v.version} className={cn("rounded-md border px-3 py-2", v.current ? "border-slate-300" : "border-slate-200")}>
                  <div className="mb-1 flex items-center gap-2 text-xs text-slate-400">
                    <span className="font-medium text-slate-700">rev. {v.version}</span>
                    {v.current && <span className="rounded bg-slate-100 px-1.5 py-px text-slate-600">当前</span>}
                    <span title={when.title}>{when.title || when.text}</span>
                  </div>
                  <div className={PROSE}>
                    <MarkdownRenderer breaks highlightCode>
                      {v.content}
                    </MarkdownRenderer>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </DialogContent>
    </Dialog>
  );
}
