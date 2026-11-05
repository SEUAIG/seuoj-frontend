import React from "react";
import { useNavigate } from "react-router-dom";
import { Package, PackagePlus, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getNextProblemId } from "@/services/Problem/getProblemDetail";
import { importProblemPack } from "@/services/Problem/importProblemPack";

/** 题目包目录结构说明，与 createhydro 产出的 Hydro 结构一致 */
const PACK_LAYOUT = `pack.zip
├── problem.yaml     题目元信息，取 title 与 tag
├── problem_zh.md    题面，按 ## 题目描述 / 输入格式 / 输出格式 / 样例 / 数据范围 分节
└── testdata/
    ├── config.yaml  时空限制与判定方式
    ├── 1.in
    ├── 1.ans
    └── checker.cpp  仅特判题需要`;

/** 以 KB / MB 展示文件大小 */
const formatFileSize = (size: number): string => {
  if (size < 1024) {
    return `${size} B`;
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
};

/**
 * 题目包导入对话框，供新建题目页使用
 * 题目包内不含题号与公开状态，这两项在此处填写
 */
export default function ProblemImportDialog() {
  const nav = useNavigate();
  const [open, setOpen] = React.useState(false);
  const [pid, setPid] = React.useState("");
  const [isPublic, setIsPublic] = React.useState(false);
  const [packFile, setPackFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);

  // 打开时预填下一个可用题号，用户可以改
  React.useEffect(() => {
    if (!open) return;
    getNextProblemId()
      .then((res) => {
        const nextPid = res.data?.next_pid;
        if (nextPid) setPid((prev) => prev || nextPid);
      })
      .catch(() => {
        /* 忽略，用户可手动填写 */
      });
  }, [open]);

  const handleOpenChange = (next: boolean) => {
    if (uploading) return;
    setOpen(next);
    if (!next) {
      setPackFile(null);
    }
  };

  const handleImport = async () => {
    if (!pid.trim()) {
      toast.error("请填写题号", { position: "top-center" });
      return;
    }
    if (!packFile) {
      toast.error("请先选择题目包文件", { position: "top-center" });
      return;
    }

    setUploading(true);
    try {
      const res = await importProblemPack({
        file: packFile,
        pid: pid.trim().toUpperCase(),
        isPublic,
      });
      if (res.code !== 0 && res.code !== 200) {
        throw new Error(res.message || "题目包导入失败");
      }
      const { pid: createdPid, testcase_count, checker_compiled, warnings } = res.data;
      toast.success(
        `题目 ${createdPid} 导入成功，共 ${testcase_count} 个测试点${
          checker_compiled ? "，已启用特判" : ""
        }`,
        { position: "top-center" }
      );
      (warnings ?? []).forEach((warning) => {
        toast.warning(warning, { position: "top-center", duration: 8000 });
      });
      setOpen(false);
      nav(`/problemsLibrary/${createdPid}`);
    } catch (error: any) {
      toast.error(error.message || "题目包导入失败", { position: "top-center" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          <PackagePlus className="mr-1 h-4 w-4" />
          导入题目包
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>导入题目包</DialogTitle>
          <DialogDescription>
            上传一个 Hydro 结构的题目包，一次性完成建题、测试数据上传与评测配置
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="import-pid">题号</Label>
            <Input
              id="import-pid"
              value={pid}
              placeholder="如 P0001"
              className="bg-background/50"
              disabled={uploading}
              onChange={(event) => setPid(event.target.value)}
            />
            <div className="text-xs text-muted-foreground">
              题目包内不含题号，默认填入下一个可用题号
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <Label htmlFor="import-public">导入后立即公开</Label>
              <div className="text-xs text-muted-foreground mt-1">
                关闭时题目仅出题人与管理员可见
              </div>
            </div>
            <Switch
              id="import-public"
              checked={isPublic}
              disabled={uploading}
              onCheckedChange={setIsPublic}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="import-file">题目包文件</Label>
            <Input
              id="import-file"
              type="file"
              accept=".zip,.tar,.tar.gz,.tgz,.7z"
              className="cursor-pointer bg-background/50"
              disabled={uploading}
              onChange={(event) => setPackFile(event.target.files?.[0] ?? null)}
            />
            {packFile ? (
              <div className="text-xs text-muted-foreground">
                已选择：{packFile.name}（{formatFileSize(packFile.size)}）
              </div>
            ) : null}
          </div>

          <div className="rounded-md border bg-muted/30 p-4">
            <div className="flex items-center gap-2 text-sm font-medium mb-2">
              <Package className="h-4 w-4" />
              题目包结构
            </div>
            <pre className="text-xs text-muted-foreground whitespace-pre overflow-x-auto">
              {PACK_LAYOUT}
            </pre>
          </div>

          <div className="text-xs text-muted-foreground">
            题目包内容由后端解析校验；题号已存在时导入会失败。
            标签按名称匹配，未注册的标签会被跳过。
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            disabled={uploading}
            onClick={() => handleOpenChange(false)}
          >
            取消
          </Button>
          <Button
            type="button"
            onClick={handleImport}
            disabled={!packFile || uploading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Upload className="mr-1 h-4 w-4" />
            {uploading ? "导入中..." : "开始导入"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
