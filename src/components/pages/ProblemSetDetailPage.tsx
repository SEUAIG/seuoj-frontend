import React, { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate } from "react-router-dom";
import useQueryToGetProblemSetDetail from "@/hooks/useQueryToGetProblemSetDetail";
import useQueryToGetProblemSetProblemPage from "@/hooks/useQueryToGetProblemSetProblemPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis,
} from "@/components/ui/pagination";
import { ArrowLeft, Settings, ExternalLink } from "lucide-react";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";

export default function ProblemSetDetailPage() {
    const { id } = useParams();
    const nav = useNavigate();

    const {
        data: detail,
        isLoading: detailLoading,
        isError,
        error,
    } = useQueryToGetProblemSetDetail(id || "");

    // 题目分页
    const [problemPage, setProblemPage] = useState(1);
    const [problemPageSize] = useState(20);

    const problemParams = useMemo(
        () => ({ current: problemPage, size: problemPageSize }),
        [problemPage, problemPageSize]
    );

    const { data: problemPageData, isLoading: problemLoading } =
        useQueryToGetProblemSetProblemPage(
            detail?.problem_set_id || "",
            problemParams,
            !!detail?.problem_set_id
        );

    const problemRecords = problemPageData?.records ?? [];
    const problemTotal = problemPageData?.total ?? 0;
    const problemPages = Math.ceil(problemTotal / problemPageSize);

    if (detailLoading) {
        return (
            <div className="w-4/5 mx-auto py-6 space-y-6">
                <Skeleton className="h-12 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
            </div>
        );
    }

    if (isError || !detail) {
        return (
            <div className="w-4/5 mx-auto py-6 text-center text-muted-foreground">
                <div className="text-xl font-semibold mb-2">加载题单信息失败</div>
                <p>{error instanceof Error ? error.message : "未知错误"}</p>
                <Button variant="outline" className="mt-4" onClick={() => nav(-1)}>
                    返回上一页
                </Button>
            </div>
        );
    }

    return (
        <div className="w-4/5 mx-auto py-6 space-y-6 min-h-screen">
            <Helmet>
                <title>
                    {detail.title ? `${detail.title} - 题单详情` : "题单详情"} - SeuOJ
                </title>
            </Helmet>
            {/* 顶部导航 */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => nav(-1)}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold">{detail.title}</h1>
                    {detail.description && (
                        <p className="text-muted-foreground mt-1 line-clamp-2">
                            {detail.description}
                        </p>
                    )}
                </div>
                <Button
                    variant="outline"
                    onClick={() => nav(`/problemset/${id}/edit`)}
                >
                    <Settings className="mr-2 h-4 w-4" />
                    编辑题单
                </Button>
            </div>

            {/* 基础信息卡片 */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-wrap gap-6 items-center mb-6 border-b pb-4">
                        <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">题单ID</div>
                            <div className="font-mono text-sm">{id}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">内部ID</div>
                            <div className="font-mono text-sm">
                                {detail.problem_set_id || "-"}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">公开性</div>
                            <Badge
                                variant={detail.is_public ? "outline" : "secondary"}
                                className={
                                    detail.is_public
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        : ""
                                }
                            >
                                {detail.is_public ? "公开" : "私有"}
                            </Badge>
                        </div>
                    </div>

                    {/* 描述 */}
                    {detail.description && (
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold mb-3">题单描述</h3>
                            <div className="prose prose-sm dark:prose-invert max-w-none bg-muted/30 p-4 rounded-lg">
                                <MarkdownRenderer>{detail.description}</MarkdownRenderer>
                            </div>
                        </div>
                    )}

                    {/* 题目列表 - 来自详情API */}
                    {detail.problem_list && detail.problem_list.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-3">题目概览</h3>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[80px]">序号</TableHead>
                                            <TableHead className="w-[150px]">题号</TableHead>
                                            <TableHead>标题</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {detail.problem_list.map((problem) => (
                                            <TableRow key={problem.pid}>
                                                <TableCell className="font-medium">
                                                    {problem.sort_order}
                                                </TableCell>
                                                <TableCell className="font-mono">
                                                    {problem.pid}
                                                </TableCell>
                                                <TableCell>{problem.title}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}

                    {/* 题目列表 - 来自分页API */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3">题目分页列表</h3>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[80px]">序号</TableHead>
                                        <TableHead className="w-[150px]">题号</TableHead>
                                        <TableHead>标题</TableHead>
                                        <TableHead className="w-[100px] text-right">
                                            操作
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {problemLoading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell>
                                                    <Skeleton className="h-4 w-8" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-4 w-20" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-4 w-32" />
                                                </TableCell>
                                                <TableCell>
                                                    <Skeleton className="h-4 w-12" />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : problemRecords.length > 0 ? (
                                        problemRecords.map((problem) => (
                                            <TableRow key={problem.pid}>
                                                <TableCell className="font-medium">
                                                    {problem.sort_order}
                                                </TableCell>
                                                <TableCell className="font-mono">
                                                    {problem.pid}
                                                </TableCell>
                                                <TableCell>{problem.title}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            nav(`/problemsLibrary/${problem.pid}`)
                                                        }
                                                    >
                                                        <ExternalLink className="h-4 w-4 mr-1" />
                                                        查看
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center">
                                                暂无题目
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        {problemPages > 0 && (
                            <div className="mt-4">
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                onClick={() => {
                                                    if (problemPage > 1)
                                                        setProblemPage(problemPage - 1);
                                                }}
                                                className={
                                                    problemPage <= 1
                                                        ? "pointer-events-none opacity-50"
                                                        : "cursor-pointer"
                                                }
                                            />
                                        </PaginationItem>
                                        {Array.from({ length: Math.min(problemPages, 8) }).map(
                                            (_, i) => (
                                                <PaginationItem key={i + 1}>
                                                    <PaginationLink
                                                        onClick={() => setProblemPage(i + 1)}
                                                        isActive={problemPage === i + 1}
                                                        className="cursor-pointer"
                                                    >
                                                        {i + 1}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            )
                                        )}
                                        {problemPages > 8 && (
                                            <PaginationItem>
                                                <PaginationEllipsis />
                                            </PaginationItem>
                                        )}
                                        <PaginationItem>
                                            <PaginationNext
                                                onClick={() => {
                                                    if (problemPage < problemPages)
                                                        setProblemPage(problemPage + 1);
                                                }}
                                                className={
                                                    problemPage >= problemPages
                                                        ? "pointer-events-none opacity-50"
                                                        : "cursor-pointer"
                                                }
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
