import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import ProblemSearchSelect, {
    ProblemSearchOption,
} from "@/components/bussiness/ProblemSearchSelect";

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
    const [selectedProblem, setSelectedProblem] =
        React.useState<ProblemSearchOption | null>(null);

    const handleAdd = () => {
        if (!selectedProblem) {
            toast.error("请选择题目");
            return;
        }
        if (problemList.some((item) => item.pid === selectedProblem.pid)) {
            toast.error("题目已存在");
            return;
        }
        onChange([
            ...problemList,
            {
                pid: selectedProblem.pid,
                title: selectedProblem.title,
                order_id: String(problemList.length + 1),
            },
        ]);
        setSelectedProblem(null);
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
            <div className="space-y-3 rounded-md border bg-muted/20 p-3">
                <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold">添加题目</h3>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAdd}
                        disabled={!selectedProblem}
                        className="flex shrink-0 items-center gap-1"
                    >
                        <Plus className="h-4 w-4" />
                        添加题目
                    </Button>
                </div>
                <ProblemSearchSelect
                    value={selectedProblem}
                    onChange={setSelectedProblem}
                    excludedPids={problemList.map((item) => item.pid)}
                />
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
                                <TableRow key={`${item.pid}-${index}`}>
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
                                        <span className="font-mono text-sm">{item.pid}</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="line-clamp-2 text-sm font-medium">
                                            {item.title}
                                        </span>
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
