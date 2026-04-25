import React, { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import useQueryToGetProblemSetList from "@/hooks/useQueryToGetProblemSetList";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Plus, ExternalLink } from "lucide-react";

export default function ProblemSetListPage() {
    const nav = useNavigate();
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const [current, setCurrent] = useState(1);
    const [size] = useState(10);

    const queryParams = useMemo(
        () => ({ current, size }),
        [current, size]
    );

    const { data, isLoading, isFetching } =
        useQueryToGetProblemSetList(queryParams);

    const records = data?.records ?? [];
    const total = data?.total ?? 0;
    const pages = Math.ceil(total / size);

    const handlePageChange = (newPage: number) => {
        setCurrent(newPage);
    };

    const renderPaginationItems = () => {
        const items = [];
        const maxVisiblePages = 8;
        items.push(
            <PaginationItem key={1}>
                <PaginationLink
                    onClick={() => handlePageChange(1)}
                    isActive={current === 1}
                    className="cursor-pointer"
                >
                    1
                </PaginationLink>
            </PaginationItem>
        );
        let startPage = Math.max(2, current - Math.floor(maxVisiblePages / 2));
        const endPage = Math.min(pages - 1, startPage + maxVisiblePages - 1);
        if (endPage === pages - 1) {
            startPage = Math.max(2, endPage - maxVisiblePages + 1);
        }
        if (startPage > 2) {
            items.push(
                <PaginationItem key="start-ellipsis">
                    <PaginationEllipsis />
                </PaginationItem>
            );
        }
        for (let i = startPage; i <= endPage; i++) {
            items.push(
                <PaginationItem key={i}>
                    <PaginationLink
                        onClick={() => handlePageChange(i)}
                        isActive={current === i}
                        className="cursor-pointer"
                    >
                        {i}
                    </PaginationLink>
                </PaginationItem>
            );
        }
        if (endPage < pages - 1) {
            items.push(
                <PaginationItem key="end-ellipsis">
                    <PaginationEllipsis />
                </PaginationItem>
            );
        }
        if (pages > 1) {
            items.push(
                <PaginationItem key={pages}>
                    <PaginationLink
                        onClick={() => handlePageChange(pages)}
                        isActive={current === pages}
                        className="cursor-pointer"
                    >
                        {pages}
                    </PaginationLink>
                </PaginationItem>
            );
        }
        return items;
    };

    return (
        <div className="w-4/5 mx-auto py-6 space-y-6 min-h-screen overflow-x-hidden">
            <Helmet>
                <title>题单 - SEUOJ</title>
            </Helmet>
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-2xl font-semibold">题单</div>
                    <div className="text-sm text-muted-foreground mt-1">
                        浏览和管理题单列表
                    </div>
                </div>
            </div>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        共计{" "}
                        <span className="font-semibold text-foreground">{total}</span>{" "}
                        个题单
                    </div>
                    {isAuthenticated && (
                    <Button
                        onClick={() => nav("/problemset/create")}
                        className="flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        创建题单
                    </Button>
                    )}
                </div>
                <div
                    className={`rounded-xl border bg-card shadow-sm ${
                        isLoading || isFetching ? "opacity-60 transition-opacity" : ""
                    }`}
                >
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/60">
                                <TableHead className="w-[200px]">题单ID</TableHead>
                                <TableHead>标题</TableHead>
                                <TableHead>描述</TableHead>
                                <TableHead className="w-[100px]">题目数</TableHead>
                                <TableHead className="w-[100px]">公开</TableHead>
                                <TableHead className="w-[100px] text-right">操作</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell className="py-4"><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell className="py-4"><Skeleton className="h-4 w-32" /></TableCell>
                                        <TableCell className="py-4"><Skeleton className="h-4 w-48" /></TableCell>
                                        <TableCell className="py-4"><Skeleton className="h-4 w-8" /></TableCell>
                                        <TableCell className="py-4"><Skeleton className="h-4 w-12" /></TableCell>
                                        <TableCell className="py-4"><Skeleton className="h-4 w-12" /></TableCell>
                                    </TableRow>
                                ))
                            ) : records.length > 0 ? (
                                records.map((record) => (
                                    <TableRow
                                        key={record.problem_set_id}
                                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                                        onClick={() =>
                                            nav(`/problemset/${record.problem_set_id}`)
                                        }
                                    >
                                        <TableCell className="font-mono text-sm py-4 text-muted-foreground">
                                            {record.problem_set_id}
                                        </TableCell>
                                        <TableCell className="font-medium py-4">
                                            <span className="text-blue-600 hover:text-blue-700 hover:underline font-semibold">
                                                {record.title}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground max-w-[320px] truncate py-4">
                                            {record.description || "-"}
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <Badge variant="secondary" className="h-6 px-2.5 text-xs font-medium">
                                                {record.problem_count ?? 0}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <Badge
                                                variant={record.is_public ? "outline" : "secondary"}
                                                className={`h-6 px-2.5 text-xs font-medium ${
                                                    record.is_public
                                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                        : ""
                                                }`}
                                            >
                                                {record.is_public ? "公开" : "私有"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right py-4">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-muted-foreground hover:text-primary"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    nav(
                                                        `/problemset/${record.problem_set_id}`
                                                    );
                                                }}
                                            >
                                                <ExternalLink className="h-4 w-4 mr-1" />
                                                查看
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-10 text-center">
                                        暂无题单
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                {pages > 0 && (
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => {
                                        if (current > 1) handlePageChange(current - 1);
                                    }}
                                    className={
                                        current <= 1
                                            ? "pointer-events-none opacity-50"
                                            : "cursor-pointer"
                                    }
                                />
                            </PaginationItem>
                            {renderPaginationItems()}
                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => {
                                        if (current < pages) handlePageChange(current + 1);
                                    }}
                                    className={
                                        current >= pages
                                            ? "pointer-events-none opacity-50"
                                            : "cursor-pointer"
                                    }
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                )}
            </div>
        </div>
    );
}
