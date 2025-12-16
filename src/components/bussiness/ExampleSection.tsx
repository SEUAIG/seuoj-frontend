import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
interface ExampleSectionProps {
  input: string;
  output: string;
  isAuthenticated: boolean;
  explain: string;
}
export function ExampleSection({
  input,
  output,
  isAuthenticated,
  explain,
}: ExampleSectionProps) {
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const [showInputCopyCheck, setShowInputCopyCheck] = useState(false); 
  const [showOutputCopyCheck, setShowOutputCopyCheck] = useState(false);
  const handleClick = (set: React.Dispatch<React.SetStateAction<boolean>>) => {
    set(true);
    setTimeout(() => {
      set(false);
    }, 1000); 
  };
  return (
    <Card className="overflow-hidden border shadow-sm">
      <CardHeader className="bg-gray-50 border-b py-3 px-4">
        <CardTitle className="text-sm font-bold text-gray-700">样例</CardTitle>
      </CardHeader>
      <CardContent className="p-4 text-gray-700 leading-relaxed">
        <div className="grid gap-6">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-sm text-gray-800">
                样例输入
              </span>
              <Button
                variant="outline"
                size="sm"
                className={`h-8 text-xs px-3 py-1 ${
                  showInputCopyCheck ? "disabled" : ""
                }`}
                onClick={() => {
                  toast.success("复制成功", { position: "top-center" });
                  handleCopy(input);
                  handleClick(setShowInputCopyCheck);
                }}
              >
                {showInputCopyCheck ? (
                  <Check />
                ) : (
                  <>
                    <Copy className="mr-2 h-3 w-3" />
                    复制
                  </>
                )}
              </Button>
            </div>
            <pre className="bg-gray-100 p-4 rounded-lg border border-gray-200 font-mono text-sm">
              {input}
            </pre>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-sm text-gray-800">
                样例输出
              </span>
              <Button
                variant="outline"
                size="sm"
                className={`h-8 text-xs px-3 py-1 ${
                  showOutputCopyCheck ? "disabled" : ""
                }`}
                onClick={() => {
                  toast.success("复制成功", { position: "top-center" });
                  handleCopy(output);
                  handleClick(setShowOutputCopyCheck); 
                }}
              >
                {showOutputCopyCheck ? (
                  <Check />
                ) : (
                  <>
                    <Copy className="mr-2 h-3 w-3" />
                    复制
                  </>
                )}
              </Button>
            </div>
            <pre className="bg-gray-100 p-4 rounded-lg border border-gray-200 font-mono text-sm">
              {output}
            </pre>
          </div>

          {isAuthenticated ? (
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold text-sm text-gray-800">
                  样例解释
                </span>
              </div>
              <pre className="bg-gray-100 p-4 rounded-lg border border-gray-200 font-normal text-sm">
                {explain}
              </pre>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
