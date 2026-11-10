import { useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Check, Download, Loader2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { getContestDetail } from "@/services/Contest/getContestDetail";
import { getContestMembers, saveContestParticipants } from "@/services/Contest/members";
import { downloadMemberSheet, guessColumns, parseMappedRows, readMemberText, rosterColumns, type ColumnMap, type RosterField } from "@/lib/contestMemberImport";

export default function ContestMemberImportPage() {
  const id = Number(useParams().id), nav = useNavigate(), client = useQueryClient();
  const [rows, setRows] = useState<string[][]>([]), [mapping, setMapping] = useState<ColumnMap>([]);
  const [header, setHeader] = useState(true), [text, setText] = useState(""), [busy, setBusy] = useState(false);
  const [fileName, setFileName] = useState(""); const fileInput = useRef<HTMLInputElement>(null);
  const detail = useQuery({ queryKey: ["contestDetail", id], queryFn: () => getContestDetail(id) });
  const members = useQuery({ queryKey: ["contestMembers", id], queryFn: () => getContestMembers(id), enabled: !!detail.data?.can_write });
  const preview = useMemo(() => parseMappedRows(rows, mapping, header), [rows, mapping, header]);
  const matches = preview.participants.map(p => {
    const existing = members.data?.participants ?? [];
    const account = p.username ? existing.find(e => e.username?.toLowerCase() === p.username!.toLowerCase()) : undefined;
    const student = p.student_no ? existing.find(e => e.student_no?.toLowerCase() === p.student_no!.toLowerCase()) : undefined;
    const target = account || student;
    const conflict = account && student && account.id !== student.id ? "账号与学号不属于同一人"
      : target?.username && p.username && target.username.toLowerCase() !== p.username.toLowerCase() ? "该选手已有其他账号"
      : !target && !p.username && !p.student_no && existing.some(e => e.display_name === p.display_name) ? "已有同名选手，请填写学号" : "";
    return { target, conflict };
  });
  const errors = preview.cellErrors.length + preview.errors.length + matches.filter(m => m.conflict).length;
  function loadRows(raw: unknown[][], name: string) {
    const cells = raw.filter(row => row.some(v => String(v ?? "").trim())).map(row => row.map(v => String(v ?? "")));
    if (cells.length > 1001 || cells.some(r => r.length > 30)) throw new Error("最多 1000 人、30 列");
    const width = Math.max(0, ...cells.map(r => r.length));
    const first = Array.from({ length: width }, (_, i) => cells[0]?.[i] ?? "");
    const guessed = guessColumns(first), hasHeader = guessed.includes("display_name");
    setRows(cells); setMapping(hasHeader ? guessed : first.map((_, i) => rosterColumns[i]?.[0] ?? "")); setHeader(hasHeader); setFileName(name);
  }
  async function loadFile(file?: File) {
    if (!file) return; if (file.size > 5 * 1024 * 1024) { toast.error("文件不能超过 5 MiB"); return; }
    setBusy(true);
    try {
      if (/\.csv$/i.test(file.name)) loadRows(readMemberText(await file.text()), file.name);
      else { const XLSX = await import("xlsx"); const book = XLSX.read(await file.arrayBuffer()); loadRows(XLSX.utils.sheet_to_json(book.Sheets[book.SheetNames[0]], { header: 1, raw: false, defval: "" }), file.name); }
    } catch (e) { toast.error(e instanceof Error ? e.message : "无法读取表格"); } finally { setBusy(false); }
  }
  async function submit() {
    setBusy(true);
    try { await saveContestParticipants(id, preview.participants); await client.invalidateQueries({ queryKey: ["contestMembers", id] }); await client.invalidateQueries({ queryKey: ["contestStandings", id] }); toast.success(`已导入 ${preview.participants.length} 人`); nav(`/contest/${id}/members`); }
    catch (e) { toast.error(e instanceof Error ? e.message : "导入失败"); } finally { setBusy(false); }
  }
  if (detail.isLoading || members.isLoading) return <div className="p-12"><Loader2 className="animate-spin" /></div>;
  if (detail.isError || members.isError) return <p role="alert" className="p-8">加载失败，请刷新重试。</p>;
  if (!detail.data?.can_write) return <p className="p-8">你没有本场比赛的管理权限。</p>;
  return <main className="w-full max-w-6xl min-h-[calc(100vh-5.5rem)] mx-auto px-4 py-8 space-y-6">
    <div className="flex items-center gap-3"><Button size="icon" variant="ghost" aria-label="返回成员名单" disabled={busy} onClick={() => nav(`/contest/${id}/members`)}><ArrowLeft className="size-5" /></Button><div><h1 className="text-2xl font-bold">导入参赛名单</h1><p className="text-sm text-muted-foreground">{detail.data.title}</p></div></div>
    <div className="flex items-center gap-3 text-sm"><span className={`flex items-center gap-2 ${rows.length ? "text-muted-foreground" : "font-medium"}`}><span className="flex size-6 items-center justify-center rounded-full border">{rows.length ? <Check className="size-3.5" /> : "1"}</span>上传名单</span><ArrowRight className="size-4 text-muted-foreground" /><span className={`flex items-center gap-2 ${rows.length ? "font-medium" : "text-muted-foreground"}`}><span className="flex size-6 items-center justify-center rounded-full border">2</span>核对信息</span></div>
    {!rows.length ? <div className="max-w-3xl space-y-6">
      <input ref={fileInput} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={e => { void loadFile(e.target.files?.[0]); e.target.value = ""; }} />
      <button disabled={busy} className="w-full border-2 border-dashed rounded-lg py-10 flex flex-col items-center gap-3 hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring" onClick={() => fileInput.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (!busy) void loadFile(e.dataTransfer.files[0]); }}>
        {busy ? <Loader2 className="size-8 animate-spin" /> : <UploadCloud className="size-8 text-muted-foreground" />}<span className="font-medium">拖入表格，或点击上传</span><span className="text-sm text-muted-foreground">XLSX / CSV · 最多 1000 人 · 5 MiB</span>
      </button>
      <div className="flex flex-wrap justify-between gap-3 text-sm"><span className="text-muted-foreground">姓名必填，其余列可留空</span><Button variant="link" className="h-auto p-0" onClick={() => void downloadMemberSheet("参赛名单模板.xlsx", [rosterColumns.map(c => c[1]), ["张三", "09025001", "计算机学院", "计算机拔尖班", "", "否", "", ""]])}><Download className="size-4 mr-2" />下载模板</Button></div>
      <div className="space-y-3"><label htmlFor="roster-paste" className="text-sm font-medium">或从 Excel 粘贴</label><Textarea id="roster-paste" rows={7} value={text} disabled={busy} onChange={e => setText(e.target.value)} placeholder={"姓名\t学号\t学院\t班级\t邮箱\t打星\t备注\t已有账号\n张三\t09025001\t计算机学院\t计算机拔尖班\t\t否"} /><Button disabled={busy || !text.trim()} onClick={() => { try { loadRows(readMemberText(text), "粘贴的名单"); } catch (e) { toast.error((e as Error).message); } }}>核对信息<ArrowRight className="ml-2 size-4" /></Button></div>
    </div> : <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><span className="text-sm font-medium">{fileName}</span><Button variant="ghost" size="sm" disabled={busy} onClick={() => setRows([])}>重新上传</Button></div><label className="flex items-center gap-2 text-sm"><Checkbox checked={header} disabled={busy} onCheckedChange={v => setHeader(v === true)} />第一行为表头</label></div>
      <div className="text-sm flex gap-5"><span>{preview.participants.length} 人</span><span className="text-muted-foreground">新增 {matches.filter(m => !m.target).length}</span><span className="text-muted-foreground">更新 {matches.filter(m => m.target).length}</span>{errors > 0 && <span role="alert" className="text-destructive">{errors} 处待修正</span>}</div>
      {preview.errors.map(e => <p role="alert" className="text-sm text-destructive" key={e}>{e}</p>)}
      <div className="border rounded-md overflow-auto max-h-[55vh]"><table className="w-full text-sm"><thead className="sticky top-0 z-10 bg-background border-b"><tr><th className="p-3 text-muted-foreground font-normal">行</th>{mapping.map((field, col) => <th key={col} className="p-2 min-w-36"><select aria-label={`第 ${col + 1} 列对应字段`} value={field} disabled={busy} onChange={e => setMapping(mapping.map((v, i) => i === col ? e.target.value as RosterField | "" : v))} className="w-full rounded-md border bg-background p-2 text-sm font-normal"><option value="">忽略此列</option>{rosterColumns.map(([key, label]) => <option key={key} value={key}>{label}{key === "display_name" ? " *" : ""}</option>)}</select></th>)}<th className="p-3 font-normal min-w-24">操作</th></tr></thead><tbody>
        {preview.rowIndexes.map((row, i) => <tr className="border-b last:border-0" key={row}><td className="px-3 text-muted-foreground">{row + 1}</td>{mapping.map((field, col) => { const error = preview.cellErrors.find(e => e.row === row && e.field === field); return <td key={col} className={`p-1 ${error ? "bg-destructive/5" : ""}`}><input aria-label={`第 ${row + 1} 行${field ? rosterColumns.find(c => c[0] === field)?.[1] : "忽略列"}`} value={rows[row]?.[col] ?? ""} disabled={busy || !field} className={`w-full min-w-32 rounded px-2 py-2 bg-transparent focus:outline-none focus:ring-1 focus:ring-ring ${error ? "text-destructive" : ""}`} onChange={e => setRows(rows.map((r, n) => n === row ? Array.from({ length: mapping.length }, (_, c) => c === col ? e.target.value : r[c] ?? "") : r))} />{error && <span className="block px-2 pb-1 text-xs text-destructive">{error.message}</span>}</td>; })}<td className={`p-3 text-xs ${matches[i]?.conflict ? "text-destructive" : "text-muted-foreground"}`}>{matches[i]?.conflict || (matches[i]?.target ? "更新" : "新增")}</td></tr>)}
      </tbody></table></div>
      <div className="flex flex-wrap justify-between items-center gap-3"><p className="text-xs text-muted-foreground">按学号或已有账号匹配；空白可选项保留原值。</p><Button disabled={busy || errors > 0 || !preview.participants.length} onClick={() => void submit()}>{busy && <Loader2 className="size-4 mr-2 animate-spin" />}导入 {preview.participants.length} 人</Button></div>
    </div>}
  </main>;
}
