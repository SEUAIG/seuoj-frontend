import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// 定义表单验证 schema
const problemEditSchema = z.object({
  title: z.string().min(1, '题目标题不能为空'),
  description: z.string().min(1, '题目描述不能为空'),
  input: z.string().min(1, '输入格式不能为空'),
  output: z.string().min(1, '输出格式不能为空'),
  max_cpu_time_ms: z.string().min(1, 'CPU时间限制不能为空'),
  max_real_time_ms: z.string().min(1, '实际时间限制不能为空'),
  max_memory_byte: z.string().min(1, '内存限制不能为空'),
  max_stack_byte: z.string().min(1, '栈限制不能为空'),
  max_process_number: z.string().min(1, '进程数限制不能为空'),
  max_output_size: z.string().min(1, '输出大小限制不能为空'),
  test_case_number: z.string().min(1, '测试点数量不能为空'),
})

type ProblemEditValues = z.infer<typeof problemEditSchema>

interface ProblemEditFormProps {
  pid: string
}

export default function ProblemEditForm({ pid }: ProblemEditFormProps) {
  const form = useForm<ProblemEditValues>({
    resolver: zodResolver(problemEditSchema),
    defaultValues: {
      title: '',
      description: '',
      input: '',
      output: '',
      max_cpu_time_ms: '1000',
      max_real_time_ms: '2000',
      max_memory_byte: '134217728',
      max_stack_byte: '33554432',
      max_process_number: '1',
      max_output_size: '10000',
      test_case_number: '1',
    },
  })

  const { handleSubmit, control } = form

  // 暂时置空，后续添加前后端交互
  const onSubmit = (values: ProblemEditValues) => {
    console.log('提交的数据:', values)
    // TODO: 添加 API 调用
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 基本信息 */}
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>题目标题</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入题目标题" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>题目描述</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="请输入题目描述（支持 Markdown）"
                      className="min-h-[200px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="input"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>输入格式</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="请输入输入格式说明（支持 Markdown）"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="output"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>输出格式</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="请输入输出格式说明（支持 Markdown）"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* 评测配置 */}
        <Card>
          <CardHeader>
            <CardTitle>评测配置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={control}
                name="max_cpu_time_ms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPU时间限制 (ms)</FormLabel>
                    <FormControl>
                      <Input placeholder="1000" {...field} />
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
                      <Input placeholder="2000" {...field} />
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
                      <Input placeholder="134217728" {...field} />
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
                      <Input placeholder="33554432" {...field} />
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
                      <Input placeholder="1" {...field} />
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
                      <Input placeholder="10000" {...field} />
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
                      <Input placeholder="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* 提交按钮 */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline">
            取消
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            保存修改
          </Button>
        </div>
      </form>
    </Form>
  )
}