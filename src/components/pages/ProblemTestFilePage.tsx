import { useFileList } from "@/hooks/useFileList";
import {
  getTestFile,
  downloadProblemFile,
  downloadProblemFilesZip,
  exportProblemPack,
} from "@/services/getTestFile";
import { toast } from "sonner";
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
import { ArrowLeft, Download, FileText, Package, Settings } from "lucide-react";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
  const triggerBlobDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleSingleDownload = async (filename: string) => {
    if (!id) return;
    try {
      const blob = await downloadProblemFile(id, filename);
      triggerBlobDownload(blob, filename);
    } catch (e) {
      console.error("下载失败", e);
    }
  };

  const [exporting, setExporting] = useState(false);
  const handleExportPack = async () => {
    if (!id || exporting) return;
    setExporting(true);
    try {
      triggerBlobDownload(await exportProblemPack(id), `${id}.zip`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "导出失败");
    } finally {
      setExporting(false);
    }
  };

  const [zipping, setZipping] = useState(false);
  const handleMuiltipleDownload = async () => {
    if (!id || selectedRows.size === 0 || zipping) return;
    setZipping(true);
    try {
      // 按列表顺序发送，打出来的 zip 也按这个顺序
      const files = fileList.filter((item) => selectedRows.has(item));
      triggerBlobDownload(await downloadProblemFilesZip(id, files), `${id}-data.zip`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "打包下载失败");
    } finally {
      setZipping(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    const fetchTree = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getTestFile(id);
        setTree(Array.isArray(result) ? result : []);
      } catch (e: any) {
        const status = e?.response?.status;
        if (status === 401) {
          setError("未登录，请先登录管理员账号");
        } else if (status === 403) {
          setError("权限不足，需要管理员角色");
        } else {
          setError("加载文件树失败");
        }
      } finally {
        setLoading(false);
      }
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
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              disabled={!id || exporting}
              onClick={handleExportPack}
              title="题面、评测配置和全部数据打成一个 zip，可在新建题目页导入"
            >
              <Package className="h-4 w-4" />
              {exporting ? "导出中…" : "导出题目包"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() => {
                if (!id) return;
                nav(`/problemsLibrary/${id}/judgeConfig`);
              }}
            >
              <Settings className="h-4 w-4" />
              评测配置
            </Button>
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
        </div>
        {loading && (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            加载中...
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center py-16 text-red-500">
            {error}
          </div>
        )}
        {!loading && !error && (
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
                  disabled={selectedcount === 0 || zipping}
                  onClick={() => {
                    handleMuiltipleDownload();
                  }}
                >
                  <Download className="h-3.5 w-3.5" />
                  {zipping ? "打包中…" : "合并下载"}
                </Button>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
        )}
      </div>
    </div>
  );
}
