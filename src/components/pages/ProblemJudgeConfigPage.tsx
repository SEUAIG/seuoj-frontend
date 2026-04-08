import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/services/api/axios";
import { toast } from "sonner";
import {
  getProblemConfig,
  updateProblemConfig,
  getProblemFileTree,
  type Testcase,
  type Subtask,
  type ProblemConfigPayload,
} from "@/services/getProblemConfig";
import { uploadProblemTestcases } from "@/services/problemEdit";
import TestcaseUploadCard from "@/components/bussiness/TestcaseUploadCard";
import { ArrowLeft, Plus, Trash2, FileTree, AlertCircle } from "lucide-react";

const judgeConfigSchema = z.object({
  max_cpu_time_ms: z.string().min(1, "CPU时间限制不能为空"),
  max_real_time_ms: z.string().min(1, "实际时间限制不能为空"),
  max_memory_byte: z.string().min(1, "内存限制不能为空"),
  max_stack_byte: z.string().min(1, "栈限制不能为空"),
  max_process_number: z.string().min(1, "进程数限制不能为空"),
  max_output_size: z.string().min(1, "输出大小限制不能为空"),
  problem_type: z.enum(["Standard", "Interactive"]),
  checker_type: z.enum(["Standard", "Special"]),
  interactor_type: z.enum(["Source", "Binary"]).optional(),
  interactor_data: z.string().optional(),
  checker_file_type: z.enum(["Source", "Binary"]).optional(),
  checker_data: z.string().optional(),
});

type JudgeConfigValues = z.infer<typeof judgeConfigSchema>;

/**
 * 测试点行
 * - id: 服务端 ID（上传后由服务器分配），-1 表示新增待提交的手动测试点
 * - seq: 展示序号（从 1 开始，顺序跟随列表位置）
 * - weight: 权重，默认 1
 */
interface TestcaseRow {
  _key: number;           // React 渲染用唯一 key
  id: number;             // 服务端 ID；-1 表示新增（未提交）
  seq: number;            // 展示序号
  in_path: string;
  ans_path: string;
  weight: number;
  time_limit_ms: number | null;
  memory_limit_kb: number | null;
}

/**
 * 子任务行
 * - id: 服务端 ID；-1 表示新增待提交
 * - cases: 引用的测试点 ID 列表
 */
interface SubtaskRow {
  _key: number;
  id: number;
  cases: number[];
  pre_subtasks: number[];
  score: number;
  type: "min" | "sum";
}

interface ValidationIssue {
  type: "error" | "warning";
  message: string;
  target?: string;
}

/** 构建测试点列表 — 上传后由服务器解析返回 */
function buildTestcaseRows(raw: Testcase[]): TestcaseRow[] {
  return raw.map((tc, i) => ({
    _key: Date.now() + i,
    id: tc.id,
    seq: i + 1,
    in_path: tc.in_path,
    ans_path: tc.ans_path,
    weight: tc.weight ?? 1,
    time_limit_ms: tc.time_limit_ms ?? null,
    memory_limit_kb: tc.memory_limit_kb ?? null,
  }));
}

/** 构建子任务列表 */
function buildSubtaskRows(raw: Subtask[]): SubtaskRow[] {
  return raw.map((st, i) => ({
    _key: Date.now() + i,
    id: st.id,
    cases: st.cases ?? [],
    pre_subtasks: st.pre_subtasks ?? [],
    score: st.score ?? 0,
    type: st.type ?? "min",
  }));
}

