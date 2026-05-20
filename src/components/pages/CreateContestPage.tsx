import React, { Suspense, lazy } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Loader2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  createContest,
  CreateContestRequest,
} from "@/services/Contest/createContest";
import { useSaveShortcut } from "@/hooks/useSaveShortcut";
import { useQueryClient } from "@tanstack/react-query";
import { MarkdownImageTextarea } from "@/components/common/MarkdownImageTextarea";

const MonacoEditor = lazy(() => import("@monaco-editor/react"));
const contestFormSchema = z
  .object({
    title: z.string().min(1, "标题不能为空"),
    subtitle: z.string().optional(),
    description: z.string().optional(),
    start_time: z.coerce.date(),
    end_time: z.coerce.date(),
    rule_type: z.enum(["ACM", "NOI", "IOI", "CUSTOM"]),
    is_public: z.boolean().default(false),
    hide_statistics: z.boolean().default(false),
    scoring_config: z.string().optional(),
    scoring_script: z.string().optional(),
  })
  .refine((data) => data.end_time > data.start_time, {
    message: "结束时间必须晚于开始时间",
    path: ["end_time"],
  });
type ContestFormValues = z.infer<typeof contestFormSchema>;
export default function CreateContestPage() {
  const nav = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const form = useForm<ContestFormValues>({
    resolver: zodResolver(contestFormSchema) as any,
    defaultValues: {
      title: "",
      subtitle: "",
      description: "",
      rule_type: "ACM",
      is_public: false,
      hide_statistics: false,
      scoring_config: "",
      scoring_script: "",
    },
  });
  const onSubmit: any = async (values: ContestFormValues) => {
    setIsSubmitting(true);
    try {
      const payload: CreateContestRequest = {
        title: values.title,
        description: values.description || "",
        subtitle: values.subtitle,
        start_time: format(values.start_time, "yyyy-MM-dd'T'HH:mm:ss"),
        end_time: format(values.end_time, "yyyy-MM-dd'T'HH:mm:ss"),
        rule_type: values.rule_type,
        is_public: values.is_public,
        hide_statistics: values.hide_statistics,
        scoring_config: values.scoring_config || undefined,
        scoring_script: values.scoring_script || undefined,
      };
      const res = await createContest(payload);
      if (res.code === 0) {
        toast.success("比赛创建成功");
        await queryClient.invalidateQueries({ queryKey: ["contestPage"] });
        if (res.data?.contest_id) {
          nav(`/contest/${res.data.contest_id}/edit`);
        } else {
          nav("/contest");
        }
      } else {
        toast.error(res.message || "创建失败");
      }
    } catch (error: unknown) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "创建请求发生错误");
    } finally {
      setIsSubmitting(false);
    }
  };
  useSaveShortcut(() => form.handleSubmit(onSubmit)(), !isSubmitting);
  return (
    <div className="container mx-auto py-10 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">创建新比赛</h1>
        <p className="text-muted-foreground mt-2">
          配置新比赛的基础信息，创建后可进一步管理题目和设置。
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>比赛标题</FormLabel>
                <FormControl>
                  <Input placeholder="请输入比赛标题" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="subtitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>副标题</FormLabel>
                <FormControl>
                  <Input placeholder="请输入副标题（可选）" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="start_time"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>开始时间</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "yyyy-MM-dd HH:mm:ss")
                          ) : (
                            <span>选择日期时间</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                      <div className="p-3 border-t">
                        <Input
                          type="time"
                          value={
                            field.value ? format(field.value, "HH:mm") : "00:00"
                          }
                          onChange={(e) => {
                            const [hours, minutes] = e.target.value
                              .split(":")
                              .map(Number);
                            const newDate = new Date(field.value || new Date());
                            newDate.setHours(hours);
                            newDate.setMinutes(minutes);
                            field.onChange(newDate);
                          }}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="end_time"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>结束时间</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "yyyy-MM-dd HH:mm:ss")
                          ) : (
                            <span>选择日期时间</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                      <div className="p-3 border-t">
                        <Input
                          type="time"
                          value={
                            field.value ? format(field.value, "HH:mm") : "00:00"
                          }
                          onChange={(e) => {
                            const [hours, minutes] = e.target.value
                              .split(":")
                              .map(Number);
                            const newDate = new Date(field.value || new Date());
                            newDate.setHours(hours);
                            newDate.setMinutes(minutes);
                            field.onChange(newDate);
                          }}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="rule_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>规则类型</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="选择比赛规则" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ACM">ACM</SelectItem>
                    <SelectItem value="NOI">NOI</SelectItem>
                    <SelectItem value="IOI">IOI</SelectItem>
                    <SelectItem value="CUSTOM">CUSTOM</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  不同的规则类型对应不同的判题和排名逻辑。
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {form.watch("rule_type") === "ACM" && (
            <FormField
              control={form.control}
              name="scoring_config"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>评分配置（JSON）</FormLabel>
                  <FormControl>
                    <div className="border rounded-md overflow-hidden">
                      <Suspense fallback={<div className="h-[150px] flex items-center justify-center text-muted-foreground">编辑器加载中...</div>}>
                        <MonacoEditor
                          height="150px"
                          language="json"
                          value={field.value ?? ""}
                          onChange={(val) => field.onChange(val ?? "")}
                          options={{
                            minimap: { enabled: false },
                            lineNumbers: "on",
                            scrollBeyondLastLine: false,
                            fontSize: 13,
                            tabSize: 2,
                          }}
                        />
                      </Suspense>
                    </div>
                  </FormControl>
                  <FormDescription>
                    可选。JSON 字符串，存储评分配置参数（如 {"{"}"penalty_minutes": 20{"}"}）。
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {form.watch("rule_type") === "CUSTOM" && (
            <FormField
              control={form.control}
              name="scoring_script"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>自定义评分脚本</FormLabel>
                  <FormControl>
                    <div className="border rounded-md overflow-hidden">
                      <Suspense fallback={<div className="h-[300px] flex items-center justify-center text-muted-foreground">编辑器加载中...</div>}>
                        <MonacoEditor
                          height="300px"
                          language="javascript"
                          value={field.value ?? ""}
                          onChange={(val) => field.onChange(val ?? "")}
                          options={{
                            minimap: { enabled: false },
                            lineNumbers: "on",
                            scrollBeyondLastLine: false,
                            fontSize: 13,
                            tabSize: 2,
                          }}
                        />
                      </Suspense>
                    </div>
                  </FormControl>
                    <FormDescription>
                      JavaScript 脚本代码，详情参考{" "}
                      <a
                        href="https://github.com/SEUAIG/seuoj-backend/blob/master/docs/custom_contest_script.md"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline"
                      >
                        自定义评分脚本文档
                      </a>
                    </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <div className="flex flex-row gap-8">
            <FormField
              control={form.control}
              name="is_public"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm flex-1">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>公开比赛</FormLabel>
                    <FormDescription>
                      公开比赛对所有用户可见，否则仅通过链接或邀请可见。
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hide_statistics"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm flex-1">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>隐藏统计</FormLabel>
                    <FormDescription>
                      开启后，普通用户无法查看题目统计信息。
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>详细描述</FormLabel>
                <FormControl>
                  <MarkdownImageTextarea
                    placeholder="请输入比赛详细描述（支持 Markdown）"
                    className="min-h-[200px]"
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => nav("/contest")}
            >
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              创建比赛
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
