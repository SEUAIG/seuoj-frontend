import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useSelector } from "react-redux";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { RootState } from "@/app/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MarkdownImageTextarea } from "@/components/common/MarkdownImageTextarea";
import { postPath, solutionsTabPath } from "@/components/discussion/discussionKit";
import { createSolution, getPost, updateSolution } from "@/services/Discussion/posts";
import type { PostStatus } from "@/models/post";

const MAX_TITLE = 120;
const MAX_CONTENT = 100000;

/**
 * 写题解 /post/new?problem=&contest=，改题解 /post/:id/edit[?contest=]。
 * 第一次点保存才建记录，打开页面不会生成任何东西。
 */
export default function PostEditPage() {
  const { id } = useParams();
  const postId = id ? Number(id) : undefined;
  const [search] = useSearchParams();
  const contestId = Number(search.get("contest")) || undefined;
  const newPid = search.get("problem") ?? "";
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { isAuthenticated } = useSelector((s: RootState) => s.auth);

  const { data: existing, error, isLoading } = useQuery({
    queryKey: ["post", postId, contestId ?? null],
    queryFn: () => getPost(postId!, contestId),
    enabled: !!postId,
    retry: false,
  });

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    if (!existing || loaded.current) return;
    loaded.current = true;
    setTitle(existing.title);
    setContent(existing.content);
  }, [existing]);

  const pid = existing?.pid ?? newPid;
  const back = postId ? postPath(postId, contestId) : solutionsTabPath(pid, contestId);

  const save = async (status: PostStatus) => {
    if (!title.trim()) {
      toast.error("标题不能为空");
      return;
    }
    if (status === "PUBLISHED" && !content.trim()) {
      toast.error("正文不能为空");
      return;
    }
    setBusy(true);
    try {
      const body = { pid, contest_id: contestId, title: title.trim(), content, status };
      const saved = postId ? await updateSolution(postId, body) : await createSolution(body);
      toast.success(status === "DRAFT" ? "草稿已保存，只有你看得到" : "已发布");
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["post"] }),
        qc.invalidateQueries({ queryKey: ["solutions"] }),
        qc.invalidateQueries({ queryKey: ["commentSummary"] }),
        qc.invalidateQueries({ queryKey: ["contestDiscussion"] }),
      ]);
      if (status === "DRAFT" && !postId) {
        // 新建的草稿：换到它的编辑地址，再保存就是改这一篇，不会再建一篇
        navigate(`/post/${saved.id}/edit${contestId ? `?contest=${contestId}` : ""}`, { replace: true });
      } else if (status === "PUBLISHED") {
        navigate(postPath(saved.id, contestId));
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "保存失败");
    } finally {
      setBusy(false);
    }
  };

  let body: React.ReactNode;
  if (!isAuthenticated) {
    body = (
      <p className="py-10 text-sm text-slate-500">
        <Link to="/login" className="text-primary hover:underline">
          登录
        </Link>
        后才能写题解。
      </p>
    );
  } else if (postId && isLoading) {
    body = (
      <div className="flex items-center gap-2 py-16 text-sm text-slate-400">
        <Loader2 className="h-4 w-4 animate-spin" /> 加载中
      </div>
    );
  } else if (postId && (error || !existing)) {
    body = <p className="py-10 text-sm text-slate-500">{error instanceof Error ? error.message : "题解不存在"}</p>;
  } else if (existing && !existing.mine) {
    body = <p className="py-10 text-sm text-slate-500">只能修改自己的题解。</p>;
  } else if (!pid) {
    body = <p className="py-10 text-sm text-slate-500">缺少题目。请从题目页的「题解」标签点「写题解」进来。</p>;
  } else {
    body = (
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          save("PUBLISHED");
        }}
      >
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">标题</span>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={MAX_TITLE}
            placeholder="例如：前缀和 O(n) 做法"
            autoFocus={!postId}
          />
        </label>
        <div className="space-y-1.5">
          <span className="text-sm font-medium text-slate-700">正文</span>
          <p className="text-xs text-slate-400">Markdown，支持公式和代码高亮，可直接粘贴图片。</p>
          <MarkdownImageTextarea
            value={content}
            onValueChange={setContent}
            maxLength={MAX_CONTENT}
            className="min-h-[420px] font-mono text-sm"
            placeholder={"## 思路\n\n……\n\n## 代码\n\n```cpp\n// ...\n```"}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
          <Button type="submit" disabled={busy}>
            {busy && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            发布
          </Button>
          <Button type="button" variant="outline" disabled={busy} onClick={() => save("DRAFT")}>
            {existing?.status === "PUBLISHED" ? "撤回为草稿" : "存为草稿"}
          </Button>
          <span className="text-xs text-slate-400">草稿只有你自己看得到；每道题最多 3 篇。</span>
        </div>
      </form>
    );
  }

  return (
    <div className="w-full border-t border-gray-200 bg-white">
      <Helmet>
        <title>{postId ? "修改题解 - SEUOJ" : "写题解 - SEUOJ"}</title>
      </Helmet>
      <div className="mx-auto max-w-4xl space-y-6 px-5 py-6 md:px-8">
        <div className="space-y-1">
          <Link to={back} className="inline-flex items-center text-xs text-slate-500 hover:text-slate-900">
            <ChevronLeft className="h-3.5 w-3.5" />
            返回
          </Link>
          <h1 className="text-xl font-bold text-slate-900">
            {postId ? "修改题解" : "写题解"}
            {pid && (
              <span className="font-normal text-slate-500">
                {" "}
                · {pid}
                {existing?.problem_title ? `. ${existing.problem_title}` : ""}
              </span>
            )}
          </h1>
        </div>
        {body}
      </div>
    </div>
  );
}