/** 验证配置 */
function validateConfig(
  testcases: TestcaseRow[],
  subtasks: SubtaskRow[]
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const tcIds = new Set(testcases.map((t) => t.id));

  // 1. 空路径
  testcases.forEach((tc) => {
    if (!tc.in_path.trim()) {
      issues.push({ type: "error", message: `测试点 #${tc.seq} 输入文件路径不能为空`, target: String(tc._key) });
    }
    if (!tc.ans_path.trim()) {
      issues.push({ type: "error", message: `测试点 #${tc.seq} 答案文件路径不能为空`, target: String(tc._key) });
    }
  });

  // 2. 子任务 ID 重复
  const subtaskIds = subtasks.map((s) => s.id);
  const seen = new Set<number>();
  subtaskIds.forEach((id) => {
    if (id !== -1 && seen.has(id)) {
      issues.push({ type: "error", message: `子任务 ID ${id} 重复`, target: "global" });
    }
    seen.add(id);
  });

  // 3. 子任务引用有效性
  subtasks.forEach((st) => {
    const invalid = st.cases.filter((c) => !tcIds.has(c));
    if (invalid.length > 0) {
      issues.push({
        type: "error",
        message: `子任务引用了不存在的测试点 ID: ${invalid.join(", ")}`,
        target: String(st._key),
      });
    }
    const invalidPre = st.pre_subtasks.filter((p) => p !== -1 && !subtaskIds.includes(p));
    if (invalidPre.length > 0) {
      issues.push({
        type: "error",
        message: `子任务引用了不存在的前置依赖 ID: ${invalidPre.join(", ")}`,
        target: String(st._key),
      });
    }
  });

  // 4. 循环依赖
  if (subtasks.length > 0) {
    const adj = new Map<number, number[]>();
    subtasks.forEach((st) => adj.set(st.id, st.pre_subtasks));
    const visited = new Set<number>();
    const stack = new Set<number>();
    let cycleFound = false;
    const cycleNodes: number[] = [];

    const dfs = (node: number): boolean => {
      if (stack.has(node)) {
        cycleNodes.push(node);
        return true;
      }
      if (visited.has(node)) return false;
      visited.add(node);
      stack.add(node);
      for (const dep of adj.get(node) ?? []) {
        if (dep === -1) continue;
        if (dfs(dep)) {
          if (cycleNodes[0] === node) cycleNodes.length = 0;
          cycleNodes.push(node);
          return true;
        }
      }
      stack.delete(node);
      return false;
    };

    for (const st of subtasks) {
      if (st.id !== -1 && dfs(st.id)) {
        cycleFound = true;
        break;
      }
    }
    if (cycleFound) {
      issues.push({ type: "error", message: `子任务存在循环依赖: ${[...new Set(cycleNodes)].join(" → ")}`, target: "global" });
    }
  }

  // 5. 分数校验（总分应 ≈ 100）
  const totalScore = subtasks.reduce((sum, st) => sum + st.score, 0);
  if (subtasks.length > 0 && totalScore !== 100) {
    const diff = 100 - totalScore;
    issues.push({
      type: "warning",
      message: `子任务总分 ${totalScore}，与 100 相差 ${Math.abs(diff)}（${diff > 0 ? "少了" : "多了"} ${Math.abs(diff)}%）`,
      target: "global",
    });
  }

  // 6. 未分组测试点（无 subtask 时均摊，有 subtask 时警告）
  if (subtasks.length > 0) {
    const covered = new Set(subtasks.flatMap((st) => st.cases));
    const uncovered = testcases.filter((tc) => !covered.has(tc.id));
    if (uncovered.length > 0) {
      issues.push({
        type: "warning",
        message: `测试点 ${uncovered.map((t) => `#${t.seq}`).join(", ")} 未被任何子任务包含，将按权重均摊得分`,
        target: "global",
      });
    }
  }

  return issues;
}

