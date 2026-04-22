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

type PasswordMode = "assigned" | "random";
type FileType = "csv" | "xlsx" | null;
type ImportStep = "config" | "preview" | "result";

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
    const [sendEmail, setSendEmail] = useState(true);
    const [selectedFileType, setSelectedFileType] = useState<FileType>(null);
    const [uploadedFileType, setUploadedFileType] = useState<FileType>(null);

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
        setSendEmail(true);
        setSelectedFileType(null);
        setUploadedFileType(null);
    };

    const openImportDialog = () => {
        resetImportDialog();
        setImportDialogOpen(true);
    };

    // Parse rows from header + data lines (shared by CSV and XLSX)
    const parseRows = (
        headers: string[],
        dataRows: string[][]
    ): BatchImportUserRow[] => {
        const lowerHeaders = headers.map((h) => h.trim().toLowerCase());
        const usernameIdx = lowerHeaders.indexOf("username");
        const emailIdx = lowerHeaders.indexOf("email");
        const passwordIdx = lowerHeaders.indexOf("password");

        if (usernameIdx === -1 || emailIdx === -1) {
            throw new Error("表头必须包含 username 和 email 列");
        }

        if (passwordMode === "assigned" && passwordIdx === -1) {
            throw new Error("指定密码模式下，表头必须包含 password 列");
        }

        const rows: BatchImportUserRow[] = [];
        for (const cols of dataRows) {
            const username = (cols[usernameIdx] || "").trim();
            const email = (cols[emailIdx] || "").trim();
            const password =
                passwordIdx >= 0 ? (cols[passwordIdx] || "").trim() : "";

            if (!username || !email) continue;

            if (passwordMode === "assigned") {
                if (!password) {
                    throw new Error(
                        `指定密码模式下，用户 "${username}" 的密码不能为空`
                    );
                }
                rows.push({ username, email, password });
            } else {
                if (password) {
                    throw new Error(
                        `随机密码模式下，用户 "${username}" 不应填写密码`
                    );
                }
                rows.push({ username, email });
            }
        }

        if (rows.length === 0) {
            throw new Error("文件中没有有效的数据行");
        }
        if (rows.length > 500) {
            throw new Error("单次最多导入500个用户");
        }

        return rows;
    };

    const parseCSV = (text: string): BatchImportUserRow[] => {
        const lines = text
            .split(/\r?\n/)
            .map((l) => l.trim())
            .filter((l) => l.length > 0);
        if (lines.length < 2) {
            throw new Error("文件至少需要包含表头和一行数据");
        }
        const headers = lines[0].split(",");
        const dataRows = lines.slice(1).map((l) => l.split(","));
        return parseRows(headers, dataRows);
    };

    const parseXLSX = (data: ArrayBuffer): BatchImportUserRow[] => {
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
        return parseRows(headers, dataRows);
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
                    const text = event.target?.result as string;
                    const rows = parseCSV(text);
                    setPreviewData(rows);
                    setImportResult(null);
                    setImportStep("preview");
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
                    const data = event.target?.result as ArrayBuffer;
                    const rows = parseXLSX(data);
                    setPreviewData(rows);
                    setImportResult(null);
                    setImportStep("preview");
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
                    `导入完成：成功 ${res.data.successCount} 个，失败 ${res.data.failCount} 个`
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

    const downloadFailureReport = () => {
        if (!importResult || importResult.failures.length === 0) return;
        const dateStr = new Date().toISOString().slice(0, 10);

        if (uploadedFileType === "xlsx") {
            const wsData = [
                ["行号", "用户名", "邮箱", "失败原因"],
                ...importResult.failures.map((f) => [f.row, f.username, f.email, f.reason]),
            ];
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "失败记录");
            XLSX.writeFile(wb, `导入失败记录_${dateStr}.xlsx`);
        } else {
            const csv = [
                "行号,用户名,邮箱,失败原因",
                ...importResult.failures.map(
                    (f) => `${f.row},"${f.username}","${f.email}","${f.reason}"`
                ),
            ].join("\n");
            const blob = new Blob(["\uFEFF" + csv], {
                type: "text/csv;charset=utf-8;",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `导入失败记录_${dateStr}.csv`;
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

    const formatHintCSV =
        passwordMode === "assigned"
            ? `第一行为表头，必须包含 username, email, password 三列（顺序不限）。
每行一个用户，使用英文逗号分隔。示例：

username,email,password
zhangsan,zhangsan@example.com,MyPass123
lisi,lisi@example.com,LiSi456`
            : `第一行为表头，必须包含 username, email 两列（顺序不限），不要包含 password 列。
每行一个用户，使用英文逗号分隔。示例：

username,email
zhangsan,zhangsan@example.com
lisi,lisi@example.com`;

    const formatHintXLSX =
        passwordMode === "assigned"
            ? `第一行为表头，必须包含 username, email, password 三列（顺序不限）。
从第二行开始每行一个用户。示例：

| username | email                  | password   |
|----------|------------------------|------------|
| zhangsan | zhangsan@example.com   | MyPass123  |
| lisi     | lisi@example.com       | LiSi456    |`
            : `第一行为表头，必须包含 username, email 两列（顺序不限），不要包含 password 列。
从第二行开始每行一个用户。示例：

| username | email                  |
|----------|------------------------|
| zhangsan | zhangsan@example.com   |
| lisi     | lisi@example.com       |`;

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
                                    <TableHead className="w-[200px]">用户名</TableHead>
                                    <TableHead className="w-[300px]">邮箱</TableHead>
                                    <TableHead>角色</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={3}
                                            className="text-center py-8 text-muted-foreground"
                                        >
                                            暂无数据
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((user) => (
                                        <TableRow key={user.user_public_id}>
                                            <TableCell className="font-medium">
                                                {user.username}
                                            </TableCell>
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
                            {importStep === "preview" && " — 数据预览"}
                            {importStep === "result" && " — 导入结果"}
                        </DialogTitle>
                        <DialogDescription>
                            {importStep === "config" &&
                                "配置导入选项，选择文件类型并上传用户数据文件。"}
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
                                        <span>
                                            {selectedFileType === "csv"
                                                ? "CSV 文件格式要求"
                                                : "Excel 文件格式要求"}
                                        </span>
                                    </div>
                                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">
                                        {selectedFileType === "csv"
                                            ? formatHintCSV
                                            : formatHintXLSX}
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

                    {/* Step 2: Preview */}
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
                                {importResult.failCount > 0 && (
                                    <div className="flex items-center gap-2 text-red-600">
                                        <AlertCircle className="h-5 w-5" />
                                        <span>失败 {importResult.failCount} 个</span>
                                    </div>
                                )}
                            </div>

                            {importResult.failures.length > 0 && (
                                <>
                                    <div className="border rounded-lg max-h-[300px] overflow-auto">
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
                                        setImportStep("config");
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
