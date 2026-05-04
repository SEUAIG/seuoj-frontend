import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
    batchImportClassMembers,
    type StudentRow,
    type ClassBatchImportResult,
    type RowResult,
} from "@/services/Class/batchImportClassMembers";
import {
    Upload,
    Download,
    AlertCircle,
    CheckCircle2,
    Loader2,
    Mail,
    FileText,
    FileSpreadsheet,
    Info,
} from "lucide-react";
import ColumnMappingStep from "@/components/bussiness/ColumnMappingStep";
import {
    findHeaderRow,
    type ColumnMapping,
} from "@/lib/columnDetection";
import {
    getBatchImportPreviewPassword,
    resolveBatchImportPassword,
} from "@/lib/batchImportPassword";

type FileType = "csv" | "xlsx" | null;
type ImportStep = "config" | "mapping" | "preview" | "result";
type PreviewStudentRow = StudentRow & {
    password_source: "provided" | "generated";
};

interface Props {
    isOpen: boolean;
    onClose: () => void;
    classId: number;
    onSuccess?: () => void;
}

let xlsxModulePromise: Promise<typeof import("xlsx")> | null = null;

function loadXlsx() {
    if (!xlsxModulePromise) {
        xlsxModulePromise = import("xlsx");
    }
    return xlsxModulePromise;
}

