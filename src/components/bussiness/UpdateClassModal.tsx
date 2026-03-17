import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
import { updateClass } from "@/services/Class/updateClass";
import { ClassItem } from "@/services/Class/getClassPage";

const formSchema = z.object({
  name: z.string().min(1, "班级名称不能为空"),
  description: z.string().optional().default(""),
  is_public: z.boolean().default(false),
});

type ClassFormValues = z.infer<typeof formSchema>;

interface UpdateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  classItem: ClassItem | null;
}

export default function UpdateClassModal({
  isOpen,
  onClose,
  classItem,
}: UpdateClassModalProps) {
  const queryClient = useQueryClient();

  const form = useForm<ClassFormValues>({
    resolver: zodResolver(formSchema),
    values: {
      name: classItem?.name || "",
      description: classItem?.description || "",
      is_public: classItem?.is_public || false,
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: ClassFormValues) => {
      if (!classItem) throw new Error("班级信息不存在");
      return updateClass(classItem.class_public_id, {
        name: values.name,
        description: values.description || "",
        is_public: values.is_public,
      });
    },
    onSuccess: (res) => {
      if (res.code === 0) {
        toast.success("班级更新成功");
        queryClient.invalidateQueries({ queryKey: ["classPage"] });
        onClose();
      } else {
        toast.error(res.message || "更新失败");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "更新请求发生错误");
    },
  });

  const onSubmit = (values: ClassFormValues) => {
    updateMutation.mutate(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>更新班级信息</DialogTitle>
          <DialogDescription>
            修改班级的基本信息，点击保存以提交更改。
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_public"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">公开班级</FormLabel>
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

            <div className="flex justify-end pt-4 space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={updateMutation.isPending}
              >
                取消
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                保存更改
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
