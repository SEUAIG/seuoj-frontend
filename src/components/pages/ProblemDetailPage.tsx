import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProblemSection } from "@/components/bussiness/ProblemSection";

export default function ProblemDetailPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-2">
      {/* 核心容器：限制最大宽度，让内容居中 */}
      <div className="max-w-5xl mx-auto px-4 space-y-6">
        {/* === 1. 头部标题与标签 === */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-gray-800">
            #1. A + B Problem
          </h1>

          <div className="flex flex-wrap gap-2">
            {/* 不同颜色的标签，使用 Tailwind 的背景色类名 */}
            <Badge className="bg-emerald-500 hover:bg-emerald-600">传统</Badge>
            <Badge className="bg-pink-500 hover:bg-pink-600">1000 ms</Badge>
            <Badge className="bg-blue-500 hover:bg-blue-600">256 MiB</Badge>
            <Badge className="bg-orange-500 hover:bg-orange-600">标准 IO</Badge>
            <Badge className="bg-green-600 hover:bg-green-700">文本比较</Badge>
            <Badge className="bg-blue-600 hover:bg-blue-700">admin</Badge>
          </div>
        </div>

        {/* === 2. 操作按钮区 === */}
        <div className="flex gap-2">
          <Button className="bg-green-500 hover:bg-green-600 text-white">
            提交记录
          </Button>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white">
            统计
          </Button>
          <Button className="bg-yellow-500 hover:bg-yellow-600 text-white">
            测试数据
          </Button>
          <Button className="bg-amber-700 hover:bg-amber-800 text-white">
            讨论
          </Button>
        </div>

        {/* === 3. 题目内容区 (使用 Card 组件) === */}
        <div className="space-y-6">
          {/* 封装一个通用的 Section 组件，避免重复代码 */}
          <ProblemSection title="题目描述">
            <p>输入 a 和 b，输出 a + b 的结果。</p>
          </ProblemSection>

          <ProblemSection title="输入格式">
            <p>一行两个正整数 a, b (1 ≤ a, b ≤ 10^6)。</p>
          </ProblemSection>

          <ProblemSection title="输出格式">
            <p>一行一个正整数 a + b。</p>
          </ProblemSection>

          <ProblemSection title="样例">
            <div className="grid gap-4">
              {/* 样例输入 */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-sm text-gray-700">
                    样例输入
                  </span>
                  <Button variant="outline" size="sm" className="h-6 text-xs">
                    复制
                  </Button>
                </div>
                <pre className="bg-gray-100 p-3 rounded border border-gray-200 font-mono text-sm">
                  1 2
                </pre>
              </div>

              {/* 样例输出 */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-sm text-gray-700">
                    样例输出
                  </span>
                  <Button variant="outline" size="sm" className="h-6 text-xs">
                    复制
                  </Button>
                </div>
                <pre className="bg-gray-100 p-3 rounded border border-gray-200 font-mono text-sm">
                  3
                </pre>
              </div>
            </div>
          </ProblemSection>
        </div>
      </div>
    </div>
  );
}
