import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Info, CheckCircle2, AlertCircle } from "lucide-react";
import {
    type ColumnMapping,
    type ColumnRole,
    FIELD_LABELS,
    validateMappings,
} from "@/lib/columnDetection";
import { toast } from "sonner";

interface Props {
    headers: string[];
    sampleRows: string[][];
    initialMappings: ColumnMapping[];
    passwordMode: "assigned" | "random";
    onConfirm: (mappings: ColumnMapping[], emailSuffix: string) => void;
    onBack: () => void;
}

const ALL_FIELDS: (ColumnRole | "ignore")[] = [
    "username",
    "nickname",
    "email",
    "password",
    "ignore",
];

export default function ColumnMappingStep({
    headers,
    sampleRows,
    initialMappings,
    passwordMode,
    onConfirm,
    onBack,
}: Props) {
    const [mappings, setMappings] = useState<ColumnMapping[]>(initialMappings);
    const [emailSuffix, setEmailSuffix] = useState("seu.edu.cn");

    const usedFields = useMemo(() => {
        const used = new Set<string>();
        for (const m of mappings) {
            if (m.mappedField !== "ignore") {
                used.add(m.mappedField);
            }
        }
        return used;
    }, [mappings]);

    const hasEmailMapping = usedFields.has("email");

    const handleFieldChange = (index: number, value: ColumnRole | "ignore") => {
        setMappings((prev) =>
            prev.map((m, i) =>
                i === index
                    ? { ...m, mappedField: value, confidence: "high" }
                    : m
            )
        );
    };

    const handleConfirm = () => {
        const error = validateMappings(mappings, passwordMode);
        if (error) {
            toast.error(error);
            return;
        }
        onConfirm(mappings, emailSuffix);
    };

    return (
        <div className="flex-1 overflow-auto space-y-4">
            <div className="border rounded-lg overflow-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[140px]">文件列头</TableHead>
                            <TableHead className="w-[180px]">映射为</TableHead>
                            <TableHead>数据预览</TableHead>
                            <TableHead className="w-[40px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mappings.map((mapping, idx) => (
                            <TableRow key={idx}>
                                <TableCell className="font-medium">
                                    {mapping.columnHeader}
                                </TableCell>
                                <TableCell>
                                    <Select
                                        value={mapping.mappedField}
                                        onValueChange={(v) =>
                                            handleFieldChange(
                                                idx,
                                                v as ColumnRole | "ignore"
                                            )
                                        }
                                    >
                                        <SelectTrigger className="w-[160px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ALL_FIELDS.map((field) => (
                                                <SelectItem
                                                    key={field}
                                                    value={field}
                                                    disabled={
                                                        field !== "ignore" &&
                                                        field !==
                                                            mapping.mappedField &&
                                                        usedFields.has(field)
                                                    }
                                                >
                                                    {FIELD_LABELS[field]}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground truncate max-w-[260px]">
                                    {sampleRows
                                        .slice(0, 2)
                                        .map((row) =>
                                            mapping.mappedField === "password"
                                                ? "••••"
                                                : row[idx] || ""
                                        )
                                        .filter(Boolean)
                                        .join(", ")}
                                </TableCell>
                                <TableCell>
                                    {mapping.mappedField !== "ignore" &&
                                        mapping.confidence === "high" && (
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        )}
                                    {mapping.mappedField !== "ignore" &&
                                        mapping.confidence === "medium" && (
                                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                                        )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {!hasEmailMapping && (
                <div className="rounded-lg border bg-blue-50 dark:bg-blue-950/20 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                        <Info className="h-4 w-4 text-blue-500 shrink-0" />
                        <span>
                            未检测到邮箱列，将自动生成：
                            <span className="font-mono font-medium">
                                {"{用户名/学号}"}@{emailSuffix}
                            </span>
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            邮箱后缀:
                        </span>
                        <Input
                            value={emailSuffix}
                            onChange={(e) => setEmailSuffix(e.target.value)}
                            className="w-48 h-8 text-sm"
                            placeholder="seu.edu.cn"
                        />
                    </div>
                </div>
            )}

            {passwordMode === "random" && usedFields.has("password") && (
                <div className="rounded-lg border bg-yellow-50 dark:bg-yellow-950/20 p-3">
                    <div className="flex items-center gap-2 text-sm text-yellow-700 dark:text-yellow-400">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>
                            当前为随机密码模式，但检测到密码列。密码列将被忽略。
                        </span>
                    </div>
                </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={onBack}>
                    上一步
                </Button>
                <Button onClick={handleConfirm}>确认映射，预览数据</Button>
            </div>
        </div>
    );
}
