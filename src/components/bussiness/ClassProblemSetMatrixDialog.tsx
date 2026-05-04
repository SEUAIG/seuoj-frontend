import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    getClassProblemSetMatrix,
    ClassProblemSetMatrixData,
} from "@/services/Class/getClassProblemSetMatrix";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    classId: number;
    problemSetId: number;
    problemSetTitle: string;
}

let xlsxModulePromise: Promise<typeof import("xlsx")> | null = null;

function loadXLSX() {
    if (!xlsxModulePromise) {
        xlsxModulePromise = import("xlsx");
    }
    return xlsxModulePromise;
}

export default function ClassProblemSetMatrixDialog({
    isOpen,
    onClose,
    classId,
    problemSetId,
    problemSetTitle,
}: Props) {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["classProblemSetMatrix", classId, problemSetId],
        queryFn: () => getClassProblemSetMatrix(classId, problemSetId),
        enabled: isOpen && !!classId && !!problemSetId,
    });

    const matrixData: ClassProblemSetMatrixData | undefined = data?.data;

    const handleExportExcel = async () => {
        if (!matrixData) return;
        const XLSX = await loadXLSX();

        const header = [
            "用户名",
            ...matrixData.problems.map((p) => p.pid),
            "AC 数",
            "完成率",
        ];

        const rows = matrixData.students.map((student) => [
            student.nickname || student.username,
            ...student.cells.map((c) =>
                c === "AC" ? "✓" : c === "ATTEMPTED" ? "✗" : ""
            ),
            student.ac_count,
            matrixData.problems.length > 0
                ? `${Math.round((student.ac_count / matrixData.problems.length) * 100)}%`
                : "0%",
        ]);

        const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "做题矩阵");
        XLSX.writeFile(wb, `${problemSetTitle}_做题矩阵.xlsx`);
    };

    const statusCell = (status: string) => {
        if (status === "AC") {
            return (
                <span className="inline-flex items-center justify-center w-7 h-7 rounded bg-green-100 text-green-700 font-bold text-xs">
                    ✓
                </span>
            );
        }
        if (status === "ATTEMPTED") {
            return (
                <span className="inline-flex items-center justify-center w-7 h-7 rounded bg-red-100 text-red-600 font-bold text-xs">
                    ✗
                </span>
            );
        }
        return (
            <span className="inline-flex items-center justify-center w-7 h-7 rounded bg-gray-100 text-gray-400 text-xs">
                —
            </span>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-[90vw] max-h-[85vh] flex flex-col">
                <DialogHeader className="flex flex-row items-center justify-between pr-8">
                    <DialogTitle className="text-lg">
                        题单做题矩阵 — {problemSetTitle}
                    </DialogTitle>
                    {matrixData && (
                        <Button variant="outline" size="sm" onClick={handleExportExcel}>
                            <Download className="h-4 w-4 mr-1" />
                            导出 Excel
                        </Button>
                    )}
                </DialogHeader>

                <div className="flex-1 overflow-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center min-h-[200px]">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : isError ? (
                        <div className="flex items-center justify-center text-red-500 min-h-[200px]">
                            加载失败: {error instanceof Error ? error.message : "未知错误"}
                        </div>
                    ) : !matrixData ||
                        matrixData.students.length === 0 ||
                        matrixData.problems.length === 0 ? (
                        <div className="flex items-center justify-center text-muted-foreground min-h-[200px]">
                            暂无数据（无学生或无题目）
                        </div>
                    ) : (
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-muted/50">
                                    <th className="sticky left-0 z-10 bg-muted/50 px-3 py-2 text-left font-medium border-b border-r min-w-[120px]">
                                        学生
                                    </th>
                                    {matrixData.problems.map((p) => (
                                        <th
                                            key={p.pid}
                                            className="px-2 py-2 text-center font-medium border-b min-w-[50px]"
                                            title={p.title}
                                        >
                                            {p.pid}
                                        </th>
                                    ))}
                                    <th className="px-3 py-2 text-center font-medium border-b border-l min-w-[70px]">
                                        AC
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {matrixData.students.map((student) => (
                                    <tr
                                        key={student.user_id}
                                        className="hover:bg-muted/30"
                                    >
                                        <td className="sticky left-0 z-10 bg-card px-3 py-2 font-medium border-r whitespace-nowrap">
                                            {student.nickname || student.username}
                                        </td>
                                        {student.cells.map((cell, idx) => (
                                            <td key={idx} className="px-2 py-2 text-center">
                                                {statusCell(cell)}
                                            </td>
                                        ))}
                                        <td className="px-3 py-2 text-center font-mono border-l">
                                            {student.ac_count}/{matrixData.problems.length}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
