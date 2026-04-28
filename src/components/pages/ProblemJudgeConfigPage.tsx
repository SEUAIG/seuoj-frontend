import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
import { ArrowLeft, Plus, Trash2, FolderTree, AlertCircle } from "lucide-react";

const judgeConfigSchema = z.object({
  time_limit_ms: z.string().min(1, "时间限制不能为空"),
  memory_limit_kb: z.string().min(1, "内存限制不能为空"),
  problem_type: z.enum(["Standard", "Interactive", "Special"]),
  checker_type: z.enum(["Standard", "Special", "Interactor"]),
  checker_path: z.string().optional(),
  interactor_path: z.string().optional(),
}).superRefine((values, ctx) => {
  if (values.problem_type === "Interactive" && !values.interactor_path?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["interactor_path"],
      message: "Interactive 题型必须配置 interactor 路径",
    });
  }
  if (values.problem_type === "Special" && !values.checker_path?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["checker_path"],
      message: "Special 题型必须配置 checker 路径",
    });
  }
});

type JudgeConfigValues = z.infer<typeof judgeConfigSchema>;

/**
 * 测试点行
 * - id: 服务端 ID（上传后由服务器分配），-1 表示新增待提交的手动测试点
 * - seq: 展示序号（从 1 开始，顺序跟随列表位置）
 * - weight: 分数（字段名保持 weight），手动新增默认 0
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

function buildEvenScores(total: number, count: number): number[] {
  if (count <= 0) return [];
  const base = Math.floor(total / count);
  const remainder = total % count;
  return Array.from({ length: count }, (_, i) => (i < remainder ? base + 1 : base));
}

function inferAnswerPath(inPath: string, files: string[]): string {
  const normalized = inPath.trim();
  if (!normalized) return "";
  const fileSet = new Set(files);

  const lastSlash = normalized.lastIndexOf("/");
  const dir = lastSlash >= 0 ? normalized.slice(0, lastSlash + 1) : "";
  const fileName = lastSlash >= 0 ? normalized.slice(lastSlash + 1) : normalized;

  if (!fileName.toLowerCase().endsWith(".in")) return "";
  const stem = fileName.slice(0, -3);
  const candidates = [`${stem}.out`, `${stem}.ans`, `${stem}.answer`, `${stem}.txt`];
  for (const candidate of candidates) {
    const fullPath = `${dir}${candidate}`;
    if (fileSet.has(fullPath)) return fullPath;
  }
  return "";
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
  score: number | null;
  type: "min" | "sum";
}

interface ValidationIssue {
  type: "error" | "warning";
  message: string;
  target?: string;
}

const SUBTASK_COLOR_CLASSES = [
  "bg-blue-400",
  "bg-emerald-400",
  "bg-amber-400",
  "bg-rose-400",
  "bg-violet-400",
  "bg-cyan-400",
  "bg-lime-400",
  "bg-fuchsia-400",
] as const;

/** 构建测试点列表 — 上传后由服务器解析返回 */
function buildTestcaseRows(raw: Testcase[]): TestcaseRow[] {
  const stripDataPrefix = (p: string) => p.replace(/^data\//, "");
  return raw.map((tc, i) => ({
    _key: Date.now() + i,
    id: tc.id,
    seq: i + 1,
    in_path: stripDataPrefix(tc.in_path),
    ans_path: stripDataPrefix(tc.ans_path),
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
      issues.push({ type: "warning", message: `测试点 #${tc.seq} 答案文件路径为空（Special Judge 可忽略）`, target: String(tc._key) });
    }
  });

  // 1.1 测试点分数校验（字段名为 weight）
  testcases.forEach((tc) => {
    if (!Number.isFinite(tc.weight) || tc.weight < 0) {
      issues.push({
        type: "error",
        message: `测试点 #${tc.seq} 分数必须是大于等于 0 的数字`,
        target: String(tc._key),
      });
    }
  });
  if (testcases.length > 0) {
    const totalWeight = testcases.reduce((sum, tc) => sum + (Number.isFinite(tc.weight) ? tc.weight : 0), 0);
    if (totalWeight !== 100) {
      issues.push({
        type: "error",
        message: `测试点分数总和必须为 100，当前为 ${totalWeight}`,
        target: "global",
      });
    }
  }

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

  // 5. 子任务分数校验（总分应 ≈ 100）
  const totalScore = subtasks.reduce((sum, st) => sum + (st.score ?? 0), 0);
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
        message: `测试点 ${uncovered.map((t) => `#${t.seq}`).join(", ")} 未被任何子任务包含`,
        target: "global",
      });
    }
  }

  return issues;
}

