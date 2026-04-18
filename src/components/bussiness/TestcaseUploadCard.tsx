import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";

interface TestcaseUploadCardProps {
  file: File | null;
  format: string;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFormatChange: (value: string) => void;
  onConfirm: () => void;
  confirmLoading?: boolean;
}

export default function TestcaseUploadCard({
  file,
  format,
  onFileChange,
  onFormatChange,
  onConfirm,
  confirmLoading = false,
}: TestcaseUploadCardProps) {
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
              type="file"
              accept=".zip,.tar,.tar.gz,.tgz,.7z"
              className="cursor-pointer bg-background/50"
              onChange={onFileChange}
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
              disabled={!file}
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
          上传会覆盖已有测试点，仅支持 UTF-8
        </div>
        {file && format && (
          <Button
            type="button"
            onClick={onConfirm}
            disabled={confirmLoading}
            className="w-full mt-2 bg-blue-600 hover:bg-blue-700"
          >
            {confirmLoading ? "上传中..." : "确认上传"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
