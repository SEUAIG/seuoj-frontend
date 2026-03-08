import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export type ProblemListItem = {
    pid: string;
    title: string;
    order_id: string;
};

type ProblemListEditorProps = {
    problemList: ProblemListItem[];
    onChange: (list: ProblemListItem[]) => void;
};

export default function ProblemListEditor({
    problemList,
    onChange,
}: ProblemListEditorProps) {
    const handleAdd = () => {
        onChange([
            ...problemList,
            {
                pid: "",
                title: "",
                order_id: String(problemList.length + 1),
            },
        ]);
    };

    const handleRemove = (index: number) => {
        const next = problemList.filter((_, i) => i !== index);
        onChange(next);
    };

    const handleChange = (
        index: number,
        field: keyof ProblemListItem,
        value: string
    ) => {
        const next = problemList.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        );
        onChange(next);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">题目列表</h3>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAdd}
                    className="flex items-center gap-1"
                >
                    <Plus className="h-4 w-4" />
                    添加题目
                </Button>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">序号</TableHead>
                            <TableHead className="w-[200px]">题目ID (pid)</TableHead>
                            <TableHead>标题</TableHead>
                            <TableHead className="w-[100px] text-right">操作</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {problemList.length > 0 ? (
                            problemList.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <Input
                                            value={item.order_id}
                                            onChange={(e) =>
                                                handleChange(index, "order_id", e.target.value)
                                            }
                                            className="w-16 h-8"
                                            placeholder="序号"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            value={item.pid}
                                            onChange={(e) =>
                                                handleChange(index, "pid", e.target.value)
                                            }
                                            className="h-8"
                                            placeholder="输入题目ID"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            value={item.title}
                                            onChange={(e) =>
                                                handleChange(index, "title", e.target.value)
                                            }
                                            className="h-8"
                                            placeholder="输入标题"
                                        />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemove(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    暂无题目，点击"添加题目"开始添加
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
