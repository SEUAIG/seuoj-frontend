import React from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="flex h-screen items-center justify-center overflow-hidden">
      <div className="flex items-center gap-6">
        <span className="text-7xl font-bold tracking-tight">404</span>
        <Separator orientation="vertical" className="h-16" />
        <div className="flex flex-col gap-3">
          <span className="text-lg font-medium">页面不存在</span>
          <span className="text-sm text-muted-foreground">
            你访问的地址可能已被删除或输入错误
          </span>
          <div className="mt-2 flex gap-2">
            <Button asChild size="sm">
              <Link to="/">返回首页</Link>
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              返回上一页
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
