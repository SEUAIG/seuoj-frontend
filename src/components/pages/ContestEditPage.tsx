import React, { useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Loader2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import useQueryToGetContestDetail from "@/hooks/useQueryToGetContestDetail";
import {
  updateContest,
  UpdateContestRequest,
} from "@/services/Contest/updateContest";
import { updateContestProblemList } from "@/services/Contest/updateContestProblemList";
import { useQueryContestProblemListInEditPage } from "@/hooks/useQueryContestProblemListInEditPage";
import { ContestProblemOverviewInEditPage } from "@/services/Contest/getContestProblemListInEditPage";
import SortListTable from "../common/SortListTable";
import { useSaveShortcut } from "@/hooks/useSaveShortcut";
const contestFormSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  start_time: z.coerce.date(),
  end_time: z.coerce.date(),
  rule_type: z.enum(["ACM", "NOI", "IOI"]),
  is_public: z.boolean().default(false),
  hide_statistics: z.boolean().default(false),
});
type ContestFormValues = z.infer<typeof contestFormSchema>;
export default function ContestEditPage() {
  const { id } = useParams();
  const contestId = Number(id);
  const nav = useNavigate();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSavingPublic, setIsSavingPublic] = React.useState(false);
  const [isSavingHideStats, setIsSavingHideStats] = React.useState(false);
  const { data: contestDetail, isLoading: isFetchingDetail } =
    useQueryToGetContestDetail(contestId || 0);
  const { data: problemList, isLoading: isFetchingProblems } =
    useQueryContestProblemListInEditPage(contestId || 0);
  const [problems, setProblems] = React.useState<
    ContestProblemOverviewInEditPage[]
  >([]);
  useEffect(() => {
    if (problemList?.problem_list) {
      setProblems(
        [...problemList.problem_list].sort(
          (a, b) => a.sort_order - b.sort_order
        )
      );
    }
  }, [problemList]);
  const form = useForm<ContestFormValues>({
    resolver: zodResolver(contestFormSchema) as any,
    defaultValues: {
      title: "",
      subtitle: "",
      description: "",
      rule_type: "ACM",
      is_public: false,
      hide_statistics: false,
    },
  });

  useEffect(() => {
    if (contestDetail) {
      form.reset({
        title: contestDetail.title || "",
        subtitle: contestDetail.subtitle || "",
        description: contestDetail.description || "",
        start_time: contestDetail.start_time
          ? new Date(contestDetail.start_time)
          : undefined,
        end_time: contestDetail.end_time
          ? new Date(contestDetail.end_time)
          : undefined,
        rule_type: (contestDetail.rule_type as "NOI" | "IOI" | "ACM") || "ACM",
        is_public: contestDetail.is_public || false,
        hide_statistics: contestDetail.hide_statistics || false,
      });
    }
  }, [contestDetail, form]);
  const onSubmit = async (values: ContestFormValues) => {
    if (!contestId) return;
    setIsSubmitting(true);
    try {
      const payload: UpdateContestRequest = {
        ...values,
        start_time: values.start_time.toISOString(),
        end_time: values.end_time.toISOString(),
      };
      // 并行执行更新请求
      const updateInfoPromise = updateContest(contestId, payload);
      const problemPayload = {
        problem_list: problems.map((p, index) => ({
          pid: p.pid,
          sort_order: index + 1,
        })),
      };
      const updateProblemListPromise = updateContestProblemList(
        contestId,
        problemPayload
      );
      const [resInfo, resProblems] = await Promise.all([
        updateInfoPromise,
        updateProblemListPromise,
      ]);
      if (resInfo.code === 0 && resProblems.code === 0) {
        toast.success("比赛信息及题目列表更新成功");
        nav(`/contest/${contestId}`);
      } else {
        const errorMsg = [];
        if (resInfo.code !== 200 && resInfo.code !== 0)
          errorMsg.push(`基本信息: ${resInfo.message}`);
        if (resProblems.code !== 200 && resProblems.code !== 0)
          errorMsg.push(`题目列表: ${resProblems.message}`);
        toast.error(`更新失败: ${errorMsg.join("; ")}`);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "更新请求发生错误");
    } finally {
      setIsSubmitting(false);
    }
  };

  useSaveShortcut(() => form.handleSubmit(onSubmit)(), !isSubmitting);

  if (isFetchingDetail) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  return (
    <div className="container mx-auto py-10 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">编辑比赛信息</h1>
        <p className="text-muted-foreground mt-2">
          更新比赛的基础配置信息，包括时间、规则和可见性设置。
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
                        onSelect={(date) => {
                          if (!date) {
                            field.onChange(date);
                            return;
                          }
                          const newDate = new Date(date);
                          if (field.value) {
                            newDate.setHours(field.value.getHours());
                            newDate.setMinutes(field.value.getMinutes());
                            newDate.setSeconds(field.value.getSeconds());
                          }
                          field.onChange(newDate);
                        }}
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
                        onSelect={(date) => {
                          if (!date) {
                            field.onChange(date);
                            return;
                          }
                          const newDate = new Date(date);
                          if (field.value) {
                            newDate.setHours(field.value.getHours());
                            newDate.setMinutes(field.value.getMinutes());
                            newDate.setSeconds(field.value.getSeconds());
                          }
                          field.onChange(newDate);
                        }}
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
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="选择比赛规则" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ACM">ACM</SelectItem>
                    <SelectItem value="NOI">NOI</SelectItem>
                    <SelectItem value="IOI">IOI</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  不同的规则类型对应不同的判题和排名逻辑。
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-row gap-8">
            <FormField
              control={form.control}
              name="is_public"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm flex-1">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      disabled={isSavingPublic}
                      onCheckedChange={async (checked) => {
                        const newValue = !!checked;
                        field.onChange(newValue);
                        setIsSavingPublic(true);
                        try {
                          const res = await updateContest(contestId, { is_public: newValue });
                          if (res.code !== 0 && res.code !== 200) {
                            throw new Error(res.message || "更新失败");
                          }
                          toast.success("公开状态已更新");
                        } catch (error: any) {
                          field.onChange(!newValue);
                          toast.error(error.message || "更新失败");
                        } finally {
                          setIsSavingPublic(false);
                        }
                      }}
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
                      disabled={isSavingHideStats}
                      onCheckedChange={async (checked) => {
                        const newValue = !!checked;
                        field.onChange(newValue);
                        setIsSavingHideStats(true);
                        try {
                          const res = await updateContest(contestId, { hide_statistics: newValue });
                          if (res.code !== 0 && res.code !== 200) {
                            throw new Error(res.message || "更新失败");
                          }
                          toast.success("统计显示设置已更新");
                        } catch (error: any) {
                          field.onChange(!newValue);
                          toast.error(error.message || "更新失败");
                        } finally {
                          setIsSavingHideStats(false);
                        }
                      }}
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
                  <Textarea
                    placeholder="请输入比赛详细描述（支持 Markdown）"
                    className="min-h-[200px]"
                    {...field}
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
              onClick={() => nav(`/contest/${contestId}`)}
            >
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              保存更改
            </Button>
          </div>
        </form>
      </Form>

      <div className="mt-12 space-y-6">
        <div>
          <h2 className="text-2xl font-bold">题目列表</h2>
          <p className="text-muted-foreground mt-2">当前比赛包含的题目列表。</p>
        </div>
        <SortListTable
          problems={problems}
          isFetching={isFetchingProblems}
          setProblems={setProblems}
        />
      </div>
    </div>
  );
}
