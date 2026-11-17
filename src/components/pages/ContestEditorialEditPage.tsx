import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { FileText, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MarkdownImageTextarea } from "@/components/common/MarkdownImageTextarea";
import ContestShell from "@/components/contest/ContestShell";
import { parseTime } from "@/components/contest/contestKit";
import { fileSize } from "@/components/contest/editorialKit";
import useQueryToGetContestDetail from "@/hooks/useQueryToGetContestDetail";
import { deleteContestEditorial, getContestDiscussion, saveContestEditorial } from "@/services/Contest/discussion";
import { uploadFile } from "@/services/file/uploadFile";

const MAX_PDF_BYTES = 20 * 1024 * 1024;
const MAX_ATTACHMENTS = 5;

/** 附件：已保存的带 id；刚上传、还没保存的带 file_path */
interface DraftAttachment {
  id?: number;
  file_path?: string;
  file_name: string;
  file_size: number;
}

export default function ContestEditorialEditPage() {
  const { id } = useParams();
  const contestId = Number(id);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: detail } = useQueryToGetContestDetail(contestId);
  const { data, error, isLoading } = useQuery({
    queryKey: ["contestDiscussion", contestId],
    queryFn: () => getContestDiscussion(contestId),
    enabled: !!contestId,
    retry: false,
  });

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<DraftAttachment[]>([]);
  const [customTime, setCustomTime] = useState(false);
  const [visibleAfter, setVisibleAfter] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement | null>(null);
  const loaded = useRef(false);

  const editorial = data?.editorial ?? null;

  // 只在第一次拿到数据时填表，之后的重新请求不覆盖正在编辑的内容
  useEffect(() => {
    if (!data || loaded.current) return;
    loaded.current = true;
    if (editorial) {
      setTitle(editorial.title);
      setContent(editorial.content);
      setAttachments(editorial.attachments.map((a) => ({ ...a })));
      const after = parseTime(editorial.visible_after ?? undefined);
      setCustomTime(!!after);
      setVisibleAfter(after ? format(after, "yyyy-MM-dd'T'HH:mm") : "");
    } else {
      setTitle(detail?.title ? `${detail.title} 题解` : "题解");
    }
  }, [data, editorial, detail?.title]);

  const upload = async (files: FileList | null) => {
    const file = files?.[0];
    if (fileInput.current) fileInput.current.value = "";
    if (!file) return;
    if (!/\.pdf$/i.test(file.name)) {
      toast.error("只能上传 PDF");
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      toast.error("PDF 不能超过 20 MB");
      return;
    }
    setUploading(true);
    try {
      const res = await uploadFile(file);
      if (res.code !== 0) throw new Error(res.message || "上传失败");
      setAttachments((list) => [...list, { file_path: res.data.path, file_name: file.name, file_size: res.data.size }]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "上传失败");
    } finally {
      setUploading(false);
    }
  };

  const save = async (status: "DRAFT" | "PUBLISHED") => {
    if (!title.trim()) {
      toast.error("标题不能为空");
      return;
    }
    if (customTime && !visibleAfter) {
      toast.error("请选择公开时间");
      return;
    }
    setBusy(true);
    try {
      await saveContestEditorial(contestId, {
        title: title.trim(),
        content,
        status,
        visible_after: customTime && visibleAfter ? `${visibleAfter}:00` : null,
        attachments: attachments.map((a) =>
          a.id ? { id: a.id } : { file_path: a.file_path, file_name: a.file_name }
        ),
      });
      toast.success(status === "DRAFT" ? "草稿已保存" : "已发布");
      await qc.invalidateQueries({ queryKey: ["contestDiscussion", contestId] });
      navigate(`/contest/${contestId}/discussion`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "保存失败");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm("删除本场的官方题解？附件一起删除。")) return;
    setBusy(true);
    try {
      await deleteContestEditorial(contestId);
      toast.success("已删除");
      await qc.invalidateQueries({ queryKey: ["contestDiscussion", contestId] });
      navigate(`/contest/${contestId}/discussion`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "删除失败");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ContestShell contestId={contestId} tab="discussion">
      <Helmet>
        <title>{detail?.title ? `编辑官方题解 - ${detail.title} - SEUOJ` : "编辑官方题解 - SEUOJ"}</title>
      </Helmet>
      {isLoading ? (
        <div className="flex items-center gap-2 py-16 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" /> 加载中
        </div>
      ) : error || !data ? (
        <div className="py-16 text-sm text-slate-500">{error instanceof Error ? error.message : "加载失败"}</div>
      ) : !data.can_manage ? (
        <div className="py-16 text-sm text-slate-500">只有比赛管理者能编辑官方题解。</div>
      ) : (
        <form
          className="max-w-4xl space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            save("PUBLISHED");
          }}
        >
          <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
            <span className="text-[13px] font-bold tracking-wide">{editorial ? "编辑官方题解" : "写官方题解"}</span>
            <Link to={`/contest/${contestId}/discussion`} className="text-xs text-slate-500 hover:text-slate-900">
              返回
            </Link>
          </div>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">标题</span>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
          </label>

          <div className="space-y-1.5">
            <span className="text-sm font-medium text-slate-700">正文</span>
            <p className="text-xs text-slate-400">Markdown，支持公式和代码高亮，可直接粘贴图片。只有 PDF 的话正文可以留空。</p>
            <MarkdownImageTextarea
              value={content}
              onValueChange={setContent}
              className="min-h-[420px] font-mono text-sm"
              placeholder={"## A. 题名\n\n思路……\n\n```cpp\n// 代码\n```"}
            />
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium text-slate-700">PDF 附件</span>
            {attachments.length > 0 && (
              <ul className="space-y-1.5">
                {attachments.map((a, i) => (
                  <li key={a.id ?? a.file_path} className="flex items-center gap-2 text-sm text-slate-700">
                    <FileText className="h-4 w-4 text-red-600" />
                    <span>{a.file_name}</span>
                    <span className="text-xs text-slate-400">{fileSize(a.file_size)}</span>
                    {!a.id && <span className="text-xs text-amber-700">未保存</span>}
                    <button
                      type="button"
                      className="ml-1 text-slate-400 hover:text-red-600"
                      title="移除"
                      onClick={() => setAttachments((list) => list.filter((_, j) => j !== i))}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <input
              ref={fileInput}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => upload(e.target.files)}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={uploading || attachments.length >= MAX_ATTACHMENTS}
              onClick={() => fileInput.current?.click()}
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              上传 PDF
            </Button>
            <p className="text-xs text-slate-400">最多 {MAX_ATTACHMENTS} 个，每个不超过 20 MB。</p>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-slate-700">对选手公开的时间</legend>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="radio" checked={!customTime} onChange={() => setCustomTime(false)} />
              比赛结束时
            </label>
            <label className="flex flex-wrap items-center gap-2 text-sm text-slate-700">
              <input type="radio" checked={customTime} onChange={() => setCustomTime(true)} />
              指定时间
              <input
                type="datetime-local"
                value={visibleAfter}
                disabled={!customTime}
                onChange={(e) => setVisibleAfter(e.target.value)}
                className="rounded-md border px-2 py-1 text-sm disabled:opacity-50"
              />
              <span className="text-xs text-slate-400">早于比赛结束时间的按比赛结束算</span>
            </label>
          </fieldset>

          <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
            <Button type="submit" disabled={busy || uploading}>
              {busy && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              发布
            </Button>
            <Button type="button" variant="outline" disabled={busy || uploading} onClick={() => save("DRAFT")}>
              存为草稿
            </Button>
            <span className="text-xs text-slate-400">发布后按上面的时间自动对选手公开；草稿只有比赛管理者能看到。</span>
            {editorial && (
              <Button
                type="button"
                variant="ghost"
                className="ml-auto text-red-600 hover:bg-red-50 hover:text-red-700"
                disabled={busy}
                onClick={remove}
              >
                删除题解
              </Button>
            )}
          </div>
        </form>
      )}
    </ContestShell>
  );
}
