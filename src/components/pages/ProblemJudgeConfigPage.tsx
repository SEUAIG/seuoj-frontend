import React, { useEffect, useState } from "react";
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
import { updateProblem, uploadProblemTestcases } from "@/services/problemEdit";
import TestcaseUploadCard from "@/components/bussiness/TestcaseUploadCard";
import { ArrowLeft } from "lucide-react";

const judgeConfigSchema = z.object({
  max_cpu_time_ms: z.string().min(1, "CPU时间限制不能为空"),
  max_real_time_ms: z.string().min(1, "实际时间限制不能为空"),
  max_memory_byte: z.string().min(1, "内存限制不能为空"),
  max_stack_byte: z.string().min(1, "栈限制不能为空"),
  max_process_number: z.string().min(1, "进程数限制不能为空"),
  max_output_size: z.string().min(1, "输出大小限制不能为空"),
  test_case_number: z.string().min(1, "测试点数量不能为空"),
  problem_type: z.enum(["Standard", "Interactive"]),
  checker_type: z.enum(["Standard", "Special"]),
  interactor_type: z.enum(["Source", "Binary"]).optional(),
  interactor_data: z.string().optional(),
  checker_file_type: z.enum(["Source", "Binary"]).optional(),
  checker_data: z.string().optional(),
});

type JudgeConfigValues = z.infer<typeof judgeConfigSchema>;

