import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { createProblemSet } from "@/services/ProblemSet/createProblemSet";

export default function ProblemSetCreatePage() {
    const nav = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [title, setTitle] = useState("");
    const [discription, setDiscription] = useState("");
    const [isPublic, setIsPublic] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            toast.error("标题不能为空");
            return;
        }
        setIsSubmitting(true);
        try {
            const res = await createProblemSet({
                title: title.trim(),
                discription: discription.trim(),
                is_public: isPublic ? "true" : "false",
            });
            if (res.code === 0 || res.code === 200) {
                toast.success("题单创建成功");
                nav("/problemset");
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

    return (
        <div className="container mx-auto py-10 max-w-3xl">
            <Helmet>
                <title>创建题单 - SeuOJ</title>
            </Helmet>
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" onClick={() => nav(-1)}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">创建新题单</h1>
                    <p className="text-muted-foreground mt-2">
                        配置新题单的基础信息，创建后可进一步管理题目列表。
                    </p>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>基础信息</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">题单标题</Label>
                            <Input
                                id="title"
                                placeholder="请输入题单标题"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="discription">题单描述</Label>
                            <Textarea
                                id="discription"
                                placeholder="请输入题单描述（可选）"
                                className="min-h-[150px]"
                                value={discription}
                                onChange={(e) => setDiscription(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center space-x-3 rounded-md border p-4 shadow-sm">
                            <Switch
                                id="is_public"
                                checked={isPublic}
                                onCheckedChange={setIsPublic}
                            />
                            <div className="space-y-0.5">
                                <Label htmlFor="is_public">公开题单</Label>
                                <p className="text-sm text-muted-foreground">
                                    公开题单对所有用户可见，私有题单仅创建者可见。
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => nav("/problemset")}
                            >
                                取消
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                创建题单
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
