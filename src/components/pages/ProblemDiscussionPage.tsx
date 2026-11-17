import React, { useCallback, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ChevronLeft } from "lucide-react";
import CommentThread from "@/components/discussion/CommentThread";
import type { CommentThreadData } from "@/models/discussion";

/** 题库入口的题目讨论页 /problemsLibrary/:id/discussion */
export default function ProblemDiscussionPage() {
  const { id: pid = "" } = useParams();
  const [title, setTitle] = useState<string | null>(null);
  const onData = useCallback((d: CommentThreadData) => setTitle(d.problem_title ?? null), []);

  return (
    <div className="w-full border-t border-gray-200 bg-white">
      <Helmet>
        <title>{`讨论 · #${pid}${title ? `. ${title}` : ""} - SEUOJ`}</title>
      </Helmet>
      <div className="mx-auto max-w-4xl space-y-6 px-5 py-6 md:px-8">
        <div className="space-y-1">
          <Link
            to={`/problemsLibrary/${pid}`}
            className="inline-flex items-center text-xs text-slate-500 hover:text-slate-900"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            返回题目
          </Link>
          <h1 className="text-xl font-bold text-slate-900">
            💭 讨论 <span className="font-normal text-slate-500">· #{pid}{title ? `. ${title}` : ""}</span>
          </h1>
        </div>
        <CommentThread mode={{ kind: "thread", target: { target_type: "PROBLEM", pid } }} onData={onData} />
      </div>
    </div>
  );
}