export default function ProblemJudgeConfigPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const pid = id || "";

  const [testcaseFile, setTestcaseFile] = useState<File | null>(null);
  const [testcaseFormat, setTestcaseFormat] = useState("");
  const [loading, setLoading] = useState(true);

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

  const form = useForm<JudgeConfigValues>({
    resolver: zodResolver(judgeConfigSchema) as any,
    defaultValues: {
      max_cpu_time_ms: "1000",
      max_real_time_ms: "2000",
      max_memory_byte: "134217728",
      max_stack_byte: "33554432",
      max_process_number: "1",
      max_output_size: "10000",
      test_case_number: "1",
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
        const res = await api.get(`/api/problem/${pid}`);
        const result = res.data;
        if (result.code !== 0 && result.code !== 200) {
          throw new Error(result.message || "加载题目失败");
        }
        const data = result.data || {};
        const content = data.content || data;
        const info = content.info || {};
        
        const checker = data.checker || content.checker || null;
        const interactor = data.interactor || content.interactor || null;
        
        const safeProblemType =
          info.problem_type === "Interactive" || info.problem_type === "Standard"
            ? info.problem_type
            : "Standard";
        const safeCheckerType =
          info.checker_type === "Special" || info.checker_type === "Standard"
            ? info.checker_type
            : "Standard";
        const safeInteractorType =
          interactor?.type === "Binary" || interactor?.type === "Source"
            ? interactor?.type
            : "Source";
        const safeCheckerFileType =
          checker?.type === "Binary" || checker?.type === "Source"
            ? checker?.type
            : "Source";

        form.reset({
          max_cpu_time_ms: String(info.max_cpu_time_ms ?? "1000"),
          max_real_time_ms: String(info.max_real_time_ms ?? "2000"),
          max_memory_byte: String(info.max_memory_byte ?? "134217728"),
          max_stack_byte: String(info.max_stack_byte ?? "33554432"),
          max_process_number: String(info.max_process_number ?? "1"),
          max_output_size: String(info.max_output_size ?? "10000"),
          test_case_number: String(info.test_case_number ?? "1"),
          problem_type: safeProblemType,
          checker_type: safeCheckerType,
          interactor_type: safeInteractorType,
          interactor_data: interactor?.data || "",
          checker_file_type: safeCheckerFileType,
          checker_data: checker?.data || "",
        });
      } catch (error: any) {
        toast.error(error.message || "加载题目信息失败");
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [pid, form]);

  const { handleSubmit, control, formState, setFocus } = form;
  const problemType = form.watch("problem_type");
  const checkerType = form.watch("checker_type");

  const onSubmit = async (values: JudgeConfigValues) => {
    const dirty = formState.dirtyFields;
    const infoDirty = Boolean(
      dirty.max_cpu_time_ms ||
        dirty.max_real_time_ms ||
        dirty.max_memory_byte ||
        dirty.max_stack_byte ||
        dirty.max_process_number ||
        dirty.max_output_size ||
        dirty.problem_type ||
        dirty.checker_type
    );
    const checkerTouched = Boolean(
      dirty.checker_type || dirty.checker_file_type || dirty.checker_data
    );
    const interactorTouched = Boolean(
      dirty.problem_type || dirty.interactor_type || dirty.interactor_data
    );

    const checkerPayload =
      values.checker_type === "Special"
        ? {
            type: values.checker_file_type || "Source",
            data: values.checker_data || "",
          }
        : null;
    const interactorPayload =
      values.problem_type === "Interactive"
        ? {
            type: values.interactor_type || "Source",
            data: values.interactor_data || "",
          }
        : null;

    const requestPayload = {
      pid,
      info: infoDirty
        ? {
            max_cpu_time_ms: dirty.max_cpu_time_ms ? Number(values.max_cpu_time_ms) : null,
            max_real_time_ms: dirty.max_real_time_ms ? Number(values.max_real_time_ms) : null,
            max_memory_byte: dirty.max_memory_byte ? Number(values.max_memory_byte) : null,
            max_stack_byte: dirty.max_stack_byte ? Number(values.max_stack_byte) : null,
            max_process_number: dirty.max_process_number ? Number(values.max_process_number) : null,
            max_output_size: dirty.max_output_size ? Number(values.max_output_size) : null,
            problem_type: dirty.problem_type ? values.problem_type : null,
            checker_type: dirty.checker_type ? values.checker_type : null,
          }
        : null,
      checker: checkerTouched ? checkerPayload : null,
      interactor: interactorTouched ? interactorPayload : null,
    };

    if (testcaseFile && !testcaseFormat) {
      toast.error("请先选择测试用例文件格式", { position: "top-center" });
      return;
    }

    const updateProblemRequest = async () => {
      // 只有在表单有修改时才发送更新请求
      if (!infoDirty && !checkerTouched && !interactorTouched) return;
      const result = await updateProblem(requestPayload);
      if (result?.code !== undefined && result.code !== 0 && result.code !== 200) {
        throw new Error(result.message || "配置更新失败");
      }
    };

    const uploadTestcasesRequest = async () => {
      if (!testcaseFile) return;
      const result = await uploadProblemTestcases(pid, testcaseFile, testcaseFormat);
      if (result?.code !== undefined && result.code !== 0 && result.code !== 200) {
        throw new Error(result.message || "测试用例上传失败");
      }
    };

    try {
      if (testcaseFile) {
        await Promise.all([updateProblemRequest(), uploadTestcasesRequest()]);
        toast.success("配置更新成功，测试用例已上传", { position: "top-center" });
        setTestcaseFile(null);
        setTestcaseFormat("");
      } else {
        await updateProblemRequest();
        toast.success("配置更新成功", { position: "top-center" });
      }
      nav(`/problemsLibrary/${pid}/config`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "更新失败";
      toast.error(message, { position: "top-center" });
    }
  };

  const findFirstError = (error: unknown, prefix = ""): { path: string; message?: string } | null => {
    if (!error || typeof error !== "object") return null;
    if ("message" in (error as { message?: unknown })) {
      const msg = (error as { message?: unknown }).message;
      if (typeof msg === "string") {
        return { path: prefix, message: msg };
      }
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
    if (first?.path) {
      setFocus(first.path as keyof JudgeConfigValues);
    }
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
            设置题目评测资源限制并上传测试用例
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-8">
          <TestcaseUploadCard
            file={testcaseFile}
            format={testcaseFormat}
            onFileChange={handleTestcaseFileChange}
            onFormatChange={setTestcaseFormat}
          />

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
                  name="test_case_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>测试点数量</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="1"
                          className="bg-muted/30 text-muted-foreground cursor-not-allowed"
                          disabled
                          {...field}
                        />
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
                          className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background/50 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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
                          className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background/50 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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
                    <div className="text-sm font-medium text-muted-foreground">
                      交互器
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={control}
                        name="interactor_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>类型</FormLabel>
                            <FormControl>
                              <select
                                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background/50 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                value={field.value}
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
                    <div className="text-sm font-medium text-muted-foreground">
                      检查器
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={control}
                        name="checker_file_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>类型</FormLabel>
                            <FormControl>
                              <select
                                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background/50 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                value={field.value}
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
              disabled={formState.isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 min-w-[120px] shadow-sm"
            >
              {formState.isSubmitting ? "保存中..." : "保存配置"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
