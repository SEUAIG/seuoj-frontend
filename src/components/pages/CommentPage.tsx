import React, { useCallback, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ChevronLeft } from "lucide-react";
import CommentThread from "@/components/discussion/CommentThread";
import type { CommentThreadData } from "@/models/discussion";

/** 「继续这个讨论」和置顶跳转打开的页面：以一条发言为根的子树 /comment/:id?highlight=&contest_id= */
export default function CommentPage() {
  const { id } = useParams();
  const [search] = useSearchParams();
  const commentId = Number(id);
  const highlight = Number(search.get("highlight")) || undefined;
  const contestId = Number(search.get("contest_id")) || undefined;
  const [back, setBack] = useState<{ to: string; label: string } | null>(null);

  const onData = useCallback((d: CommentThreadData) => {
    if (d.target_type === "CONTEST" && d.contest_id) {
      setBack({ to: `/contest/${d.contest_id}/discussion`, label: "返回整场讨论" });
    } else if (d.pid) {
      const to = d.contest_id ? `/contest/${d.contest_id}/${d.pid}/discussion` : `/problemsLibrary/${d.pid}/discussion`;
      setBack({ to, label: `返回 ${d.problem_title ?? d.pid} 的讨论` });
    }
  }, []);

  return (
    <div className="w-full border-t border-gray-200 bg-white">
      <Helmet>
        <title>讨论 - SEUOJ</title>
      </Helmet>
      <div className="mx-auto max-w-4xl space-y-6 px-5 py-6 md:px-8">
        {back && (
          <Link to={back.to} className="inline-flex items-center text-xs text-slate-500 hover:text-slate-900">
            <ChevronLeft className="h-3.5 w-3.5" />
            {back.label}
          </Link>
        )}
        <CommentThread
          key={commentId}
          mode={{ kind: "subtree", commentId, contestId }}
          highlightId={highlight}
          contestId={contestId}
          onData={onData}
        />
      </div>
    </div>
  );
}
