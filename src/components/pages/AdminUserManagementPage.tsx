import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    getUserPage,
    type UserPageRecord,
    type CommonUserRole,
} from "@/services/user/getUserPage";
import {
    batchImportUsers,
    type BatchImportUserRow,
    type BatchImportResult,
} from "@/services/user/batchImportUsers";
import type { SuccessDetail, SkipDetail, FailDetail } from "@/services/user/batchImportUsers";
import {
    Upload,
    Download,
    Search,
    ChevronLeft,
    ChevronRight,
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
    findHeaderRow,
    type ColumnMapping,
} from "@/lib/columnDetection";

type PasswordMode = "assigned" | "random";
type FileType = "csv" | "xlsx" | null;
type ImportStep = "config" | "mapping" | "preview" | "result";

export default function AdminUserManagementPage() {
    // User list state
    const [users, setUsers] = useState<UserPageRecord[]>([]);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [searchUsername, setSearchUsername] = useState("");
    const [searchEmail, setSearchEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);

    // Batch import state
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [importStep, setImportStep] = useState<ImportStep>("config");
    const [previewData, setPreviewData] = useState<BatchImportUserRow[]>([]);
    const [importResult, setImportResult] = useState<BatchImportResult | null>(null);
    const [importing, setImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [passwordMode, setPasswordMode] = useState<PasswordMode>("assigned");
    const [sendEmail, setSendEmail] = useState(false);
    const [selectedFileType, setSelectedFileType] = useState<FileType>(null);
    const [uploadedFileType, setUploadedFileType] = useState<FileType>(null);
    const [rawHeaders, setRawHeaders] = useState<string[]>([]);
    const [rawDataRows, setRawDataRows] = useState<string[][]>([]);
    const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);

    // Fetch user list
    const fetchUsers = useCallback(
        async (page?: number) => {
            setLoading(true);
            try {
                const res = await getUserPage({
                    current: page ?? currentPage,
                    size: pageSize,
                    username: searchUsername || undefined,
                    email: searchEmail || undefined,
                });
                if (res.code === 0) {
                    setUsers(res.data.records);
                    setTotal(res.data.total);
                    setLoaded(true);
                }
            } catch (err: unknown) {
                toast.error(
                    "获取用户列表失败: " +
                    (err instanceof Error ? err.message : String(err))
                );
            } finally {
                setLoading(false);
            }
        },
        [currentPage, pageSize, searchUsername, searchEmail]
    );

    const handleSearch = () => {
        setCurrentPage(1);
        fetchUsers(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        fetchUsers(page);
    };

    const resetImportDialog = () => {
        setImportStep("config");
        setPreviewData([]);
        setImportResult(null);
        setPasswordMode("assigned");
        setSendEmail(false);
        setSelectedFileType(null);
        setUploadedFileType(null);
        setRawHeaders([]);
        setRawDataRows([]);
        setColumnMappings([]);
    };

    const openImportDialog = () => {
        resetImportDialog();
        setImportDialogOpen(true);
    };

    const parseAllRows = (allRows: string[][]) => {
        if (allRows.length < 2)
            throw new Error("文件至少需要包含表头和一行数据");

        const { headerRowIndex, mappings } = findHeaderRow(allRows);
        const cleanedHeaders = allRows[headerRowIndex].map((h) =>
            String(h ?? "")
                .replace(/^﻿/, "")
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
            throw new Error("单次最多导入500个用户");

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

    const parseXLSX = (data: ArrayBuffer) => {
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
    ): BatchImportUserRow[] => {
        const fieldToIndex = new Map<string, number>();
        for (const m of mappings) {
            if (m.mappedField !== "ignore") {
                fieldToIndex.set(m.mappedField, m.columnIndex);
            }
        }
        const usernameIdx = fieldToIndex.get("username");
        const nicknameIdx = fieldToIndex.get("nickname");
        const emailIdx = fieldToIndex.get("email");
        const passwordIdx = fieldToIndex.get("password");

        if (usernameIdx === undefined)
            throw new Error("未映射用户名/学号列");

        const rows: BatchImportUserRow[] = [];
        for (const cols of dataRows) {
            const username = (cols[usernameIdx] || "").trim();
            if (!username) continue;

            let email =
                emailIdx !== undefined
                    ? (cols[emailIdx] || "").trim()
                    : "";
            if (!email) {
                email = `${username.toLowerCase()}@${emailSuffix}`;
            }

            const nickname =
                nicknameIdx !== undefined
                    ? (cols[nicknameIdx] || "").trim()
                    : "";
            const password =
                passwordIdx !== undefined
                    ? (cols[passwordIdx] || "").trim()
                    : "";

            if (passwordMode === "assigned" && !password) {
                throw new Error(
                    `指定密码模式下，用户「${username}」的密码不能为空`
                );
            }

            rows.push({
                username,
                nickname: nickname || undefined,
                email,
                password:
                    passwordMode === "assigned" ? password : undefined,
            });
        }

        if (rows.length === 0) throw new Error("文件中没有有效的数据行");
        return rows;
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const isCSV = file.name.endsWith(".csv");
        const isXLSX = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");

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
            const res = await batchImportUsers({
                passwordMode,
                sendEmail,
                users: previewData,
            });
            if (res.code === 0) {
                setImportResult(res.data);
                setImportStep("result");
                toast.success(
                    `导入完成：成功 ${res.data.successCount} 个，跳过 ${res.data.skippedCount} 个，失败 ${res.data.failCount} 个`
                );
                if (loaded) fetchUsers();
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

    const downloadAllReport = () => {
        if (!importResult) return;
        const dateStr = new Date().toISOString().slice(0, 10);

        const allRows: (string | number)[][] = [
            ["行号", "用户名", "邮箱", "密码", "状态", "原因"],
            ...importResult.successes.map((s: SuccessDetail) => [
                s.row, s.username, s.email, s.password, "成功", ""
            ]),
            ...importResult.skipped.map((s: SkipDetail) => [
                s.row, s.username, s.email, "", "跳过", s.reason
            ]),
            ...importResult.failures.map((f: FailDetail) => [
                f.row, f.username, f.email, "", "失败", f.reason
            ]),
        ].sort((a, b) => (a[0] as number) - (b[0] as number));

        if (uploadedFileType === "xlsx") {
            const ws = XLSX.utils.aoa_to_sheet(allRows);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "导入结果");
            XLSX.writeFile(wb, `批量导入结果_${dateStr}.xlsx`);
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
            a.download = `批量导入结果_${dateStr}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    const totalPages = Math.ceil(total / pageSize);

    const roleColors: Record<CommonUserRole, string> = {
        STUDENT: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
        TEACHER: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
        ADMIN: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
        SUPER_ADMIN: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    };

    const formatHint = `系统将自动识别表头行位置及列含义（即使表头前有标题行也能识别）。
支持中英文表头，列顺序不限，列名可使用下列任一写法。

支持的列名示例（可选其一）：
  用户名/学号：用户名, 学号, 学工号, username, student_id, student id, account id
  昵称/姓名：昵称, 姓名, 名字, name, full name, nickname, 真实姓名
  邮箱（可选）：邮箱, 电子邮箱, email, e-mail（未提供将自动推导）
  密码（可选）：密码, 初始密码, password, pwd`;

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">用户管理</h1>
                <div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        className="hidden"
                        onChange={handleFileSelect}
                    />
                    <Button size="sm" onClick={openImportDialog}>
                        <Upload className="h-4 w-4 mr-1" />
                        批量导入
                    </Button>
                </div>
            </div>

            {/* Search bar */}
            <div className="flex gap-2 mb-4">
                <Input
                    placeholder="搜索用户名"
                    value={searchUsername}
                    onChange={(e) => setSearchUsername(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="max-w-xs"
                />
                <Input
                    placeholder="搜索邮箱"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="max-w-xs"
                />
                <Button onClick={handleSearch} disabled={loading}>
                    <Search className="h-4 w-4 mr-1" />
                    搜索
                </Button>
            </div>

            {/* User table */}
            {!loaded ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                    <Search className="h-12 w-12 mb-4 opacity-50" />
                    <p className="text-lg">点击搜索按钮加载用户列表</p>
                </div>
            ) : loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[160px]">用户名</TableHead>
                                    <TableHead className="w-[120px]">昵称</TableHead>
                                    <TableHead className="w-[280px]">邮箱</TableHead>
                                    <TableHead>角色</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            className="text-center py-8 text-muted-foreground"
                                        >
                                            暂无数据
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((user) => (
                                        <TableRow key={user.user_id}>
                                            <TableCell className="font-medium">
                                                {user.username}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{user.nickname || "-"}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-1 flex-wrap">
                                                    {user.roles.map((role) => (
                                                        <Badge
                                                            key={role}
                                                            variant="secondary"
                                                            className={roleColors[role] || ""}
                                                        >
                                                            {role}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4">
                            <p className="text-sm text-muted-foreground">
                                共 {total} 条记录，第 {currentPage}/{totalPages} 页
                            </p>
                            <div className="flex gap-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage <= 1}
                                    onClick={() => handlePageChange(currentPage - 1)}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                    let page: number;
                                    if (totalPages <= 7) {
                                        page = i + 1;
                                    } else if (currentPage <= 4) {
                                        page = i + 1;
                                    } else if (currentPage >= totalPages - 3) {
                                        page = totalPages - 6 + i;
                                    } else {
                                        page = currentPage - 3 + i;
                                    }
                                    return (
                                        <Button
                                            key={page}
                                            variant={page === currentPage ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handlePageChange(page)}
                                        >
                                            {page}
                                        </Button>
                                    );
                                })}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage >= totalPages}
                                    onClick={() => handlePageChange(currentPage + 1)}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Batch Import Dialog - 3-step flow */}
            <Dialog
                open={importDialogOpen}
                onOpenChange={(open) => {
                    if (!open && !importing) {
                        setImportDialogOpen(false);
                    }
                }}
            >
                <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>
                            批量导入用户
                            {importStep === "config" && " — 导入设置"}
                            {importStep === "mapping" && " — 列映射确认"}
                            {importStep === "preview" && " — 数据预览"}
                            {importStep === "result" && " — 导入结果"}
                        </DialogTitle>
                        <DialogDescription>
                            {importStep === "config" &&
                                "上传包含用户信息的文件，系统将自动识别列含义。支持中英文表头。"}
                            {importStep === "mapping" &&
                                "系统已自动识别列含义，请确认或调整映射关系。"}
                            {importStep === "preview" &&
                                "预览解析的数据，确认无误后执行导入。"}
                            {importStep === "result" &&
                                "导入完成，查看结果详情。"}
                        </DialogDescription>
                    </DialogHeader>

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
                                            name="dlgPasswordMode"
                                            value="assigned"
                                            checked={passwordMode === "assigned"}
                                            onChange={() => setPasswordMode("assigned")}
                                            className="accent-primary"
                                        />
                                        <span className="text-sm">指定密码</span>
                                    </label>
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="dlgPasswordMode"
                                            value="random"
                                            checked={passwordMode === "random"}
                                            onChange={() => setPasswordMode("random")}
                                            className="accent-primary"
                                        />
                                        <span className="text-sm">随机生成</span>
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
                                    <span className="text-sm">导入成功后发送邮件通知用户</span>
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

                            {/* Format requirements - shown after file type selection */}
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
                                            选择{selectedFileType === "csv" ? " CSV " : " Excel "}文件上传
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
                                            <TableHead>用户名</TableHead>
                                            <TableHead>昵称</TableHead>
                                            <TableHead>邮箱</TableHead>
                                            {passwordMode === "assigned" && (
                                                <TableHead>密码</TableHead>
                                            )}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {previewData.map((row, i) => (
                                            <TableRow key={i}>
                                                <TableCell>{i + 1}</TableCell>
                                                <TableCell>{row.username}</TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {row.nickname || "-"}
                                                </TableCell>
                                                <TableCell>{row.email}</TableCell>
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
                                    <span>成功 {importResult.successCount} 个</span>
                                </div>
                                {importResult.skippedCount > 0 && (
                                    <div className="flex items-center gap-2 text-yellow-600">
                                        <AlertCircle className="h-5 w-5" />
                                        <span>跳过 {importResult.skippedCount} 个</span>
                                    </div>
                                )}
                                {importResult.failCount > 0 && (
                                    <div className="flex items-center gap-2 text-red-600">
                                        <AlertCircle className="h-5 w-5" />
                                        <span>失败 {importResult.failCount} 个</span>
                                    </div>
                                )}
                            </div>

                            {importResult.skipped.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-yellow-700">跳过的记录</p>
                                    <div className="border rounded-lg max-h-[200px] overflow-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[60px]">行号</TableHead>
                                                    <TableHead>用户名</TableHead>
                                                    <TableHead>邮箱</TableHead>
                                                    <TableHead>跳过原因</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {importResult.skipped.map((s, i) => (
                                                    <TableRow key={i}>
                                                        <TableCell>{s.row}</TableCell>
                                                        <TableCell>{s.username}</TableCell>
                                                        <TableCell>{s.email}</TableCell>
                                                        <TableCell className="text-yellow-600">
                                                            {s.reason}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            )}

                            {importResult.failures.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-red-700">失败的记录</p>
                                    <div className="border rounded-lg max-h-[200px] overflow-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[60px]">行号</TableHead>
                                                    <TableHead>用户名</TableHead>
                                                    <TableHead>邮箱</TableHead>
                                                    <TableHead>失败原因</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {importResult.failures.map((f, i) => (
                                                    <TableRow key={i}>
                                                        <TableCell>{f.row}</TableCell>
                                                        <TableCell>{f.username}</TableCell>
                                                        <TableCell>{f.email}</TableCell>
                                                        <TableCell className="text-red-600">
                                                            {f.reason}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            )}

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={downloadAllReport}
                            >
                                <Download className="h-4 w-4 mr-1" />
                                下载全部记录
                            </Button>
                        </div>
                    )}

                    <DialogFooter>
                        {importStep === "config" && (
                            <Button
                                variant="outline"
                                onClick={() => setImportDialogOpen(false)}
                            >
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
                                        `确认导入 ${previewData.length} 个用户`
                                    )}
                                </Button>
                            </>
                        )}
                        {importStep === "result" && (
                            <Button onClick={() => setImportDialogOpen(false)}>
                                关闭
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
