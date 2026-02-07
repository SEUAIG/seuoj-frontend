import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
type UnauthorizedState = {
  perm?: string;
  role?: string;
  allowedRoles?: string[];
  fallbackPath?: string;
};
export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as UnauthorizedState) || {};
  const perm = state.perm ?? "admin";
  const role = state.role ?? "unknown";
  const allowedRoles = state.allowedRoles ?? ["admin"];
  const fallbackPath = state.fallbackPath ?? "/home";
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <Card className="w-full max-w-2xl shadow-sm">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">权限不足</CardTitle>
          <CardDescription>
            该页面仅对指定角色开放，你当前账号不具备相应权限。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
            角色权限不足
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Link to={fallbackPath}>返回可访问页面</Link>
            </Button>
            <Button variant="outline" onClick={() => navigate(-1)}>
              返回上一页
            </Button>
          </div>
          <Accordion type="single" collapsible>
            <AccordionItem value="debug">
              <AccordionTrigger className="text-sm">调试信息</AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-2 text-sm">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-muted-foreground">需要权限：</span>
                    <span className="font-medium text-foreground">{perm}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-muted-foreground">当前角色：</span>
                    <span className="font-medium text-foreground">{role}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-muted-foreground">允许角色：</span>
                    <span className="font-medium text-foreground">
                      {allowedRoles.join(", ")}
                    </span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
        <CardFooter />
      </Card>
    </div>
  );
}
