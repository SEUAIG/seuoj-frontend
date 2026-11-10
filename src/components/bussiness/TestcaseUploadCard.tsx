import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import type { TestcaseUploadProgress } from "@/services/problemEdit";
import { Button } from "@/components/ui/button";

interface TestcaseUploadCardProps {
  file: File | null;
  format: string;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFormatChange: (value: string) => void;
  onConfirm: () => void;
  confirmLoading?: boolean;
  disabled?: boolean;
  uploadProgress?: TestcaseUploadProgress | null;
  uploadStatus?: { kind: "success" | "error"; message: string } | null;
}

export default function TestcaseUploadCard({
  file,
  format,
  onFileChange,
  onFormatChange,
  onConfirm,
  confirmLoading = false,
  disabled = false,
  uploadProgress,
  uploadStatus,
}: TestcaseUploadCardProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (!file && fileInputRef.current) fileInputRef.current.value = "";
  }, [file]);
  return (
    <Card className="border shadow-sm bg-white/80 backdrop-blur">
      <CardHeader className="border-b bg-muted/30">
        <CardTitle className="text-lg font-semibold">测试用例上传</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">测试用例文件</div>
            <Input
              ref={fileInputRef}
              type="file"
              accept=".zip,.tar,.tar.gz,.tgz,.7z"
              className="cursor-pointer bg-background/50"
              onChange={onFileChange}
              disabled={confirmLoading || disabled}
            />
            {file ? (
              <div className="text-xs text-muted-foreground">
                已选择：{file.name}
              </div>
            ) : null}
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">文件格式</div>
            <select
              className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background/50 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              value={format}
              onChange={(event) => onFormatChange(event.target.value)}
              disabled={!file || confirmLoading || disabled}
            >
              <option value="">请选择格式</option>
              <option value="zip">zip</option>
              <option value="tar">tar</option>
              <option value="tar.gz">tar.gz</option>
              <option value="tgz">tgz</option>
              <option value="7z">7z</option>
            </select>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          上传会覆盖已有测试点，仅支持 UTF-8。单次上传最长等待 5 分钟。
        </div>
        {confirmLoading && uploadProgress && (
          <div className="space-y-2" aria-busy="true">
            <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
              <span role="status">{uploadProgress.stage === "processing" ? "文件已发送，服务器正在处理，请稍候…" : "正在上传测试数据…"}</span>
              <span className="shrink-0 tabular-nums">{uploadProgress.percent === undefined ? "正在传输" : String(uploadProgress.percent) + "%"}</span>
            </div>
            <div role="progressbar" aria-label="测试数据上传进度" aria-valuemin={0} aria-valuemax={100} aria-valuenow={uploadProgress.percent}
              aria-valuetext={uploadProgress.stage === "processing" ? "文件已发送，等待服务器处理" : uploadProgress.percent === undefined ? "正在传输，文件总大小未知" : "已上传 " + uploadProgress.percent + "%"}
              className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-blue-600" style={{ width: String(uploadProgress.percent ?? 0) + "%" }} />
            </div>
          </div>
        )}
        {!confirmLoading && uploadStatus && (
          <p role={uploadStatus.kind === "error" ? "alert" : "status"} className={uploadStatus.kind === "error" ? "text-sm text-destructive" : "text-sm text-emerald-700"}>
            {uploadStatus.message}
          </p>
        )}
        {file && format && (
          <Button
            type="button"
            onClick={onConfirm}
            disabled={confirmLoading || disabled}
            className="w-full mt-2 bg-blue-600 hover:bg-blue-700"
          >
            {confirmLoading ? uploadProgress?.stage === "processing" ? "服务器处理中…" : "上传中…" : "确认上传"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
