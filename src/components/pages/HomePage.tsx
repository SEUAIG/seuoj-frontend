import React from "react";
import { Helmet } from "react-helmet-async";
import Fortune from "@/components/bussiness/Fortune";
import SubmissionHeatmap from "@/components/profile/SubmissionHeatmap";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function HomePage() {
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const currentYear = new Date().getFullYear();

  return (
    <div className="container mx-auto py-8 px-4">
      <Helmet>
        <title>首页 - SeuOJ</title>
      </Helmet>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content Area - 3/4 width on large screens */}
        <div className="lg:col-span-3 space-y-6">
          <section className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Welcome to SeuOJ
                </h1>
                <p className="text-muted-foreground mt-2">
                  {isAuthenticated
                    ? `欢迎回来, ${user?.username}!`
                    : "开启你的算法之旅。"}
                </p>
              </div>
              <div className="flex gap-3">
                <Button asChild>
                  <Link to="/problem">开始刷题</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/contest">参加比赛</Link>
                </Button>
              </div>
            </div>
          </section>

          {/* Announcements / News Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>公告</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground text-sm space-y-2">
                <p>暂无最新公告。</p>
              </div>
            </CardContent>
          </Card>

          {/* Recommended Problems Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>推荐题目</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground text-sm">
                <p>快去题库寻找适合你的题目吧！</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Area - 1/4 width on large screens */}
        <div className="space-y-6">
          {/* Fortune Component */}
          <Fortune />

          {/* Daily Streak / Stats Placeholder */}
          {isAuthenticated && <SubmissionHeatmap year={currentYear} />}
        </div>
      </div>
    </div>
  );
}
