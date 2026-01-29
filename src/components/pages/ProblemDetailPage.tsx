import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { useNavigate, useParams } from "react-router-dom";
import { ENV } from "@/config/env";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/services/api/axios";
import ProblemDetailInfo from "@/components/bussiness/ProblemDetailInfo";
import ProblemCoding from "@/components/bussiness/ProblemCoding";
export interface ProblemExample {
  in: string;
  ans: string;
  description: string;
}
export interface Info {
  max_cpu_time_ms: string;
  max_real_time_ms: string;
  max_memory_byte: string;
  max_stack_byte: string;
  max_process_number: string;
  max_output_size: string;
  test_case_number: string;
  problem_type: string;
  checker_type: string;
}
export interface ProblemContent {
  pid: string;
  description: string;
  info: Info;
  input: string;
  output: string;
  example: ProblemExample[];
}
export interface ProblemData {
  pid: string;
  title: string;
  content: ProblemContent;
  tags: string[];
  totalSubmit: number;
  totalAccept: number;
}
export default function ProblemDetailPage() {
  const { isAuthenticated } = useSelector((store: RootState) => store.auth);
  const { id } = useParams();
  const [problem, setProblem] = useState<ProblemData | null>(null);
  const [codeFile, setCodeFile] = useState("");
  const { language, codeFileObjectArray } = useSelector(
    (store: RootState) => store.code
  );
  const nav = useNavigate();
  useEffect(() => {
    const fetchProblem = async () => {
      if (!id) return;
      try {
        const res = await fetch(`${ENV.API_BASE_URL}/api/problem/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const result = await res.json();
        if (result.code === 0 && result.data) {
          setProblem(result.data);
        }
      } catch (error) {}
    };
    fetchProblem();
  }, [id]);
  if (!problem) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 pb-10">
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          <div className="space-y-4">
            <Skeleton className="h-10 w-1/3" />
            <div className="flex gap-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-8 w-20 rounded-lg" />
              ))}
            </div>
          </div>
          <div className="flex gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-24" />
            ))}
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center mt-10 text-gray-400 font-mono text-sm">
            <span className="mr-2">&gt;</span>
            <span>Fetching problem data...</span>
            <span className="animate-ping ml-1 h-2 w-2 bg-indigo-500 rounded-full inline-block"></span>
          </div>
        </div>
      </div>
    );
  }
  const { title, pid } = problem;
  const handleCodeSubmit = async () => {
    const index = codeFileObjectArray.findIndex(
      (i: { pid: string }) => i.pid === pid
    );
    if (index === -1) return;
    const code = codeFileObjectArray[index].codeFile;
    const data = { pid, language, code };
    const res = await api.post("/api/submission", data);
    const result = res.data;
    const { submissionNo } = result.data;
    if (submissionNo) {
      nav(`/submission/${submissionNo}?title=${title}`);
    }
  };
  return (
    <>
      <Helmet>
        <title>{`#${id}. ${title} - SeuOJ`}</title>
      </Helmet>
      <div className="h-full overflow-x-auto overflow-y-hidden flex flex-row bg-white border-t border-gray-200">
        <div className="w-1/2 min-w-[500px] flex-shrink-0 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent border-r border-gray-200">
          <ProblemDetailInfo
            problem={problem}
            isAuthenticated={isAuthenticated}
          />
        </div>
        <div className="w-1/2 min-w-[500px] flex-shrink-0 overflow-hidden bg-gray-50 relative">
          {isAuthenticated ? (
            <ProblemCoding
              pid={pid}
              setCodeFile={setCodeFile}
              handleCodeSubmit={handleCodeSubmit}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 bg-gray-50">
              <div className="p-8 text-center space-y-4">
                <h3 className="text-xl font-semibold text-gray-700">
                  需要登录
                </h3>
                <p>请登录后查看代码编辑器并提交代码。</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
