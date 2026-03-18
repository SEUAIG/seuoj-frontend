import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createClass, CreateClassRequest } from "@/services/Class/createClass";

const formSchema = z.object({
  name: z.string().min(1, "班级名称不能为空"),
  description: z.string().optional(),
  is_public: z.boolean().default(false),
});

type ClassFormValues = z.infer<typeof formSchema>;

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateClassModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateClassModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ClassFormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: "",
      description: "",
      is_public: false,
    },
  });

  const onSubmit: any = async (values: ClassFormValues) => {
    setIsSubmitting(true);
    try {
      const payload: CreateClassRequest = {
        name: values.name,
        description: values.description,
        is_public: values.is_public,
      };

      const res = await createClass(payload);

      if (res.code === 0) {
        toast.success("班级创建成功");
        form.reset();
        onSuccess();
        onClose();
      } else {
        toast.error(res.message || "创建失败");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "创建请求发生错误");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>创建新班级</DialogTitle>
          <DialogDescription>
            创建一个新的班级，方便管理学生和布置作业。
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>班级名称</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入班级名称" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>班级描述</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="请输入班级描述（可选）"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    简要描述该班级的用途、教学内容等。
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_public"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">公开班级</FormLabel>
                    <FormDescription className="text-xs">
                      公开班级对所有用户可见，私有班级仅邀请可见。
                    </FormDescription>
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

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                取消
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                立即创建
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
