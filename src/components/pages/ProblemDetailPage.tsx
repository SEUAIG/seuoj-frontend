import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProblemSection } from "@/components/bussiness/ProblemSection";
import { ExampleSection } from "@/components/bussiness/ExampleSection";
import { Helmet } from "react-helmet-async";
import { Code, Clock, Cpu, FileText, BookCopy, Upload,SquarePen } from "lucide-react";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../app/store";
import CodeWrite from "../bussiness/CodeWrite";
import FileUpload from "../bussiness/FileUpload";

export default function ProblemDetailPage() {
  const { isAuthenticated } = useSelector((store: RootState) => store.auth);

  return (
    <>
      <Helmet>
        <title>#1. A + B Problem - SeuOJ</title>
      </Helmet>
      <div className="min-h-screen bg-gray-50 py-4 pb-10">
        {/* 核心容器：限制最大宽度，居中显示 */}
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          {/* === 1. 头部标题与标签 === */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">
              #1. A + B Problem
            </h1>
            <div className="flex flex-wrap gap-3">
              {/* 标签区，加入 lucide 图标 */}
              <Badge className="bg-emerald-600 hover:cursor-default hover:bg-emerald-700 text-white flex items-center gap-2 px-3 py-1 rounded-lg">
                <Code size={18} /> 传统
              </Badge>
              <Badge className="bg-pink-600 hover:bg-pink-700 hover:cursor-default text-white flex items-center gap-2 px-3 py-1 rounded-lg">
                <Clock size={18} /> 1000 ms
              </Badge>
              <Badge className="bg-blue-600 hover:bg-blue-700 hover:cursor-default text-white flex items-center gap-2 px-3 py-1 rounded-lg">
                <Cpu size={18} /> 256 MiB
              </Badge>
              <Badge className="bg-orange-600 hover:bg-orange-700 hover:cursor-default text-white flex items-center gap-2 px-3 py-1 rounded-lg">
                <FileText size={18} /> 标准 IO
              </Badge>
              <Badge className="bg-green-600 hover:bg-green-700 hover:cursor-default text-white flex items-center gap-2 px-3 py-1 rounded-lg">
                <BookCopy size={18} /> 文本比较
              </Badge>
              <Badge className="bg-indigo-600 hover:bg-indigo-700 hover:cursor-pointer text-white flex items-center gap-2 px-3 py-1 rounded-lg">
                <Upload size={18} /> admin
              </Badge>
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
              <MarkdownRenderer>
                {`有 $n$ 只小猫依次坐在一张圆桌上。
设每只小猫的位置为 $x_1, x_2, \dots, x_n$，每个位置的顺序可以表示为 $x_1, x_2, \dots, x_n$。
    $$  \sum_{i=1}^{n} x_i = 0 $$`}
              </MarkdownRenderer>
            </ProblemSection>

            <ProblemSection title="输入格式">
              <MarkdownRenderer>
                一行两个正整数 a, b (1 ≤ a, b ≤ 10^6)。
              </MarkdownRenderer>
            </ProblemSection>

            <ProblemSection title="输出格式">
              <MarkdownRenderer>一行一个正整数 a + b</MarkdownRenderer>
            </ProblemSection>
            <ExampleSection
              input="1 2"
              output="3"
              isAuthenticated
              explain="这是一个解释"
            />
            <CodeWrite />
            <div className="flex items-center justify-around">
              <FileUpload />
              <Button
                variant="outline"
                className="text-md py-2 px-4 border shadow-md bg-slate-200"
                size="lg"
              >
                <SquarePen/>
                提交
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
