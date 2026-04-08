import React, { useEffect, useRef, useState } from "react";
import { useFieldArray, useForm, type FieldErrors } from "react-hook-form";
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
import TagSelector from "./TagSelector";
import { useDispatch, useSelector } from "react-redux";
import { addTag, clearTags } from "@/features/Tags/tagsSlice";
import type { AppDispatch, RootState } from "@/app/store";
import { api } from "@/services/api/axios";
import { toast } from "sonner";
import { getTags } from "@/services/getTags";
import { updateProblem, uploadProblemTestcases } from "@/services/problemEdit";
import { createProblem } from "@/services/Problem/createProblem";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";

const exampleSchema = z.object({
  in: z.string().min(1, "示例输入不能为空"),
  ans: z.string().optional(),
  description: z.string().optional(),
});
const problemEditSchema = z.object({
  pid: z.string().optional(),
  title: z.string().min(1, "题目标题不能为空"),
  is_public: z.boolean().default(true),
  description: z.string().min(1, "题目描述不能为空"),
  input: z.string().min(1, "输入格式不能为空"),
  output: z.string().min(1, "输出格式不能为空"),
  hint: z.string().optional(),
  example: z.array(exampleSchema).min(1, "至少添加一个示例"),
});
type ProblemEditValues = z.infer<typeof problemEditSchema>;
interface ProblemEditFormProps {
  pid?: string;
}
export default function ProblemEditForm({ pid = "" }: ProblemEditFormProps) {
  const isCreateMode = !pid;
  const dispatch = useDispatch<AppDispatch>();
  const { tags } = useSelector((state: RootState) => state.tags);
  const nav = useNavigate();
  const isSettingInitialTags = useRef(false);
  const form = useForm<ProblemEditValues>({
    resolver: zodResolver(problemEditSchema) as any,
    defaultValues: {
      pid: "",
      title: "",
      is_public: true,
      description: "",
      input: "",
      output: "",
      hint: "",
      example: [
        {
          in: "",
          ans: "",
          description: "",
        },
      ],
    },
  });
  useEffect(() => {
    dispatch(clearTags());
  }, [dispatch]);
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
        const examplesRaw = Array.isArray(content.example)
          ? content.example
          : [];
        const normalizedExamples = examplesRaw.map(
          (item: { in?: string; ans?: string; description?: string }) => ({
            in: item.in || "",
            ans: item.ans || "",
            description: item.description || "",
          })
        );
        form.reset({
          pid: data.pid || "",
          title: data.title || "",
          is_public: data.is_public ?? true,
          description: content.description || "",
          input: content.input || "",
          output: content.output || "",
          hint: content.hint || "",
          example: normalizedExamples,
        });
        isSettingInitialTags.current = true;
        dispatch(clearTags());
        let tagIds: number[] = [];
        const tagsRaw = data.tags || content.tags || [];
        const nameTags = Array.isArray(tagsRaw)
          ? (tagsRaw.filter((item) => typeof item === "string") as string[])
          : [];
        if (nameTags.length > 0) {
          const allTags = await getTags();
          const flatten: { tag_id: number; tag_name: string }[] = [];
          ["algorithm", "source", "time", "special"].forEach((key) => {
            const groups = allTags?.[key] || [];
            groups.forEach(
              (group: { tags?: { tag_id: number; tag_name: string }[] }) => {
                if (Array.isArray(group.tags)) {
                  flatten.push(...group.tags);
                }
              }
            );
          });
          const nameMap = new Map(flatten.map((t) => [t.tag_name, t.tag_id]));
          nameTags.forEach((name) => {
            const id = nameMap.get(name);
            if (id !== undefined) {
              dispatch(addTag({ tag_id: id, tag_name: name }));
              tagIds.push(id);
            }
          });
        }
        isSettingInitialTags.current = false;
      } catch (error) {
        isSettingInitialTags.current = false;
        const message = error instanceof Error ? error.message : "加载题目失败";
        toast.error(message, { position: "top-center" });
      }
    };
    fetchProblem();
  }, [pid, dispatch, form]);
  const { handleSubmit, control, formState, setFocus } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "example",
  });

  // 暂时置空，后续添加前后端交互
  const onSubmit = async (values: ProblemEditValues) => {
    const tagIds = tags.map((item: { tag_id: number }) => item.tag_id);

    if (isCreateMode) {
      if (!values.pid) {
        form.setError("pid", { message: "PID不能为空" });
        return;
      }
      try {
        const res = await createProblem({
          pid: values.pid,
          title: values.title,
          is_public: values.is_public ?? true,
          tags: tagIds,
          description: values.description,
          input: values.input,
          output: values.output,
          example: values.example.map((item) => ({
            in: item.in,
            ans: item.ans || null,
            description: item.description || null,
          })),
          hint: values.hint || "",
        });
        if (res.code === 0) {
          toast.success("创建成功");
          nav(`/problemsLibrary/${res.data.pid}/judgeConfig`);
        } else {
          toast.error(res.message || "创建失败");
        }
      } catch (error: any) {
        toast.error(error.message || "创建请求发生错误");
      }
      return;
    }

    const dirty = formState.dirtyFields;
    const requestPayload = {
      pid,
      title: dirty.title ? values.title : null,
      description: dirty.description ? values.description : null,
      input: dirty.input ? values.input : null,
      output: dirty.output ? values.output : null,
      example: values.example.map((item) => ({
        in: item.in,
        ans: item.ans || null,
        description: item.description || null,
      })),
      tags: tagIds,
    };

    const updateProblemRequest = async () => {
      const result = await updateProblem(requestPayload);
      if (
        result?.code !== undefined &&
        result.code !== 0 &&
        result.code !== 200
      ) {
        throw new Error(result.message || "更新失败");
      }
    };
    try {
      await updateProblemRequest();
      toast.success("更新成功", { position: "top-center" });
      nav(`/problemsLibrary/${pid}/judgeConfig`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "更新失败";
      toast.error(message, { position: "top-center" });
    }
  };
  const findFirstError = (
    error: unknown,
    prefix = ""
  ): { path: string; message?: string } | null => {
    if (!error || typeof error !== "object") return null;
    if ("message" in (error as { message?: unknown })) {
      const msg = (error as { message?: unknown }).message;
      if (typeof msg === "string") {
        return { path: prefix, message: msg };
      }
    }
    if (Array.isArray(error)) {
      for (let i = 0; i < error.length; i += 1) {
        const next = findFirstError(
          error[i],
          `${prefix}.${i}`.replace(/^\./, "")
        );
        if (next) return next;
      }
      return null;
    }
    const record = error as Record<string, unknown>;
    for (const key of Object.keys(record)) {
      const next = findFirstError(
        record[key],
        `${prefix}.${key}`.replace(/^\./, "")
      );
      if (next) return next;
    }
    return null;
  };
  const onInvalid = (errors: FieldErrors<ProblemEditValues>) => {
    const first = findFirstError(errors);
    if (first?.path) {
      setFocus(first.path as keyof ProblemEditValues);
    }
    toast.error(first?.message || "表单校验失败", { position: "top-center" });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit as any, onInvalid)}
        className="space-y-8"
      >
        {/* 基本信息 */}
        <Card className="border shadow-sm bg-white/80 backdrop-blur">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="text-lg font-semibold">基本信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            {isCreateMode && (
              <FormField
                control={control as any}
                name="pid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>题目ID</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input
                          placeholder="请输入题目ID"
                          className="bg-background/50 flex-1"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={async () => {
                            try {
                              const res = await api.get("/api/problem/next_id");
                              if (res.data.code === 0) {
                                field.onChange(res.data.data.next_pid);
                              } else {
                                toast.error(res.data.message || "获取失败");
                              }
                            } catch (e: any) {
                              toast.error(e.message || "获取请求发生错误");
                            }
                          }}
                        >
                          自动获取
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={control as any}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>题目标题</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="请输入题目标题"
                      className="bg-background/50"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control as any}
              name="is_public"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">公开题目</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      公开后所有用户可见
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={control as any}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>题目描述</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="请输入题目描述（支持 Markdown）"
                      className="min-h-[200px] bg-background/50"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control as any}
              name="input"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>输入格式</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="请输入输入格式说明（支持 Markdown）"
                      className="min-h-[100px] bg-background/50"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control as any}
              name="output"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>输出格式</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="请输入输出格式说明（支持 Markdown）"
                      className="min-h-[100px] bg-background/50"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control as any}
              name="hint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>提示</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="请输入提示（支持 Markdown）"
                      className="min-h-[80px] bg-background/50"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        <Card className="border shadow-sm bg-white/80 backdrop-blur">
          <CardHeader className="border-b bg-muted/30">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-lg font-semibold">示例</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ in: "", ans: "", description: "" })}
                >
                  新增示例
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {fields.map((item, index) => (
              <div
                key={item.id}
                className="rounded-md border bg-muted/10 p-4 space-y-4"
              >
                <div className="flex items-center justify-between gap-3 text-sm font-medium text-muted-foreground">
                  <span>示例 {index + 1}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={fields.length <= 1}
                    onClick={() => remove(index)}
                  >
                    删除
                  </Button>
                </div>
                <FormField
                  control={control as any}
                  name={`example.${index}.in`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>示例输入</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="请输入示例输入"
                          className="min-h-[80px] bg-background/50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control as any}
                  name={`example.${index}.ans`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>示例输出</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="请输入示例输出（可空）"
                          className="min-h-[80px] bg-background/50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control as any}
                  name={`example.${index}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>示例解析</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="请输入示例解析（可空）"
                          className="min-h-[80px] bg-background/50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-white/80 backdrop-blur">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="text-lg font-semibold">题目标签</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <TagSelector className="h-auto min-h-0" />
          </CardContent>
        </Card>

        {/* 提交按钮 */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="min-w-[96px]"
            onClick={() => nav(-1)}
          >
            取消
          </Button>
          <Button
            type="submit"
            disabled={formState.isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 min-w-[120px] shadow-sm"
          >
            {formState.isSubmitting ? "保存中..." : "保存修改"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
