import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setCodeFile } from "@/features/Code/codeSlice";
interface FileUploadProps {
  pid: string;
  // 对于对象的类型说明放在外部interface 否则会被当作重命名
}
export default function FileUpload({ pid }: FileUploadProps) {
  const dispatch = useDispatch();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // 浏览器给的文件对象 只是句柄 没有文件内容
    if (!file) return;
    const reader = new FileReader();
    // 浏览器内置的读文件工具 FileReader
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === "string") {
        dispatch(setCodeFile({ pid, codeFile: text }));
        toast.success("文件上传成功", { position: "top-center" });
      } else {
        toast.error("读取文件失败", { position: "top-center" });
      }
    };
    // 文件读写是异步的 读完后浏览器会发出通知 onload
    reader.onerror = () => {
      toast.error("读取文件出错", { position: "top-center" });
    };
    reader.readAsText(file);
    // 把这个文件当作文本读出来
    // 重置 input value，允许重复上传同一个文件 
  };

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
        accept=".js,.ts,.py,.java,.cpp,.txt,.md"
        onChange={handleFileChange}
      />
    </div>
  );
}
