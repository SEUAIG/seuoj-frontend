import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProblemSection } from "@/components/bussiness/ProblemSection";
import { ExampleSection } from "@/components/bussiness/ExampleSection";
import { Helmet } from "react-helmet-async";
import {
  Code,
  Clock,
  Cpu,
  FileText,
  BookCopy,
  Upload,
  SquarePen,
  Tag,
} from "lucide-react";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../app/store";
import CodeWrite from "../bussiness/CodeWrite";
import FileUpload from "../bussiness/FileUpload";
import { useParams } from "react-router-dom";
import { ENV } from "@/config/env";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/services/api/axios";

interface ProblemExample {
  in: string;
  ans: string;
  description: string;
}

interface ProblemContent {
  pid: string;
  description: string;
  timeLimit: number;
  memLimit: number;
  type: string;
  input: string;
  output: string;
  example: ProblemExample[];
}

interface ProblemData {
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
  const {language,codeFileObjectArray} = useSelector((store:RootState)=>store.code)

  useEffect(() => {
    // useEffect传入的函数本身要么不返回 要么返回一个清理函数 不能直接是异步函数 所以在函数内部声明一个异步函数
    const fetchProblem = async () => {
      if (!id) return;
      try {
        const res = await fetch(`${ENV.API_BASE_URL}/api/problem/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          // GET 请求不需要 body，参数已在 URL 中
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
  const { title, content, tags, pid } = problem;
  const { description, timeLimit, memLimit, type, input, output, example } =
    content;
  const handleCodeSubmit = async ()=>{
    const index = codeFileObjectArray.findIndex((i)=>i.pid===pid)
    if(index===-1)
      return;
    const code = codeFileObjectArray[index].codeFile;
    const data = {pid,language,code}
   const res = await api.post("/api/submission",data)
   const result = res.data;
   console.log(result)
  }
  return (
    <>
      <Helmet>
        <title>{`#${id}. ${title} - SeuOJ`}</title>
      </Helmet>
      <div className="min-h-screen bg-gray-50 py-4 pb-10">
        {/* 核心容器：限制最大宽度，居中显示 */}
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          {/* === 1. 头部标题与标签 === */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">
              #{id}. {title}
            </h1>
            <div className="flex flex-wrap gap-3">
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span tabIndex={0} className="cursor-help outline-none">
                      <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 px-3 py-1 rounded-lg pointer-events-none">
                        <Code size={18} />{" "}
                        {type === "Interactive" ? "交互" : "传统"}
                      </Badge>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      题目类型: {type === "Interactive" ? "交互题" : "传统题"}
                    </p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span tabIndex={0} className="cursor-help outline-none">
                      <Badge className="bg-pink-600 hover:bg-pink-700 text-white flex items-center gap-2 px-3 py-1 rounded-lg pointer-events-none">
                        <Clock size={18} /> {timeLimit} ms
                      </Badge>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>时间限制: {timeLimit} ms</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span tabIndex={0} className="cursor-help outline-none">
                      <Badge className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-3 py-1 rounded-lg pointer-events-none">
                        <Cpu size={18} /> {(memLimit / 1024 / 1024).toFixed(0)}{" "}
                        MiB
                      </Badge>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>内存限制: {(memLimit / 1024 / 1024).toFixed(0)} MiB</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span tabIndex={0} className="cursor-help outline-none">
                      <Badge className="bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2 px-3 py-1 rounded-lg pointer-events-none">
                        <FileText size={18} /> 标准 IO
                      </Badge>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>输入输出方式: 标准 IO</p>
                  </TooltipContent>
                </Tooltip>
                {tags.map((tag, index) => (
                  <Tooltip key={index}>
                    <TooltipTrigger asChild>
                      <span tabIndex={0} className="cursor-help outline-none">
                        <Badge className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 px-3 py-1 rounded-lg pointer-events-none">
                          <Tag size={18} /> {tag}
                        </Badge>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{tag}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </div>
          </div>

          {/* === 2. 操作按钮区 === */}
          <div className="flex gap-4 justify-start">
            {isAuthenticated ? (
              <Button className="bg-blue-600 hover:bg-blue-700 text-white transition duration-300 ease-in-out transform hover:scale-105">
                提交
              </Button>
            ) : null}
            <Button className="bg-green-600 hover:bg-green-700 text-white transition duration-300 ease-in-out transform hover:scale-105">
              提交记录
            </Button>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white transition duration-300 ease-in-out transform hover:scale-105">
              统计
            </Button>
            <Button className="bg-yellow-600 hover:bg-yellow-700 text-white transition duration-300 ease-in-out transform hover:scale-105">
              测试数据
            </Button>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white transition duration-300 ease-in-out transform hover:scale-105">
              讨论
            </Button>
          </div>
          {/* === 3. 题目内容区 === */}
          <div className="space-y-6">
            {/* TODO: 预处理文本 删去空行 添加/n 保证既可以渲染 又可以保留原文形态 */}
            <ProblemSection title="题目描述">
              <MarkdownRenderer>{description}</MarkdownRenderer>
            </ProblemSection>

            <ProblemSection title="输入格式">
              <MarkdownRenderer>{input}</MarkdownRenderer>
            </ProblemSection>

            <ProblemSection title="输出格式">
              <MarkdownRenderer>{output}</MarkdownRenderer>
            </ProblemSection>

            {example.map((ex, index) => (
              <ExampleSection
                key={index}
                input={ex.in}
                output={ex.ans}
                isAuthenticated={isAuthenticated}
                explain={ex.description}
              />
            ))}
            {isAuthenticated ? (
              <>
                <CodeWrite setCodeFile={setCodeFile} pid={pid} />
                <div className="flex items-center justify-around">
                  {/* TODO 补全fileupload的功能 但要注意 不要把它的值赋给codeFile 而是给一个onClick 直接提交对应内容 不要保留该文件 */}
                  <FileUpload pid={pid} />
                  <Button
                    variant="outline"
                    className="text-md py-2 px-4 border shadow-md bg-slate-200"
                    size="lg"
                    onClick={()=>handleCodeSubmit()}
                  >
                    <SquarePen />
                    提交
                  </Button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