export default function BatchImportMembersModal({
    isOpen,
    onClose,
    classId,
    onSuccess,
}: Props) {
    const [importStep, setImportStep] = useState<ImportStep>("config");
    const [previewData, setPreviewData] = useState<PreviewStudentRow[]>([]);
    const [importResult, setImportResult] =
        useState<ClassBatchImportResult | null>(null);
    const [importing, setImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [sendEmail, setSendEmail] = useState(false);
    const [selectedFileType, setSelectedFileType] = useState<FileType>(null);
    const [uploadedFileType, setUploadedFileType] = useState<FileType>(null);
    const [rawHeaders, setRawHeaders] = useState<string[]>([]);
    const [rawDataRows, setRawDataRows] = useState<string[][]>([]);
    const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);

    const resetState = () => {
        setImportStep("config");
        setPreviewData([]);
        setImportResult(null);
        setSendEmail(false);
        setSelectedFileType(null);
        setUploadedFileType(null);
        setRawHeaders([]);
        setRawDataRows([]);
        setColumnMappings([]);
    };

    const handleClose = () => {
        if (!importing) {
            resetState();
            onClose();
        }
    };

    const parseAllRows = (allRows: string[][]) => {
        if (allRows.length < 2)
            throw new Error("文件至少需要包含表头和一行数据");

        const { headerRowIndex, mappings } = findHeaderRow(allRows);
        const cleanedHeaders = allRows[headerRowIndex].map((h) =>
            String(h ?? "")
                .replace(/^\uFEFF/, "")
                .trim()
        );
        if (cleanedHeaders.length === 0 || cleanedHeaders.every((h) => !h)) {
            throw new Error("文件表头为空");
        }
        const dataRows = allRows
            .slice(headerRowIndex + 1)
            .map((row) => row.map((cell) => String(cell ?? "")));
        const validRows = dataRows.filter((row) =>
            row.some((cell) => cell.trim())
        );
        if (validRows.length === 0)
            throw new Error("文件中没有有效的数据行");
        if (validRows.length > 500)
            throw new Error("单次最多导入500个学生");

        setRawHeaders(cleanedHeaders);
        setRawDataRows(validRows);
        setColumnMappings(mappings);
        setImportResult(null);
        setImportStep("mapping");
    };

    const parseCSV = (text: string) => {
        const lines = text
            .split(/\r?\n/)
            .map((l) => l.trim())
            .filter((l) => l.length > 0);
        const allRows = lines.map((l) => l.split(","));
        parseAllRows(allRows);
    };

    const parseXLSX = async (data: ArrayBuffer) => {
        const XLSX = await loadXlsx();
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) throw new Error("Excel 文件中没有工作表");
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<string[]>(sheet, {
            header: 1,
            defval: "",
        });
        const allRows = jsonData.map((row) => row.map(String));
        parseAllRows(allRows);
    };

    const transformWithMappings = (
        dataRows: string[][],
        mappings: ColumnMapping[],
        emailSuffix: string
    ): PreviewStudentRow[] => {
        const fieldToIndex = new Map<string, number>();
        for (const m of mappings) {
            if (m.mappedField !== "ignore") {
                fieldToIndex.set(m.mappedField, m.columnIndex);
            }
        }
        const usernameIdx = fieldToIndex.get("username");
        const nicknameIdx = fieldToIndex.get("nickname");
        const passwordIdx = fieldToIndex.get("password");

        if (usernameIdx === undefined)
            throw new Error("未映射用户名/学号列");

        const rows: PreviewStudentRow[] = [];
        for (const cols of dataRows) {
            const studentId = (cols[usernameIdx] || "").trim();
            if (!studentId) continue;

            const name =
                nicknameIdx !== undefined
                    ? (cols[nicknameIdx] || "").trim()
                    : "";
            const providedPassword =
                passwordIdx !== undefined
                    ? (cols[passwordIdx] || "").trim()
                    : "";
            const resolvedPassword = resolveBatchImportPassword(
                studentId,
                providedPassword
            );

            rows.push({
                student_id: studentId,
                name,
                password: resolvedPassword.password,
                password_source: resolvedPassword.source,
            });
        }

        if (rows.length === 0) throw new Error("文件中没有有效的数据行");
        return rows;
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const isCSV = file.name.endsWith(".csv");
        const isXLSX =
            file.name.endsWith(".xlsx") || file.name.endsWith(".xls");

        if (selectedFileType === "csv" && !isCSV) {
            toast.error("请选择 CSV 文件");
            return;
        }
        if (selectedFileType === "xlsx" && !isXLSX) {
            toast.error("请选择 Excel (.xlsx/.xls) 文件");
            return;
        }

        setUploadedFileType(isCSV ? "csv" : "xlsx");

        if (isCSV) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    parseCSV(event.target?.result as string);
                } catch (err: unknown) {
                    toast.error(
                        "文件解析失败: " +
                        (err instanceof Error ? err.message : String(err))
                    );
                }
            };
            reader.readAsText(file);
        } else {
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    await parseXLSX(event.target?.result as ArrayBuffer);
                } catch (err: unknown) {
                    toast.error(
                        "文件解析失败: " +
                        (err instanceof Error ? err.message : String(err))
                    );
                }
            };
            reader.readAsArrayBuffer(file);
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleImport = async () => {
        if (previewData.length === 0) return;
        setImporting(true);
        try {
            const res = await batchImportClassMembers(classId, {
                password_mode: "assigned",
                send_email: sendEmail,
                students: previewData.map((row) => ({
                    student_id: row.student_id,
                    name: row.name,
                    password: row.password,
                })),
            });
            if (res.code === 0) {
                setImportResult(res.data);
                setImportStep("result");
                toast.success(
                    `导入完成：成功 ${res.data.success_count} 个，跳过 ${res.data.skipped_count} 个，失败 ${res.data.fail_count} 个`
                );
                onSuccess?.();
            } else {
                toast.error("导入失败: " + res.message);
            }
        } catch (err: unknown) {
            toast.error(
                "导入请求失败: " +
                (err instanceof Error ? err.message : String(err))
            );
        } finally {
            setImporting(false);
        }
    };

    const downloadAllReport = async () => {
        if (!importResult || importResult.rows.length === 0) return;
        const dateStr = new Date().toISOString().slice(0, 10);

        const allRows: (string | number)[][] = [
            ["序号", "一卡通号", "姓名", "邮箱", "密码", "状态", "详情"],
            ...importResult.rows.map((r: RowResult) => [
                r.row,
                r.student_id,
                r.name,
                r.email || "",
                r.password || "",
                r.status,
                r.detail || "",
            ]),
        ];

        if (uploadedFileType === "xlsx") {
            const XLSX = await loadXlsx();
            const ws = XLSX.utils.aoa_to_sheet(allRows);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "导入结果");
            XLSX.writeFile(wb, `班级批量导入结果_${dateStr}.xlsx`);
        } else {
            const csv = allRows.map((row) =>
                row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
            ).join("\n");
            const blob = new Blob(["﻿" + csv], {
                type: "text/csv;charset=utf-8;",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `班级批量导入结果_${dateStr}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    const formatHint = `系统将自动识别表头行位置及列含义（即使表头前有标题行也能识别）。
支持中英文表头，列顺序不限，列名可使用下列任一写法。

支持的列名示例（可选其一）：
  学号/一卡通号：一卡通号, 一卡通, 学号, 学工号, username, student_id, student id, account id
  姓名：姓名, 名字, name, full name, student name, nickname, 真实姓名
  密码（可选）：密码, 初始密码, password, pwd（留空将按规则自动生成：321+学号）
  邮箱（可选）：邮箱, 电子邮箱, email, e-mail
  未提供邮箱时自动推导为「一卡通号@seu.edu.cn」`;

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open && !importing) handleClose();
            }}
        >
            <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>
                        批量导入学生
                        {importStep === "config" && " — 导入设置"}
                        {importStep === "mapping" && " — 列映射确认"}
                        {importStep === "preview" && " — 数据预览"}
                        {importStep === "result" && " — 导入结果"}
                    </DialogTitle>
                    <DialogDescription>
                        {importStep === "config" &&
                            "上传含学生信息的文件，系统将自动识别列含义并创建账号。"}
                        {importStep === "mapping" &&
                            "系统已自动识别列含义，请确认或调整映射关系。"}
                        {importStep === "preview" &&
                            "预览解析的数据，确认无误后执行导入。"}
                        {importStep === "result" && "导入完成，查看结果详情。"}
                    </DialogDescription>
                </DialogHeader>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                    onChange={handleFileSelect}
                />

                {/* Step 1: Config */}
                {importStep === "config" && (
                    <div className="flex-1 overflow-auto space-y-5 py-2">
                        {/* Send email toggle */}
                        <div>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={sendEmail}
                                    onChange={(e) => setSendEmail(e.target.checked)}
                                    className="accent-primary"
                                />
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">导入成功后发送邮件将账号密码告知新注册的学生</span>
                            </label>
                        </div>

                        {/* File type selector */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">文件类型</label>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setSelectedFileType("csv")}
                                    className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${selectedFileType === "csv"
                                        ? "border-primary bg-primary/5"
                                        : "border-border hover:border-muted-foreground/50"
                                        }`}
                                >
                                    <FileText className="h-5 w-5" />
                                    <span className="text-sm font-medium">CSV 文件</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedFileType("xlsx")}
                                    className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${selectedFileType === "xlsx"
                                        ? "border-primary bg-primary/5"
                                        : "border-border hover:border-muted-foreground/50"
                                        }`}
                                >
                                    <FileSpreadsheet className="h-5 w-5" />
                                    <span className="text-sm font-medium">Excel 文件</span>
                                </button>
                            </div>
                        </div>

                        {/* Format requirements */}
                        {!selectedFileType && (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                点击选择文件类型查看格式要求
                            </p>
                        )}
                        {selectedFileType && (
                            <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <Info className="h-4 w-4 text-blue-500" />
                                    <span>格式说明</span>
                                </div>
                                <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">
                                    {formatHint}
                                </pre>
                                <div className="pt-2">
                                    <Button
                                        size="sm"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Upload className="h-4 w-4 mr-1" />
                                        选择
                                        {selectedFileType === "csv" ? " CSV " : " Excel "}
                                        文件上传
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 2: Column Mapping */}
                {importStep === "mapping" && (
                    <ColumnMappingStep
                        headers={rawHeaders}
                        sampleRows={rawDataRows.slice(0, 3)}
                        initialMappings={columnMappings}
                        passwordMode="assigned"
                        requirePasswordMapping={false}
                        onConfirm={(confirmedMappings, emailSuffix) => {
                            try {
                                const rows = transformWithMappings(
                                    rawDataRows,
                                    confirmedMappings,
                                    emailSuffix
                                );
                                setPreviewData(rows);
                                setColumnMappings(confirmedMappings);
                                setImportStep("preview");
                            } catch (err: unknown) {
                                toast.error(
                                    "数据转换失败: " +
                                    (err instanceof Error
                                        ? err.message
                                        : String(err))
                                );
                            }
                        }}
                        onBack={() => {
                            setImportStep("config");
                            setRawHeaders([]);
                            setRawDataRows([]);
                            setColumnMappings([]);
                        }}
                    />
                )}

                {/* Step 3: Preview */}
                {importStep === "preview" && (
                    <div className="flex-1 overflow-auto space-y-3">
                        <p className="text-sm text-muted-foreground">
                            共 {previewData.length} 条记录待导入
                            （密码规则：文件有值则沿用，否则自动生成 321+学号）
                            {sendEmail && "，导入后将发送邮件通知"}
                        </p>
                        <div className="border rounded-lg max-h-[400px] overflow-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[60px]">序号</TableHead>
                                        <TableHead>一卡通号</TableHead>
                                        <TableHead>姓名</TableHead>
                                        <TableHead>推导邮箱</TableHead>
                                        <TableHead>密码</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {previewData.map((row, i) => (
                                        <TableRow key={i}>
                                            <TableCell>{i + 1}</TableCell>
                                            <TableCell className="font-mono">
                                                {row.student_id}
                                            </TableCell>
                                            <TableCell>{row.name}</TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {row.student_id}@seu.edu.cn
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">
                                                {getBatchImportPreviewPassword(
                                                    row.password || "",
                                                    row.password_source
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}

                {/* Step 3: Result */}
                {importStep === "result" && importResult && (
                    <div className="flex-1 overflow-auto space-y-4">
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle2 className="h-5 w-5" />
                                <span>成功 {importResult.success_count} 个</span>
                            </div>
                            {importResult.skipped_count > 0 && (
                                <div className="flex items-center gap-2 text-yellow-600">
                                    <AlertCircle className="h-5 w-5" />
                                    <span>跳过 {importResult.skipped_count} 个</span>
                                </div>
                            )}
                            {importResult.fail_count > 0 && (
                                <div className="flex items-center gap-2 text-red-600">
                                    <AlertCircle className="h-5 w-5" />
                                    <span>失败 {importResult.fail_count} 个</span>
                                </div>
                            )}
                        </div>

                        {/* Unified result table */}
                        {importResult.rows.length > 0 && (
                            <div className="space-y-3">
                                <div className="rounded-lg border max-h-[300px] overflow-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[50px]">序号</TableHead>
                                                <TableHead>一卡通号</TableHead>
                                                <TableHead>姓名</TableHead>
                                                <TableHead>邮箱</TableHead>
                                                <TableHead>密码</TableHead>
                                                <TableHead>状态</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {importResult.rows.map((r: RowResult, i: number) => (
                                                <TableRow key={i}>
                                                    <TableCell>{r.row}</TableCell>
                                                    <TableCell className="font-mono">
                                                        {r.student_id}
                                                    </TableCell>
                                                    <TableCell>{r.name || "-"}</TableCell>
                                                    <TableCell className="text-muted-foreground">
                                                        {r.email || "-"}
                                                    </TableCell>
                                                    <TableCell className="font-mono text-xs">
                                                        {r.password || "-"}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className={
                                                            r.status.includes("跳过") ? "text-yellow-600" :
                                                            r.status.includes("忽略") ? "text-red-600" :
                                                            "text-green-600"
                                                        }>
                                                            {r.status}
                                                        </span>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                <Button
                                    size="sm"
                                    onClick={downloadAllReport}
                                >
                                    <Download className="h-4 w-4 mr-1" />
                                    下载全部记录
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                <DialogFooter>
                    {importStep === "config" && (
                        <Button variant="outline" onClick={handleClose}>
                            取消
                        </Button>
                    )}
                    {importStep === "preview" && (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setImportStep("mapping");
                                    setPreviewData([]);
                                }}
                            >
                                上一步
                            </Button>
                            <Button
                                onClick={handleImport}
                                disabled={importing || previewData.length === 0}
                            >
                                {importing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                        导入中...
                                    </>
                                ) : (
                                    `确认导入 ${previewData.length} 个学生`
                                )}
                            </Button>
                        </>
                    )}
                    {importStep === "result" && (
                        <Button onClick={handleClose}>关闭</Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
