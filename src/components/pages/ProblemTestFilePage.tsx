import { useFileList } from "@/hooks/useFileList";
import { getTestFile } from "@/services/getTestFile";
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";

export default function ProblemTestFilePage() {
  const { id } = useParams();
  const tree = getTestFile(id as string);
  // const fileList = useFileList(tree)
  const fileListAll = [
    // 题目描述文件
    "problem.md",
    "statement.pdf",
    // 测试用例文件（核心）
    "data/1.in",
    "data/1.out",
    "data/2.in",
    "data/2.out",
    "data/3.in",
    "data/3.out",
    "data/sample.in",
    "data/sample.out",
    "data/spj.cpp",
    // 标程/题解文件
    "solutions/solution.cpp",
    "solutions/solution.py",
    "solutions/solution_java.java",
    "solutions/explanation.md",
    // 配置文件
    "config.toml",
  ];
  const fileList = fileListAll
    .filter((item) => item.length > 5 && item.slice(0, 4) === "data")
    .map((item) => (item.length > 5 ? item.slice(5) : null));
  const [selectedRows, setSelectedRows] = useState(new Set());
  const allcount = fileList.length;
  const selectedcount = selectedRows.size;
  const selectAll = selectedcount === allcount;
  const halfSelected = selectedcount > 0 && selectedcount < allcount;
  return (
    <div className="w-full min-h-[70vh] flex justify-center px-4 pt-10 pb-16">
      <div className="w-full max-w-4xl rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b bg-muted/20">
          <div className="flex items-center gap-2.5">
            <span className="h-9 w-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="h-4.5 w-4.5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold">测试文件</h2>
              <p className="text-sm text-muted-foreground">
                仅展示 data 目录下文件
              </p>
            </div>
          </div>
          <Button
            size="sm"
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            返回上一页
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-8">
                <Checkbox
                  checked={selectedcount === fileList.length}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedRows(new Set(fileList));
                    } else {
                      setSelectedRows(new Set());
                    }
                  }}
                />
              </TableHead>
              <TableHead>文件名</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fileList.map((item) => {
              return (
                <TableRow key={item} className="hover:bg-muted/30">
                  <TableCell>
                    <Checkbox
                      id={item as string}
                      checked={selectedRows.has(item)}
                      onCheckedChange={(checked) => {
                        if (checked === true) {
                          setSelectedRows(new Set([...selectedRows, item]));
                        } else {
                          setSelectedRows(new Set());
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-sm">{item}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2.5 text-xs gap-1"
                    >
                      <Download className="h-3.5 w-3.5" />
                      下载
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          <TableFooter>
            <TableRow className="bg-muted/30">
              <TableCell colSpan={2} className="text-sm text-muted-foreground">
                已选 {selectedcount} / {allcount} 个文件
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5 text-xs gap-1"
                >
                  <Download className="h-3.5 w-3.5" />
                  下载
                </Button>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
}
