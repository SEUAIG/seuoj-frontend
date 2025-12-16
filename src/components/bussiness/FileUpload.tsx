import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "../ui/button";
export default function FileUpload() {
  return (
    <div className="flex border-2 flex-col items-start space-y-4 p-4 bg-gray-100 rounded-lg shadow w-full max-w-md  ">
      <Label
        htmlFor="file-upload"
        className="text-sm font-semibold text-gray-700"
      >
        或者，上传代码文件
      </Label>
      <Input
        id="file-upload"
        type="file"
        className="border border-gray-300 rounded-md p-2 w-full text-sm text-gray-700"
      />

    </div>
  );
}
