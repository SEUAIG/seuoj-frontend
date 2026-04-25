import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import { FlaskConical, Play, X } from "lucide-react";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MarkdownRenderer } from "@/components/common/MarkdownRenderer";
import ProblemDetailInfo from "@/components/bussiness/ProblemDetailInfo";
import CodeEditor from "@/components/bussiness/CodeEditor";
import { agentCodingApi } from "@/services/agent/coding";
import { setCodeFile, setLanguage as setCodeLanguage } from "@/features/Code/codeSlice";
import type {
  AgentCodeGenerationResponse,
  AgentCodingLanguage,
} from "@/types/agentCoding";
import type { ProblemData } from "@/models/problem";
import { getProblemDetail } from "@/services/Problem/getProblemDetail";
import { submitSolution } from "@/services/Submission/submitSolution";

type TestStatus = "pending" | "running" | "passed" | "failed" | "error";

interface TestCaseItem {
  input: string;
  output: string;
  status: TestStatus;
}

const langLabels: Record<AgentCodingLanguage, string> = {
  cpp: "C++",
  python: "Python",
  java: "Java",
  go: "Go",
  nodejs: "Node.js",
};

const submitLanguageMap: Record<AgentCodingLanguage, string> = {
  cpp: "Cpp17",
  python: "Python3_12",
  java: "Java17",
  go: "Go1_22",
  nodejs: "Nodejs22",
};

