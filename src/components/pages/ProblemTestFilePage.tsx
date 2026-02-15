import { useFileList } from "@/hooks/useFileList";
import { getTestFile } from "@/services/getTestFile";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

type FileNode = {
  name: string;
  children?: FileNode[];
};

export default function ProblemTestFilePage() {
  const nav = useNavigate();
  const { id } = useParams();
  const [tree, setTree] = useState<FileNode[]>([]);
  const fileListAll = useFileList(tree);
  const fileList = useMemo(
    () =>
      fileListAll
        .filter((item) => item.length > 5 && item.slice(0, 4) === "data")
        .map((item) => item.slice(5))
        .filter((item): item is string => item.length > 0),
    [fileListAll]
  );
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const allcount = fileList.length;
  const selectedcount = selectedRows.size;
  const handleSingleDownload = (filename: string) => {
    window.location.href = `/api/problem/file/${id}/data/${encodeURIComponent(
      filename
    )}`;
  };
  const downloadAll = (urls: string[]) => {
    urls.forEach((url, index) => {
      setTimeout(() => {
        const a = document.createElement("a");
        a.href = url;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }, index * 200);
    });
  };
  const handleMuiltipleDownload = () => {
    if (!id || selectedRows.size === 0) return;
    const urls = Array.from(selectedRows).map(
      (item) => `/api/problem/file/${id}/data/${encodeURIComponent(item)}`
    );
    downloadAll(urls);
  };

  useEffect(() => {
    if (!id) return;
    const fetchTree = async () => {
      const result = await getTestFile(id);
      setTree(Array.isArray(result) ? result : []);
    };
    fetchTree();
  }, [id]);
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
            onClick={() => {
              nav(-1);
            }}
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
                  checked={selectedcount === fileList.length && allcount > 0}
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
                      id={item}
                      checked={selectedRows.has(item)}
                      onCheckedChange={(checked) => {
                        if (checked === true) {
                          setSelectedRows(new Set([...selectedRows, item]));
                          return;
                        }
                        const next = new Set(selectedRows);
                        next.delete(item);
                        setSelectedRows(next);
                      }}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-sm">{item}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2.5 text-xs gap-1"
                      onClick={() => {
                        handleSingleDownload(item);
                      }}
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
                  onClick={() => {
                    handleMuiltipleDownload();
                  }}
                >
                  <Download className="h-3.5 w-3.5" />
                  合并下载
                </Button>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
}
