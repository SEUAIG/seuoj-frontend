import React from "react";
import { Helmet } from "react-helmet-async";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import SubmissionListPanel from "../bussiness/SubmissionListPanel";

export default function EvaluationPage() {
  const [searchParams] = useSearchParams();
  const { user } = useSelector((state: RootState) => state.auth);
  const isPrivileged =
    user?.role === "teacher" ||
    user?.role === "admin" ||
    user?.role === "superadmin";

  const pidParam = searchParams.get("pid") || "";

  const titleParts = ["评测记录"];
  if (pidParam) titleParts.push(pidParam);

  return (
    <div className="w-4/5 mx-auto py-6 space-y-6 min-h-screen overflow-x-hidden">
      <Helmet>
        <title>{titleParts.join(" - ")} - SEUOJ</title>
      </Helmet>

      {/* header */}
      <div>
        <div className="text-2xl font-semibold">
          评测记录
          {pidParam && (
            <span className="text-lg font-normal text-muted-foreground ml-2">
              — {pidParam}
            </span>
          )}
        </div>
        <div className="text-sm text-muted-foreground mt-1">
          {isPrivileged
            ? "查看所有用户的代码提交状态"
            : "查看大家在题库中的提交。作业提交、非公开题和正在比赛中的题目只显示你自己的"}
        </div>
      </div>

      <SubmissionListPanel pid={pidParam} />
    </div>
  );
}