export default function ProblemAgentPage() {
  const nav = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const { isAuthenticated } = useSelector((store: RootState) => store.auth);
  const codeFileObjectArray = useSelector(
    (store: RootState) => store.code.codeFileObjectArray
  );
  const [problemData, setProblemData] = useState<ProblemData | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [pseudocode, setPseudocode] = useState("");
  const [language, setLanguage] = useState<AgentCodingLanguage>("cpp");
  const [suggestions, setSuggestions] = useState("");
  const [stdinCode, setStdinCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [testCases, setTestCases] = useState<TestCaseItem[]>([]);
  const [runningTests, setRunningTests] = useState(false);
  const [newCaseInput, setNewCaseInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasTestCases = useMemo(() => {
    if (!problemData) return true;
    const n = Number(problemData.content?.info?.test_case_number ?? 0);
    return n > 0;
  }, [problemData]);

  const selectedProblemId = id || "";
  const editorPid = `agent-${selectedProblemId || "temp"}`;
  const editorCode =
    codeFileObjectArray.find((item: { pid: string; codeFile: string }) => item.pid === editorPid)?.codeFile || "";

  const problemDescriptionForAgent = useMemo(() => {
    if (!problemData) return "无题目描述";
    const content = problemData.content;
    return [
      content.description || "",
      content.input ? `输入格式:\n${content.input}` : "",
      content.output ? `输出格式:\n${content.output}` : "",
      content.hint ? `提示:\n${content.hint}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");
  }, [problemData]);

  useEffect(() => {
    dispatch(
      setCodeLanguage(
        language === "cpp"
          ? "Cpp17"
          : language === "python"
            ? "Python3_12"
            : language === "java"
              ? "Java17"
              : language === "go"
                ? "Go1_22"
                : "Nodejs22"
      )
    );
  }, [dispatch, language]);

  const extractCodeText = (raw: string): string => {
    if (!raw) return "";
    const codeBlockMatch = raw.match(/```[\w+]*\n([\s\S]*?)```/);
    return codeBlockMatch ? codeBlockMatch[1].trim() : raw.trim();
  };

  useEffect(() => {
    const loadProblemDetail = async () => {
      if (!selectedProblemId) return;
      setLoadingDetail(true);
      dispatch(setCodeFile({ pid: editorPid, codeFile: "" }));
      setSuggestions("");
      setStdinCode("");
      setTestCases([]);
      try {
        const result = await getProblemDetail(selectedProblemId);
        if (result.code !== 0 || !result.data) {
          toast.error(result.message || "获取题目详情失败");
          return;
        }
        setProblemData(result.data);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "获取题目详情失败");
      } finally {
        setLoadingDetail(false);
      }
    };
    loadProblemDetail();
  }, [dispatch, editorPid, selectedProblemId]);


  const handleGenerateCode = async () => {
    if (!pseudocode.trim()) return;
    setIsGenerating(true);
    dispatch(setCodeFile({ pid: editorPid, codeFile: "" }));
    setSuggestions("");
    setStdinCode("");
    setTestCases([]);
    try {
      const result = await agentCodingApi.generateCode(
        problemDescriptionForAgent,
        pseudocode,
        language
      );
      if (typeof result === "string") {
        dispatch(setCodeFile({ pid: editorPid, codeFile: extractCodeText(result) }));
        return;
      }
      const payload = result as AgentCodeGenerationResponse;
      dispatch(
        setCodeFile({
          pid: editorPid,
          codeFile: extractCodeText(String(payload.best_stdin_code || "")),
        })
      );
      setStdinCode((payload.stdin_code as string) || "");
      setSuggestions(
        (payload.suggestion as string) ||
          (payload.solution_understanding as string) ||
          ""
      );
      if (Array.isArray(payload.test_cases)) {
        setTestCases(
          payload.test_cases.map((input) => ({
            input,
            output: "",
            status: "pending",
          }))
        );
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "代码生成失败");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRunAllTests = async () => {
    if ((!editorCode.trim() && !stdinCode) || testCases.length === 0) return;
    setRunningTests(true);
    const code = editorCode.trim() || extractCodeText(stdinCode);
    const stdinInputs = testCases.map((tc) => tc.input);
    setTestCases((prev) =>
      prev.map((tc) => ({
        ...tc,
        output: "",
        status: "running",
      }))
    );
    try {
      const result = await agentCodingApi.runCode(
        selectedProblemId,
        code,
        language,
        stdinInputs
      );
      const rows = Array.isArray(result?.results) ? result.results : [result];
      setTestCases((prev) =>
        prev.map((tc, index) => {
          const row = rows[index] || {};
          const stdout =
            row?.stdout ??
            row?.result?.stdout ??
            row?.data?.stdout ??
            row?.result?.data?.stdout ??
            "";
          const stderr =
            row?.stderr ??
            row?.result?.stderr ??
            row?.data?.stderr ??
            row?.result?.data?.stderr ??
            "";
          const status =
            row?.status ??
            row?.result?.status ??
            row?.data?.status ??
            row?.result?.data?.status ??
            "";
          if (status === "Success" || status === "Accepted") {
            return { ...tc, output: String(stdout || "(无输出)"), status: "passed" };
          }
          if (status === "RuntimeError" || status === "CompileError") {
            return {
              ...tc,
              output: String(stderr || stdout || status || "运行错误"),
              status: "error",
            };
          }
          return {
            ...tc,
            output: String(stderr || stdout || status || "运行失败"),
            status: "failed",
          };
        })
      );
    } catch (error) {
      const msg = error instanceof Error ? error.message : "运行测试失败";
      setTestCases((prev) =>
        prev.map((tc) => ({
          ...tc,
          output: msg,
          status: "error",
        }))
      );
      toast.error(msg);
    } finally {
      setRunningTests(false);
    }
  };

  const addTestCase = () => {
    if (!newCaseInput.trim()) return;
    setTestCases((prev) => [
      ...prev,
      { input: newCaseInput.trim(), output: "", status: "pending" },
    ]);
    setNewCaseInput("");
  };

  const removeTestCase = (index: number) => {
    setTestCases((prev) => prev.filter((_, i) => i !== index));
  };

  const copyCode = async () => {
    if (!editorCode.trim()) return;
    try {
      await navigator.clipboard.writeText(editorCode);
      toast.success("代码已复制到剪贴板");
    } catch {
      toast.error("复制失败");
    }
  };

  const handleSubmit = async () => {
    if (!hasTestCases) {
      toast.error("当前题目没有测试点，请先在左侧点击“评测配置”完善测试数据");
      return;
    }
    if (!selectedProblemId || !editorCode.trim()) {
      toast.error("请先生成代码后再提交");
      return;
    }
    const code = editorCode.trim();
    if (!code) {
      toast.error("提交代码不能为空");
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await submitSolution({
        pid: selectedProblemId,
        language: submitLanguageMap[language],
        code,
      });
      const submissionNo = result?.data?.submissionNo || result?.data?.submission_no;
      if (submissionNo) {
        nav(
          `/submission/${submissionNo}?title=${encodeURIComponent(
            problemData?.title || ""
          )}`
        );
        return;
      }
      toast.error(result?.message || "提交失败");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "提交失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{`AI 编程练习 #${selectedProblemId || "-"} - SeuOJ`}</title>
      </Helmet>
      <div className="h-[calc(100vh-5.5rem)] w-full max-w-full overflow-x-hidden overflow-y-hidden flex flex-col lg:flex-row bg-white border-t border-gray-200 relative">
        <div className="w-full lg:w-1/2 h-full max-w-full min-w-0 flex-shrink overflow-x-hidden overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent border-r border-gray-200">
          {loadingDetail ? (
            <div className="p-6 text-sm text-muted-foreground">题目加载中...</div>
          ) : problemData ? (
            <ProblemDetailInfo
              problem={problemData}
              isAuthenticated={isAuthenticated}
              practiceButtonLabel="传统练习"
              onPracticeClick={(pid) => nav(`/problemsLibrary/${pid}`)}
            />
          ) : (
            <div className="p-6 text-sm text-muted-foreground">题目不存在或加载失败</div>
          )}
        </div>

        <div className="w-full lg:w-1/2 h-full max-w-full min-w-0 flex-shrink overflow-x-hidden overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent bg-gray-50 p-4">
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">AI 伪代码生成</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  value={pseudocode}
                  onChange={(e) => setPseudocode(e.target.value)}
                  className="min-h-44 font-mono"
                  placeholder="输入伪代码，再点击生成代码"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {(Object.keys(langLabels) as AgentCodingLanguage[]).map((key) => (
                      <Button
                        key={key}
                        size="sm"
                        variant={language === key ? "default" : "outline"}
                        onClick={() => setLanguage(key)}
                      >
                        {langLabels[key]}
                      </Button>
                    ))}
                  </div>
                  <Button
                    onClick={handleGenerateCode}
                    disabled={isGenerating || !pseudocode.trim()}
                  >
                    {isGenerating ? "生成中..." : "生成代码"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">生成代码与测试</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyCode}
                      disabled={!editorCode.trim()}
                    >
                      复制代码
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSubmit}
                      disabled={!editorCode.trim() || isSubmitting || !hasTestCases}
                    >
                      {isSubmitting ? "提交中..." : "提交评测"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-[60vh] min-h-[320px] max-h-[640px] rounded-md border bg-white p-3">
                  <CodeEditor pid={editorPid} />
                </div>
                <ScrollArea className="h-28 rounded-md border bg-sky-50/50 p-3">
                  {suggestions ? (
                    <div className="prose prose-sm max-w-none">
                      <MarkdownRenderer>{suggestions}</MarkdownRenderer>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">暂无分析建议</p>
                  )}
                </ScrollArea>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <FlaskConical className="h-4 w-4 text-primary" />
                      测试用例 ({testCases.length})
                    </div>
                    <Button
                      size="sm"
                      onClick={handleRunAllTests}
                      disabled={
                        runningTests ||
                        (!editorCode.trim() && !stdinCode) ||
                        testCases.length === 0
                      }
                    >
                      <Play className="h-4 w-4 mr-1" />
                      {runningTests ? "运行中" : "运行全部"}
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Textarea
                      value={newCaseInput}
                      onChange={(e) => setNewCaseInput(e.target.value)}
                      placeholder="新增 stdin 用例"
                      className="min-h-16 text-xs font-mono"
                    />
                    <Button size="sm" onClick={addTestCase} className="self-end">
                      添加
                    </Button>
                  </div>
                  <ScrollArea className="h-48 rounded-md border bg-white p-2">
                    <div className="space-y-2">
                      {testCases.length === 0 && (
                        <p className="text-sm text-muted-foreground p-2">
                          生成代码后会自动填充测试用例
                        </p>
                      )}
                      {testCases.map((tc, index) => (
                        <div
                          key={index}
                          className="rounded-md border border-slate-200 bg-slate-50 p-2"
                        >
                          <div className="mb-1 flex items-center justify-between text-xs">
                            <span>用例 {index + 1}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{tc.status}</Badge>
                              <button onClick={() => removeTestCase(index)}>
                                <X className="h-3.5 w-3.5 text-slate-500" />
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <div className="text-muted-foreground mb-1">stdin</div>
                              <pre className="rounded border bg-white p-2 whitespace-pre-wrap break-all">
                                {tc.input || "(空)"}
                              </pre>
                            </div>
                            <div>
                              <div className="text-muted-foreground mb-1">stdout</div>
                              <pre className="rounded border bg-white p-2 whitespace-pre-wrap break-all">
                                {tc.output || "—"}
                              </pre>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