/** 子任务包含用例多选框 */
function SubtaskCasesMultiSelect({
  value,
  onChange,
  testcases,
  hasError,
  blockedCaseIds,
}: {
  value: number[];
  onChange: (next: number[]) => void;
  testcases: TestcaseRow[];
  hasError: boolean;
  blockedCaseIds: Set<number>;
}) {
  const idToSeq = useMemo(
    () => new Map(testcases.map((tc) => [tc.id, tc.seq])),
    [testcases]
  );
  const availableTestcases = useMemo(
    () => testcases.filter((tc) => value.includes(tc.id) || !blockedCaseIds.has(tc.id)),
    [testcases, value, blockedCaseIds]
  );
  const selectedSeqs = useMemo(
    () => [...new Set(value)]
      .map((id) => idToSeq.get(id))
      .filter((seq): seq is number => seq !== undefined)
      .sort((a, b) => a - b),
    [value, idToSeq]
  );

  const toggleCase = (caseId: number, checked: boolean) => {
    const nextSet = new Set(value);
    if (checked) nextSet.add(caseId);
    else nextSet.delete(caseId);
    const next = [...nextSet].sort((a, b) => (idToSeq.get(a) ?? a) - (idToSeq.get(b) ?? b));
    onChange(next);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={`h-7 w-full justify-start bg-background/50 px-2 text-left text-xs font-mono ${hasError ? "border-destructive" : ""}`}
        >
          {selectedSeqs.length > 0
            ? selectedSeqs.map((seq) => `#${seq}`).join(", ")
            : "选择包含用例"}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-2">
        <div className="max-h-56 space-y-1 overflow-y-auto">
          {testcases.length === 0 ? (
            <div className="px-2 py-1 text-xs text-muted-foreground">暂无可选测试点</div>
          ) : (
            availableTestcases.map((tc) => (
              <label
                key={tc._key}
                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-muted/60"
              >
                <Checkbox
                  checked={value.includes(tc.id)}
                  onCheckedChange={(checked) => toggleCase(tc.id, checked === true)}
                />
                <span className="text-xs font-mono">#{tc.seq}</span>
                <span className="text-xs text-muted-foreground truncate">{tc.in_path}</span>
              </label>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** 文件路径自动补全输入框 */
function FilePathInput({
  value,
  onChange,
  files,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  files: string[];
  placeholder?: string;
}) {
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    return files.slice(0, 200);
  }, [files]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onClick={() => setOpen(true)}
        onFocus={() => setOpen(true)}
        className="bg-background/50 font-mono text-xs"
        placeholder={placeholder ?? "输入文件路径"}
      />
      {open && (
        <div className="absolute z-[120] mt-1 min-w-[280px] rounded-md border bg-popover shadow-lg">
          <div className="max-h-48 overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.map((f) => (
                <div
                  key={f}
                  className="px-3 py-1.5 text-xs font-mono hover:bg-muted cursor-pointer truncate"
                  onMouseDown={() => {
                    onChange(f);
                    setOpen(false);
                  }}
                >
                  {f}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-xs text-muted-foreground">
                没有可选文件
              </div>
            )}
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
      // 无子任务：直接按测试点分数（weight 字段）显示
      return testcases.map((tc) => ({
        label: `#${tc.seq}`,
        pct: tc.weight,
        color: "bg-blue-400",
      }));
    }
    // 有子任务
    return subtasks.map((st, i) => ({
      label: `ST#${st.id}`,
      pct: st.score ?? 0,
      color: SUBTASK_COLOR_CLASSES[i % SUBTASK_COLOR_CLASSES.length],
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
  const from = encodeURIComponent(`${window.location.pathname}${window.location.search}`);

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

  const fetchFolderTree = useCallback(async () => {
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
      toast.success("测试用例上传成功，正在解析...", { position: "top-center" });

      // 上传只解压文件到 data/ 目录，不会自动更新 info.toml，
      // 因此通过文件树接口获取 data/ 下的 .in 文件生成测试点（答案文件由用户显式选择）
      const files = await getProblemFileTree(pid);
      setAvailableFiles(files);

      // 仅识别 .in 文件，不做前缀匹配
      const inFiles = files.filter((f) => f.endsWith(".in")).sort();
      const evenScores = buildEvenScores(100, inFiles.length);
      const generatedRows: TestcaseRow[] = inFiles.map((inPath, i) => {
        return {
          _key: Date.now() + i,
          id: i + 1,
          seq: i + 1,
          in_path: inPath,
          ans_path: inferAnswerPath(inPath, files),
          weight: evenScores[i] ?? 0,
          time_limit_ms: null,
          memory_limit_kb: null,
        };
      });

      if (generatedRows.length > 0) {
        setTestcases(generatedRows);
        setSubtasks([]);
        setDirty(true);
        toast.success(`已从上传文件中识别出 ${generatedRows.length} 个测试点，请检查后保存配置`, {
          position: "top-center",
          duration: 5000,
        });
      } else {
        toast.warning("未在上传文件中找到 .in 文件，请手动添加测试点", {
          position: "top-center",
          duration: 5000,
        });
      }
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
        in_path: "",
        ans_path: "",
        weight: 0,
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
      time_limit_ms: "1000",
      memory_limit_kb: "131072",
      problem_type: "Standard",
      checker_type: "Standard",
      checker_path: "",
      interactor_path: "",
    },
  });

  useEffect(() => {
    if (!pid) return;
    const fetchProblem = async () => {
      try {
        const configRes = await getProblemConfig(pid);
        const {
          testcases: tcs,
          subtasks: sts,
          problem_info: info,
          custom_modules,
        } = configRes;

        setTestcases(buildTestcaseRows(tcs || []));
        setSubtasks(buildSubtaskRows(sts ?? []));
        setDirty(false);

        if (info) {
          form.reset({
            time_limit_ms: String(info.time_limit_ms ?? 1000),
            memory_limit_kb: String(info.memory_limit_kb ?? 131072),
            problem_type:
              info.problem_type === "Interactive"
                ? "Interactive"
                : info.problem_type === "Special"
                ? "Special"
                : "Standard",
            checker_type:
              info.checker_type === "Interactor"
                ? "Interactor"
                : info.checker_type === "Special"
                ? "Special"
                : "Standard",
            checker_path: custom_modules?.checker_path ?? "",
            interactor_path: custom_modules?.interactor_path ?? "",
          });
        }
      } catch (error: any) {
        toast.error(error.message || "加载题目配置失败");
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
    fetchFolderTree();
  }, [pid, form, fetchFolderTree]);

  const { handleSubmit, control, formState, setFocus } = form;
  const selectedProblemType = form.watch("problem_type");

  const onSubmit = async (values: JudgeConfigValues) => {
    if (errors.length > 0) {
      toast.error(`存在 ${errors.length} 个错误，请先修复后再提交`, { position: "top-center" });
      return;
    }

    try {
      const problemTypeMap: Record<string, "standard" | "interactive" | "special"> = {
        Standard: "standard",
        Interactive: "interactive",
        Special: "special",
      };
      const checkerTypeMap: Record<string, "standard" | "special" | "interactor"> = {
        Standard: "standard",
        Special: "special",
        Interactor: "interactor",
      };

      // 清理：去掉 _key 和 seq（内部字段），去掉路径中的 data/ 前缀（judgend 自动添加）
      const stripDataPrefix = (p: string) => p.replace(/^data\//, "");
      const cleanTcs: Testcase[] = testcases.map(({ _key, seq, ...t }) => ({
        ...t,
        in_path: stripDataPrefix(t.in_path),
        ans_path: stripDataPrefix(t.ans_path),
        id: t.id === -1 ? 0 : t.id,
      }));
      const cleanSts: Subtask[] = subtasks.map(({ _key, ...s }) => ({
        ...s,
        score: s.score ?? 0,
      }));
      let customModules: ProblemConfigPayload["custom_modules"] | undefined;
      if (values.problem_type === "Interactive") {
        customModules = { interactor_path: values.interactor_path?.trim() || "" };
      } else if (values.problem_type === "Special") {
        customModules = { checker_path: values.checker_path?.trim() || "" };
      }

      const payload: ProblemConfigPayload = {
        problem_info: {
          problem_type: problemTypeMap[values.problem_type] ?? "standard",
          checker_type: checkerTypeMap[values.checker_type] ?? "standard",
          time_limit_ms: Number(values.time_limit_ms),
          memory_limit_kb: Number(values.memory_limit_kb),
        },
        testcases: cleanTcs,
        subtasks: cleanSts.length > 0 ? cleanSts : undefined,
        custom_modules: customModules,
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
      nav(`/problemsLibrary/${pid}?from=${from}`);
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
        <title>{`配置数据点 #${id} - SEUOJ`}</title>
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
                <Button type="button" variant="outline" size="sm" onClick={fetchFolderTree} disabled={treeLoading}>
                  <FolderTree className="mr-1 h-4 w-4" />
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
                <div className="rounded-md border overflow-visible">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-2 py-2 text-left font-medium w-12">ID</th>
                        <th className="px-2 py-2 text-left font-medium w-[24%]">输入文件</th>
                        <th className="px-2 py-2 text-left font-medium w-[18%]">答案文件</th>
                        <th className="px-2 py-2 text-left font-medium w-24">分数</th>
                        <th className="px-2 py-2 text-left font-medium w-24">时间 ms</th>
                        <th className="px-2 py-2 text-left font-medium w-24">内存 KB</th>
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
                                placeholder="输入文件路径"
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <FilePathInput
                                value={tc.ans_path}
                                onChange={(v) => updateTestcase(tc._key, "ans_path", v)}
                                files={availableFiles}
                                placeholder="答案文件路径"
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <Input
                                type="text"
                                inputMode="decimal"
                                value={Number.isFinite(tc.weight) ? tc.weight : ""}
                                onChange={(e) =>
                                  updateTestcase(
                                    tc._key,
                                    "weight",
                                    e.target.value.trim() === "" ? Number.NaN : Number(e.target.value)
                                  )
                                }
                                className="bg-background/50 text-xs"
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
                                className="bg-background/50 text-xs"
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
                                className="bg-background/50 text-xs"
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
                    子任务分数总和应为 100%
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
                  无子任务时按测试点分数（weight）计分，总分必须为 100
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
                                type="text"
                                inputMode="decimal"
                                value={st.score ?? ""}
                                onChange={(e) =>
                                  updateSubtask(
                                    st._key,
                                    "score",
                                    e.target.value.trim() === "" ? null : Number(e.target.value)
                                  )
                                }
                                className={`h-7 bg-background/50 text-xs ${st.score !== null && st.score > 100 ? "border-amber-400" : ""}`}
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <SubtaskCasesMultiSelect
                                value={st.cases}
                                onChange={(next) => updateSubtask(st._key, "cases", next)}
                                testcases={testcases}
                                hasError={hasError}
                                blockedCaseIds={new Set(
                                  subtasks
                                    .filter((other) => other._key !== st._key)
                                    .flatMap((other) => other.cases)
                                )}
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
                  name="time_limit_ms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>时间限制 (ms)</FormLabel>
                      <FormControl>
                        <Input placeholder="1000" className="bg-background/50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="memory_limit_kb"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>内存限制 (KB)</FormLabel>
                      <FormControl>
                        <Input placeholder="131072" className="bg-background/50" {...field} />
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
                          onChange={(e) => {
                            const next = e.target.value as "Standard" | "Interactive" | "Special";
                            field.onChange(next);
                            const linkedCheckerMap: Record<typeof next, "Standard" | "Interactor" | "Special"> = {
                              Standard: "Standard",
                              Interactive: "Interactor",
                              Special: "Special",
                            };
                            form.setValue("checker_type", linkedCheckerMap[next], {
                              shouldDirty: true,
                              shouldValidate: true,
                            });
                          }}
                        >
                          <option value="Standard">Standard</option>
                          <option value="Interactive">Interactive</option>
                          <option value="Special">Special</option>
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
                          onChange={(e) => {
                            const next = e.target.value as "Standard" | "Special" | "Interactor";
                            field.onChange(next);
                            const linkedProblemMap: Record<typeof next, "Standard" | "Special" | "Interactive"> = {
                              Standard: "Standard",
                              Special: "Special",
                              Interactor: "Interactive",
                            };
                            form.setValue("problem_type", linkedProblemMap[next], {
                              shouldDirty: true,
                              shouldValidate: true,
                            });
                          }}
                        >
                          <option value="Standard">Standard</option>
                          <option value="Special">Special</option>
                          <option value="Interactor">Interactor</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {selectedProblemType === "Special" && (
                  <FormField
                    control={control}
                    name="checker_path"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>checker 路径</FormLabel>
                        <FormControl>
                          <FilePathInput
                            value={field.value ?? ""}
                            onChange={(v) => field.onChange(v)}
                            files={availableFiles}
                            placeholder="选择 checker 文件路径"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {selectedProblemType === "Interactive" && (
                  <FormField
                    control={control}
                    name="interactor_path"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>interactor 路径</FormLabel>
                        <FormControl>
                          <FilePathInput
                            value={field.value ?? ""}
                            onChange={(v) => field.onChange(v)}
                            files={availableFiles}
                            placeholder="选择 interactor 文件路径"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