/** 文件路径自动补全输入框 */
function FilePathInput({
  value,
  onChange,
  files,
}: {
  value: string;
  onChange: (v: string) => void;
  files: string[];
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return files.slice(0, 50);
    const q = search.toLowerCase();
    return files.filter((f) => f.toLowerCase().includes(q)).slice(0, 50);
  }, [files, search]);

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="bg-background/50 font-mono text-xs"
        placeholder="data/1.in"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 min-w-[280px] rounded-md border bg-popover shadow-lg">
          <div className="p-2 border-b">
            <Input
              placeholder="搜索文件..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-7 text-xs"
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.map((f) => (
              <div
                key={f}
                className="px-3 py-1.5 text-xs font-mono hover:bg-muted cursor-pointer truncate"
                onMouseDown={() => { onChange(f); setOpen(false); }}
              >
                {f}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** 分数分配进度条 */
function ScoreBar({ testcases, subtasks }: { testcases: TestcaseRow[]; subtasks: SubtaskRow[] }) {
  const segments = useMemo(() => {
    if (subtasks.length === 0) {
      // 无子任务：均摊
      const w = testcases.reduce((s, t) => s + t.weight, 0);
      return testcases.map((tc) => ({
        label: `#${tc.seq}`,
        pct: w > 0 ? (tc.weight / w) * 100 : 0,
        color: "bg-blue-400",
      }));
    }
    // 有子任务
    return subtasks.map((st) => ({
      label: `ST#${st.id}`,
      pct: st.score,
      color: st.type === "min" ? "bg-amber-400" : "bg-green-400",
    }));
  }, [testcases, subtasks]);

  const total = segments.reduce((s, seg) => s + seg.pct, 0);

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>得分分配</span>
        <span>{total.toFixed(1)}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-muted overflow-hidden flex">
        {segments.map((seg, i) => (
          seg.pct > 0 && (
            <div
              key={i}
              className={`${seg.color} h-full transition-all`}
              style={{ width: `${seg.pct}%` }}
              title={`${seg.label}: ${seg.pct.toFixed(1)}%`}
            />
          )
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mt-1">
        {segments.filter(s => s.pct > 0).map((seg, i) => (
          <div key={i} className="flex items-center gap-1 text-xs">
            <div className={`w-2 h-2 rounded-full ${seg.color}`} />
            <span>{seg.label}</span>
            <span className="text-muted-foreground">{seg.pct.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProblemJudgeConfigPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const pid = id || "";

  const [testcaseFile, setTestcaseFile] = useState<File | null>(null);
  const [testcaseFormat, setTestcaseFormat] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [testcases, setTestcases] = useState<TestcaseRow[]>([]);
  const [subtasks, setSubtasks] = useState<SubtaskRow[]>([]);
  const [availableFiles, setAvailableFiles] = useState<string[]>([]);
  const [treeLoading, setTreeLoading] = useState(false);
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const [dirty, setDirty] = useState(false); // 是否有未保存的修改

  useEffect(() => {
    setValidationIssues(validateConfig(testcases, subtasks));
  }, [testcases, subtasks]);

  const fetchFileTree = useCallback(async () => {
    if (!pid) return;
    setTreeLoading(true);
    try {
      const files = await getProblemFileTree(pid);
      setAvailableFiles(files);
    } catch { /* ignore */ }
    finally { setTreeLoading(false); }
  }, [pid]);

  const handleTestcaseFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTestcaseFile(file);
      const lower = file.name.toLowerCase();
      if (lower.endsWith(".tar.gz")) setTestcaseFormat("tar.gz");
      else if (lower.endsWith(".tgz")) setTestcaseFormat("tgz");
      else if (lower.endsWith(".tar")) setTestcaseFormat("tar");
      else if (lower.endsWith(".zip")) setTestcaseFormat("zip");
      else if (lower.endsWith(".7z")) setTestcaseFormat("7z");
      else setTestcaseFormat("");
    } else {
      setTestcaseFile(null);
      setTestcaseFormat("");
    }
  };

  const handleConfirmUpload = async () => {
    if (!testcaseFile || !testcaseFormat) {
      toast.error("请先选择测试用例文件及格式", { position: "top-center" });
      return;
    }
    setConfirmLoading(true);
    try {
      const uploadRes = await uploadProblemTestcases(pid, testcaseFile, testcaseFormat);
      if (uploadRes?.code !== undefined && uploadRes.code !== 0 && uploadRes.code !== 200) {
        throw new Error(uploadRes.message || "测试用例上传失败");
      }
      toast.success("测试用例上传成功", { position: "top-center" });

      // 上传后重新获取配置
      const configRes = await getProblemConfig(pid);
      const { testcases: newTcs, subtasks: newSts, problem_info: info } = configRes;

      setTestcases(buildTestcaseRows(newTcs || []));
      setSubtasks(buildSubtaskRows(newSts ?? []));
      setDirty(false);

      // 用服务器返回的 problem_info 更新表单
      if (info) {
        if (info.time_limit_ms) form.setValue("max_cpu_time_ms", String(info.time_limit_ms));
        if (info.memory_limit_kb) form.setValue("max_memory_byte", String(info.memory_limit_kb * 1024));
        if (info.problem_type) {
          form.setValue("problem_type", info.problem_type === "Interactive" ? "Interactive" : "Standard");
        }
        if (info.checker_type) {
          form.setValue("checker_type",
            info.checker_type === "Special" || info.checker_type === "Interactor" ? "Special" : "Standard");
        }
      }

      await fetchFileTree();
      setTestcaseFile(null);
      setTestcaseFormat("");
    } catch (error: any) {
      toast.error(error.message || "上传失败", { position: "top-center" });
    } finally {
      setConfirmLoading(false);
    }
  };

  // 添加测试点（使用 -1 作为临时 ID，保存时服务器会分配）
  const addTestcase = () => {
    const nextSeq = testcases.length + 1;
    setTestcases((prev) => [
      ...prev,
      {
        _key: Date.now(),
        id: -1,            // -1 表示新增（服务器分配）
        seq: nextSeq,
        in_path: `data/${nextSeq}.in`,
        ans_path: `data/${nextSeq}.ans`,
        weight: 1,
        time_limit_ms: null,
        memory_limit_kb: null,
      },
    ]);
    setDirty(true);
  };

  const removeTestcase = (key: number) => {
    setTestcases((prev) => {
      const filtered = prev.filter((t) => t._key !== key);
      // 删除后重新计算 seq（seq 跟随列表位置，不影响 server ID）
      return filtered.map((t, i) => ({ ...t, seq: i + 1 }));
    });
    setDirty(true);
  };

  const updateTestcase = (key: number, field: keyof TestcaseRow, value: any) => {
    setTestcases((prev) => prev.map((t) => (t._key === key ? { ...t, [field]: value } : t)));
    setDirty(true);
  };

  // 添加子任务
  const addSubtask = () => {
    const nextId = subtasks.length > 0 ? Math.max(...subtasks.map((s) => s.id < 0 ? 0 : s.id)) + 1 : 1;
    setSubtasks((prev) => [
      ...prev,
      { _key: Date.now(), id: nextId, cases: [], pre_subtasks: [], score: 0, type: "min" },
    ]);
    setDirty(true);
  };

  const removeSubtask = (key: number) => {
    setSubtasks((prev) => prev.filter((s) => s._key !== key));
    setDirty(true);
  };

  const updateSubtask = (key: number, field: keyof SubtaskRow, value: any) => {
    setSubtasks((prev) => prev.map((s) => (s._key === key ? { ...s, [field]: value } : s)));
    setDirty(true);
  };

  const parseIdList = (raw: string): number[] =>
    raw.split(",").map((v) => parseInt(v.trim(), 10)).filter((v) => !isNaN(v));

  // 已知服务端 ID → 展示 seq（显示用）
  const idToSeq = useCallback(
    (id: number): number => testcases.find((t) => t.id === id)?.seq ?? id,
    [testcases]
  );

  // 测试点被哪些子任务引用
  const tcReferencedBy = useMemo(() => {
    const m = new Map<number, number[]>();
    testcases.forEach((tc) => m.set(tc.id, []));
    subtasks.forEach((st) => st.cases.forEach((c) => m.get(c)?.push(st.id)));
    return m;
  }, [testcases, subtasks]);

  const errors = validationIssues.filter((i) => i.type === "error");
  const warnings = validationIssues.filter((i) => i.type === "warning");

  const form = useForm<JudgeConfigValues>({
    resolver: zodResolver(judgeConfigSchema) as any,
    defaultValues: {
      max_cpu_time_ms: "1000",
      max_real_time_ms: "2000",
      max_memory_byte: "134217728",
      max_stack_byte: "33554432",
      max_process_number: "1",
      max_output_size: "10000",
      problem_type: "Standard",
      checker_type: "Standard",
      interactor_type: "Source",
      interactor_data: "",
      checker_file_type: "Source",
      checker_data: "",
    },
  });

  useEffect(() => {
    if (!pid) return;
    const fetchProblem = async () => {
      try {
        const configRes = await getProblemConfig(pid);
        const { testcases: tcs, subtasks: sts, problem_info: info } = configRes;

        setTestcases(buildTestcaseRows(tcs || []));
        setSubtasks(buildSubtaskRows(sts ?? []));
        setDirty(false);

        if (info) {
          form.reset({
            max_cpu_time_ms: String(info.time_limit_ms ?? "1000"),
            max_real_time_ms: "2000",
            max_memory_byte: String((info.memory_limit_kb ?? 131072) * 1024),
            max_stack_byte: "33554432",
            max_process_number: "1",
            max_output_size: "10000",
            problem_type: info.problem_type === "Interactive" ? "Interactive" : "Standard",
            checker_type: info.checker_type === "Special" || info.checker_type === "Interactor" ? "Special" : "Standard",
            interactor_type: "Source",
            interactor_data: "",
            checker_file_type: "Source",
            checker_data: "",
          });
        }
      } catch (error: any) {
        toast.error(error.message || "加载题目配置失败");
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
    fetchFileTree();
  }, [pid, form, fetchFileTree]);

  const { handleSubmit, control, formState, setFocus } = form;
  const problemType = form.watch("problem_type");
  const checkerType = form.watch("checker_type");

  const onSubmit = async (values: JudgeConfigValues) => {
    if (errors.length > 0) {
      toast.error(`存在 ${errors.length} 个错误，请先修复后再提交`, { position: "top-center" });
      return;
    }

    try {
      const problemTypeMap: Record<string, "standard" | "interactive" | "special"> = {
        Standard: "standard",
        Interactive: "interactive",
      };
      const checkerTypeMap: Record<string, "standard" | "special" | "interactor"> = {
        Standard: "standard",
        Special: "special",
      };

      // 清理：去掉 _key 和 seq（内部字段）
      const cleanTcs: Testcase[] = testcases.map(({ _key, seq, ...t }) => ({
        ...t,
        // -1 表示新增测试点，服务器会忽略或分配新 ID；已有 ID 保持不变
        id: t.id === -1 ? 0 : t.id, // 后端若不支持 0，可能需要去掉 id 字段或让后端自动分配
      }));
      const cleanSts: Subtask[] = subtasks.map(({ _key, ...s }) => s);

      const payload: ProblemConfigPayload = {
        problem_info: {
          problem_type: problemTypeMap[values.problem_type] ?? "standard",
          checker_type: checkerTypeMap[values.checker_type] ?? "standard",
          time_limit_ms: Number(values.max_cpu_time_ms),
          memory_limit_kb: Math.floor(Number(values.max_memory_byte) / 1024),
        },
        testcases: cleanTcs,
        subtasks: cleanSts.length > 0 ? cleanSts : undefined,
      };

      await updateProblemConfig(pid, payload);

      // 若有待上传文件，一并上传
      if (testcaseFile) {
        await uploadProblemTestcases(pid, testcaseFile, testcaseFormat);
        toast.success("配置与测试用例已保存", { position: "top-center" });
      } else {
        toast.success("配置已保存", { position: "top-center" });
      }

      setDirty(false);
      nav(`/problemsLibrary/${pid}/config`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "保存失败";
      toast.error(message, { position: "top-center" });
    }
  };

  const findFirstError = (error: unknown, prefix = ""): { path: string; message?: string } | null => {
    if (!error || typeof error !== "object") return null;
    if ("message" in (error as { message?: unknown })) {
      const msg = (error as { message?: unknown }).message;
      if (typeof msg === "string") return { path: prefix, message: msg };
    }
    const record = error as Record<string, unknown>;
    for (const key of Object.keys(record)) {
      const next = findFirstError(record[key], `${prefix}.${key}`.replace(/^\./, ""));
      if (next) return next;
    }
    return null;
  };

  const onInvalid = (errors: FieldErrors<JudgeConfigValues>) => {
    const first = findFirstError(errors);
    if (first?.path) setFocus(first.path as keyof JudgeConfigValues);
    toast.error(first?.message || "表单校验失败", { position: "top-center" });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <span className="text-muted-foreground">加载中...</span>
      </div>
    );
  }

  return (
    <div className="w-4/5 mx-auto py-6">
      <Helmet>
        <title>{`配置数据点 #${id} - SeuOJ`}</title>
      </Helmet>

      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => nav(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">配置数据点 #{id}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            上传测试用例并配置评测参数
          </p>
        </div>
        {dirty && (
          <span className="ml-auto text-xs text-amber-500 border border-amber-200 bg-amber-50 rounded px-2 py-1">
            有未保存的修改
          </span>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-8">
          <TestcaseUploadCard
            file={testcaseFile}
            format={testcaseFormat}
            onFileChange={handleTestcaseFileChange}
            onFormatChange={setTestcaseFormat}
            onConfirm={handleConfirmUpload}
            confirmLoading={confirmLoading}
          />

          {/* 测试点编辑 */}
          <Card className="border shadow-sm bg-white/80 backdrop-blur">
            <CardHeader className="border-b bg-muted/30 flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg font-semibold">
                测试点
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  {testcases.length > 0 ? `${testcases.length} 个` : ""}
                </span>
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={fetchFileTree} disabled={treeLoading}>
                  <FileTree className="mr-1 h-4 w-4" />
                  {treeLoading ? "加载中..." : "刷新文件树"}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={addTestcase}>
                  <Plus className="mr-1 h-4 w-4" />
                  添加测试点
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {testcases.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-8">
                  暂无测试点，请上传测试用例压缩包或手动添加
                </div>
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-2 py-2 text-left font-medium w-8">#</th>
                        <th className="px-2 py-2 text-left font-medium w-12">ID</th>
                        <th className="px-2 py-2 text-left font-medium">输入文件</th>
                        <th className="px-2 py-2 text-left font-medium">答案文件</th>
                        <th className="px-2 py-2 text-left font-medium w-16">权重</th>
                        <th className="px-2 py-2 text-left font-medium w-16">时间 ms</th>
                        <th className="px-2 py-2 text-left font-medium w-16">内存 KB</th>
                        <th className="px-2 py-2 text-left font-medium">分组</th>
                        <th className="px-2 py-2 text-left font-medium w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {testcases.map((tc) => {
                        const rowErrors = validationIssues.filter(
                          (i) => i.target === String(tc._key) && i.type === "error"
                        );
                        const hasError = rowErrors.length > 0;
                        const refs = tcReferencedBy.get(tc.id) ?? [];
                        return (
                          <tr key={tc._key} className={hasError ? "bg-destructive/5" : "hover:bg-muted/20"}>
                            <td className="px-2 py-1.5 text-muted-foreground font-mono text-xs">{tc.seq}</td>
                            <td className="px-2 py-1.5">
                              {tc.id === -1 ? (
                                <span className="text-xs text-muted-foreground italic">新增</span>
                              ) : (
                                <span className="font-mono text-xs font-medium text-blue-600">{tc.id}</span>
                              )}
                            </td>
                            <td className="px-2 py-1.5">
                              <FilePathInput
                                value={tc.in_path}
                                onChange={(v) => updateTestcase(tc._key, "in_path", v)}
                                files={availableFiles}
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <FilePathInput
                                value={tc.ans_path}
                                onChange={(v) => updateTestcase(tc._key, "ans_path", v)}
                                files={availableFiles}
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <Input
                                type="number"
                                min={1}
                                value={tc.weight}
                                onChange={(e) => updateTestcase(tc._key, "weight", Number(e.target.value))}
                                className="h-7 bg-background/50 text-xs"
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <Input
                                type="number"
                                value={tc.time_limit_ms ?? ""}
                                placeholder="-"
                                onChange={(e) =>
                                  updateTestcase(tc._key, "time_limit_ms", e.target.value ? Number(e.target.value) : null)
                                }
                                className="h-7 bg-background/50 text-xs"
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <Input
                                type="number"
                                value={tc.memory_limit_kb ?? ""}
                                placeholder="-"
                                onChange={(e) =>
                                  updateTestcase(tc._key, "memory_limit_kb", e.target.value ? Number(e.target.value) : null)
                                }
                                className="h-7 bg-background/50 text-xs"
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              {refs.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {refs.map((sid) => (
                                    <span key={sid} className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-medium">
                                      #{sid}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground italic">未分组</span>
                              )}
                            </td>
                            <td className="px-2 py-1.5">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive"
                                onClick={() => removeTestcase(tc._key)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 子任务编辑 */}
          <Card className="border shadow-sm bg-white/80 backdrop-blur">
            <CardHeader className="border-b bg-muted/30 flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-lg font-semibold">子任务</CardTitle>
                {subtasks.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    子任务分数总和应尽量为 100%
                  </p>
                )}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addSubtask}>
                <Plus className="mr-1 h-4 w-4" />
                添加子任务
              </Button>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {/* 分数分配条 */}
              {testcases.length > 0 && (
                <ScoreBar testcases={testcases} subtasks={subtasks} />
              )}

              {subtasks.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-6">
                  无子任务时所有测试点按权重均摊分值（无需配置）
                </div>
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-2 py-2 text-left font-medium w-12">ID</th>
                        <th className="px-2 py-2 text-left font-medium w-20">计分方式</th>
                        <th className="px-2 py-2 text-left font-medium w-20">分值 %</th>
                        <th className="px-2 py-2 text-left font-medium">包含用例</th>
                        <th className="px-2 py-2 text-left font-medium">前置依赖</th>
                        <th className="px-2 py-2 text-left font-medium w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {subtasks.map((st) => {
                        const stErrors = validationIssues.filter(
                          (i) => i.target === String(st._key) && i.type === "error"
                        );
                        const hasError = stErrors.length > 0;
                        const caseSeqs = st.cases.map(idToSeq);
                        return (
                          <tr key={st._key} className={hasError ? "bg-destructive/5" : "hover:bg-muted/20"}>
                            <td className="px-2 py-1.5">
                              {st.id === -1 ? (
                                <span className="text-xs text-muted-foreground italic">新增</span>
                              ) : (
                                <span className="font-mono text-xs font-medium text-blue-600">{st.id}</span>
                              )}
                            </td>
                            <td className="px-2 py-1.5">
                              <select
                                className="h-7 w-full rounded border bg-background/50 px-2 text-xs"
                                value={st.type}
                                onChange={(e) => updateSubtask(st._key, "type", e.target.value as "min" | "sum")}
                              >
                                <option value="min">最小值</option>
                                <option value="sum">求和</option>
                              </select>
                            </td>
                            <td className="px-2 py-1.5">
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                value={st.score}
                                onChange={(e) => updateSubtask(st._key, "score", Number(e.target.value))}
                                className={`h-7 bg-background/50 text-xs ${st.score > 100 ? "border-amber-400" : ""}`}
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <Input
                                value={caseSeqs.join(", ")}
                                onChange={(e) => {
                                  const seqArr = parseIdList(e.target.value);
                                  const idArr = seqArr
                                    .map((seq) => testcases.find((t) => t.seq === seq)?.id)
                                    .filter((id): id is number => id !== undefined);
                                  updateSubtask(st._key, "cases", idArr);
                                }}
                                className={`h-7 bg-background/50 text-xs font-mono ${hasError ? "border-destructive" : ""}`}
                                placeholder="1, 2, 3"
                              />
                              {hasError && (
                                <div className="text-xs text-destructive mt-0.5">{stErrors[0].message}</div>
                              )}
                            </td>
                            <td className="px-2 py-1.5">
                              <Input
                                value={st.pre_subtasks.join(", ")}
                                onChange={(e) => updateSubtask(st._key, "pre_subtasks", parseIdList(e.target.value))}
                                className="h-7 bg-background/50 text-xs font-mono"
                                placeholder="可选"
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive"
                                onClick={() => removeSubtask(st._key)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 全局验证信息 */}
              {validationIssues.filter((i) => i.target === "global").length > 0 && (
                <div className="space-y-2">
                  {errors.filter((i) => i.target === "global").map((err, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded px-3 py-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {err.message}
                    </div>
                  ))}
                  {warnings.filter((i) => i.target === "global").map((warn, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 rounded px-3 py-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {warn.message}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 评测配置 */}
          <Card className="border shadow-sm bg-white/80 backdrop-blur">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="text-lg font-semibold">评测配置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="max_cpu_time_ms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPU时间限制 (ms)</FormLabel>
                      <FormControl>
                        <Input placeholder="1000" className="bg-background/50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="max_real_time_ms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>实际时间限制 (ms)</FormLabel>
                      <FormControl>
                        <Input placeholder="2000" className="bg-background/50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="max_memory_byte"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>内存限制 (byte)</FormLabel>
                      <FormControl>
                        <Input placeholder="134217728" className="bg-background/50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="max_stack_byte"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>栈限制 (byte)</FormLabel>
                      <FormControl>
                        <Input placeholder="33554432" className="bg-background/50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="max_process_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>进程数限制</FormLabel>
                      <FormControl>
                        <Input placeholder="1" className="bg-background/50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="max_output_size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>输出大小限制 (byte)</FormLabel>
                      <FormControl>
                        <Input placeholder="10000" className="bg-background/50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="problem_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>题目类型</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background/50 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                          value={field.value}
                          onChange={field.onChange}
                        >
                          <option value="Standard">Standard</option>
                          <option value="Interactive">Interactive</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="checker_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>检查器类型</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background/50 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                          value={field.value}
                          onChange={field.onChange}
                        >
                          <option value="Standard">Standard</option>
                          <option value="Special">Special</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {problemType === "Interactive" && (
                  <div className="md:col-span-2 rounded-md border bg-muted/10 p-4 space-y-4">
                    <div className="text-sm font-medium text-muted-foreground">交互器</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={control}
                        name="interactor_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>类型</FormLabel>
                            <FormControl>
                              <select
                                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background/50 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                value={field.value || "Source"}
                                onChange={field.onChange}
                              >
                                <option value="Source">Source</option>
                                <option value="Binary">Binary</option>
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="interactor_data"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>内容</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="源代码或 base64 编码的 bin"
                                className="min-h-[120px] bg-background/50"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
                {checkerType === "Special" && (
                  <div className="md:col-span-2 rounded-md border bg-muted/10 p-4 space-y-4">
                    <div className="text-sm font-medium text-muted-foreground">检查器</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={control}
                        name="checker_file_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>类型</FormLabel>
                            <FormControl>
                              <select
                                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background/50 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                value={field.value || "Source"}
                                onChange={field.onChange}
                              >
                                <option value="Source">Source</option>
                                <option value="Binary">Binary</option>
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="checker_data"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>内容</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="源代码或 base64 编码的 bin"
                                className="min-h-[120px] bg-background/50"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" className="min-w-[96px]" onClick={() => nav(-1)}>
              取消
            </Button>
            <Button
              type="submit"
              disabled={formState.isSubmitting || errors.length > 0}
              className={`min-w-[120px] shadow-sm ${
                errors.length > 0 ? "bg-destructive hover:bg-destructive" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {formState.isSubmitting ? "保存中..." : errors.length > 0 ? `修复 ${errors.length} 个错误` : "保存配置"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
