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
import * as XLSX from "xlsx";
import ColumnMappingStep from "@/components/bussiness/ColumnMappingStep";
import {
    detectColumnMappings,
    type ColumnMapping,
} from "@/lib/columnDetection";

type PasswordMode = "assigned" | "random";
type FileType = "csv" | "xlsx" | null;
type ImportStep = "config" | "mapping" | "preview" | "result";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    classId: number;
    onSuccess?: () => void;
}

export default function BatchImportMembersModal({
    isOpen,
    onClose,
    classId,
    onSuccess,
}: Props) {
    const [importStep, setImportStep] = useState<ImportStep>("config");
    const [previewData, setPreviewData] = useState<StudentRow[]>([]);
    const [importResult, setImportResult] =
        useState<ClassBatchImportResult | null>(null);
    const [importing, setImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [passwordMode, setPasswordMode] = useState<PasswordMode>("random");
    const [sendEmail, setSendEmail] = useState(true);
    const [selectedFileType, setSelectedFileType] = useState<FileType>(null);
    const [uploadedFileType, setUploadedFileType] = useState<FileType>(null);
    const [rawHeaders, setRawHeaders] = useState<string[]>([]);
    const [rawDataRows, setRawDataRows] = useState<string[][]>([]);
    const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);

    const resetState = () => {
        setImportStep("config");
        setPreviewData([]);
        setImportResult(null);
        setPasswordMode("random");
        setSendEmail(true);
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

    const parseFileToRaw = (headers: string[], dataRows: string[][]) => {
        if (headers.length === 0) throw new Error("文件表头为空");
        const validRows = dataRows.filter((row) =>
            row.some((cell) => cell.trim())
        );
        if (validRows.length === 0)
            throw new Error("文件中没有有效的数据行");
        if (validRows.length > 500)
            throw new Error("单次最多导入500个学生");

        setRawHeaders(headers);
        setRawDataRows(validRows);
        setColumnMappings(detectColumnMappings(headers));
        setImportResult(null);
        setImportStep("mapping");
    };

    const parseCSV = (text: string) => {
        const lines = text
            .split(/\r?\n/)
            .map((l) => l.trim())
            .filter((l) => l.length > 0);
        if (lines.length < 2) {
            throw new Error("文件至少需要包含表头和一行数据");
        }
        const headers = lines[0].split(",");
        const dataRows = lines.slice(1).map((l) => l.split(","));
        parseFileToRaw(headers, dataRows);
    };

    const parseXLSX = (data: ArrayBuffer) => {
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) throw new Error("Excel 文件中没有工作表");
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<string[]>(sheet, {
            header: 1,
            defval: "",
        });
        if (jsonData.length < 2) {
            throw new Error("文件至少需要包含表头和一行数据");
        }
        const headers = jsonData[0].map(String);
        const dataRows = jsonData.slice(1).map((row) => row.map(String));
        parseFileToRaw(headers, dataRows);
    };

    const transformWithMappings = (
        dataRows: string[][],
        mappings: ColumnMapping[],
        emailSuffix: string
    ): StudentRow[] => {
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

        const rows: StudentRow[] = [];
        for (const cols of dataRows) {
            const studentId = (cols[usernameIdx] || "").trim();
            if (!studentId) continue;

            const name =
                nicknameIdx !== undefined
                    ? (cols[nicknameIdx] || "").trim()
                    : "";
            const password =
                passwordIdx !== undefined
                    ? (cols[passwordIdx] || "").trim()
                    : "";

            if (!name) {
                throw new Error(
                    `学生「${studentId}」的姓名不能为空，请映射昵称/姓名列`
                );
            }

            if (passwordMode === "assigned" && !password) {
                throw new Error(
                    `指定密码模式下，学生「${name}」(${studentId}) 的密码不能为空`
                );
            }

            rows.push({
                student_id: studentId,
                name,
                password: passwordMode === "assigned" ? password : undefined,
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
            reader.onload = (event) => {
                try {
                    parseXLSX(event.target?.result as ArrayBuffer);
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
                password_mode: passwordMode,
                send_email: sendEmail,
                students: previewData,
            });
            if (res.code === 0) {
                setImportResult(res.data);
                setImportStep("result");
                toast.success(
                    `导入完成：成功 ${res.data.success_count} 个，失败 ${res.data.fail_count} 个`
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

    const downloadSuccessReport = () => {
        if (!importResult || importResult.successes.length === 0) return;
        const dateStr = new Date().toISOString().slice(0, 10);

        if (uploadedFileType === "xlsx") {
            const wsData = [
                ["序号", "一卡通号", "姓名", "邮箱", "密码", "备注"],
                ...importResult.successes.map((s) => [
                    s.row,
                    s.student_id,
                    s.name,
                    s.email,
                    s.password,
                    s.existing_account ? "已有账号(直接加入班级)" : "新创建",
                ]),
            ];
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "导入成功账号");
            XLSX.writeFile(wb, `班级导入成功账号_${dateStr}.xlsx`);
        } else {
            const csv = [
                "序号,一卡通号,姓名,邮箱,密码,备注",
                ...importResult.successes.map(
                    (s) =>
                        `${s.row},"${s.student_id}","${s.name}","${s.email}","${s.password}","${s.existing_account ? "已有账号(直接加入班级)" : "新创建"}"`
                ),
            ].join("\n");
            const blob = new Blob(["\uFEFF" + csv], {
                type: "text/csv;charset=utf-8;",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `班级导入成功账号_${dateStr}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    const downloadFailureReport = () => {
        if (!importResult || importResult.failures.length === 0) return;
        const dateStr = new Date().toISOString().slice(0, 10);

        if (uploadedFileType === "xlsx") {
            const wsData = [
                ["行号", "一卡通号", "姓名", "失败原因"],
                ...importResult.failures.map((f) => [
                    f.row,
                    f.student_id,
                    f.name,
                    f.reason,
                ]),
            ];
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "失败记录");
            XLSX.writeFile(wb, `班级导入失败记录_${dateStr}.xlsx`);
        } else {
            const csv = [
                "行号,一卡通号,姓名,失败原因",
                ...importResult.failures.map(
                    (f) =>
                        `${f.row},"${f.student_id}","${f.name}","${f.reason}"`
                ),
            ].join("\n");
            const blob = new Blob(["\uFEFF" + csv], {
                type: "text/csv;charset=utf-8;",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `班级导入失败记录_${dateStr}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    const formatHint = `第一行为表头，系统将自动识别列含义。支持中英文表头，列顺序不限。

支持的列名示例：
  学号/一卡通号：一卡通号, 学号, username, student_id
  姓名：姓名, 名字, name, 昵称
  密码（可选）：密码, password
  邮箱自动推导为「一卡通号@seu.edu.cn」`;

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
                        {/* Password mode */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">密码模式</label>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-1.5 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="classPwdMode"
                                        value="random"
                                        checked={passwordMode === "random"}
                                        onChange={() => setPasswordMode("random")}
                                        className="accent-primary"
                                    />
                                    <span className="text-sm">随机生成</span>
                                </label>
                                <label className="flex items-center gap-1.5 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="classPwdMode"
                                        value="assigned"
                                        checked={passwordMode === "assigned"}
                                        onChange={() => setPasswordMode("assigned")}
                                        className="accent-primary"
                                    />
                                    <span className="text-sm">指定密码</span>
                                </label>
                            </div>
                        </div>

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
                        passwordMode={passwordMode}
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
                            {passwordMode === "random" && "（密码将随机生成）"}
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
                                        {passwordMode === "assigned" && (
                                            <TableHead>密码</TableHead>
                                        )}
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
                                            {passwordMode === "assigned" && (
                                                <TableCell className="font-mono text-xs">
                                                    {"•".repeat(
                                                        Math.min(row.password?.length || 0, 12)
                                                    )}
                                                </TableCell>
                                            )}
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
                            {importResult.fail_count > 0 && (
                                <div className="flex items-center gap-2 text-red-600">
                                    <AlertCircle className="h-5 w-5" />
                                    <span>失败 {importResult.fail_count} 个</span>
                                </div>
                            )}
                        </div>

                        {/* Success download */}
                        {importResult.successes.length > 0 && (
                            <div className="rounded-lg border bg-green-50 dark:bg-green-950/20 p-4 space-y-3">
                                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                                    成功导入的账号信息（含密码）仅在此处展示，请及时下载保存。
                                </p>
                                <div className="border rounded-lg max-h-[200px] overflow-auto bg-white dark:bg-background">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[50px]">序号</TableHead>
                                                <TableHead>一卡通号</TableHead>
                                                <TableHead>姓名</TableHead>
                                                <TableHead>邮箱</TableHead>
                                                <TableHead>密码</TableHead>
                                                <TableHead>备注</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {importResult.successes.map((s, i) => (
                                                <TableRow key={i}>
                                                    <TableCell>{s.row}</TableCell>
                                                    <TableCell className="font-mono">
                                                        {s.student_id}
                                                    </TableCell>
                                                    <TableCell>{s.name}</TableCell>
                                                    <TableCell>{s.email}</TableCell>
                                                    <TableCell className="font-mono text-xs">
                                                        {s.password}
                                                    </TableCell>
                                                    <TableCell className="text-xs text-muted-foreground">
                                                        {s.existing_account
                                                            ? "已有账号(直接加入班级)"
                                                            : "新创建"}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                <Button
                                    size="sm"
                                    onClick={downloadSuccessReport}
                                >
                                    <Download className="h-4 w-4 mr-1" />
                                    下载成功账号表
                                </Button>
                            </div>
                        )}

                        {/* Failure details */}
                        {importResult.failures.length > 0 && (
                            <>
                                <div className="border rounded-lg max-h-[200px] overflow-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[60px]">行号</TableHead>
                                                <TableHead>一卡通号</TableHead>
                                                <TableHead>姓名</TableHead>
                                                <TableHead>失败原因</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {importResult.failures.map((f, i) => (
                                                <TableRow key={i}>
                                                    <TableCell>{f.row}</TableCell>
                                                    <TableCell className="font-mono">
                                                        {f.student_id}
                                                    </TableCell>
                                                    <TableCell>{f.name}</TableCell>
                                                    <TableCell className="text-red-600">
                                                        {f.reason}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={downloadFailureReport}
                                >
                                    <Download className="h-4 w-4 mr-1" />
                                    下载失败记录
                                </Button>
                            </>
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
