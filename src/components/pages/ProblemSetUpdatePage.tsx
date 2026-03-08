import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import useQueryToGetProblemSetDetail from "@/hooks/useQueryToGetProblemSetDetail";
import { updateProblemSet } from "@/services/ProblemSet/updateProblemSet";
import { updateProblemSetProblemList } from "@/services/ProblemSet/updateProblemSetProblemList";
import ProblemListEditor, {
    ProblemListItem,
} from "@/components/bussiness/ProblemListEditor";

export default function ProblemSetUpdatePage() {
    const { id } = useParams();
    const nav = useNavigate();

    const { data, isLoading, isError } = useQueryToGetProblemSetDetail(id || "");

    // 基础信息表单
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    const [isUpdatingInfo, setIsUpdatingInfo] = useState(false);

    // 题目列表
    const [problemList, setProblemList] = useState<ProblemListItem[]>([]);
    const [isUpdatingProblems, setIsUpdatingProblems] = useState(false);

    // 用详情API的数据初始化表单
    useEffect(() => {
        if (data) {
            setTitle(data.title || "");
            setDescription(data.description || "");
            setIsPublic(data.is_public ?? false);
            if (data.problem_list) {
                setProblemList(
                    data.problem_list.map((p) => ({
                        pid: p.pid,
                        title: p.title,
                        order_id: p.sort_order,
                    }))
                );
            }
        }
    }, [data]);

    const handleUpdateInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        if (!title.trim()) {
            toast.error("标题不能为空");
            return;
        }
        setIsUpdatingInfo(true);
        try {
            const res = await updateProblemSet(id, {
                title: title.trim(),
                description: description.trim(),
                is_public: isPublic,
                problem_list: problemList.map((p) => ({
                    pid: p.pid,
                    title: p.title,
                    order_id: p.order_id,
                })),
            });
            if (res.code === 0 || res.code === 200) {
                toast.success("题单信息更新成功");
            } else {
                toast.error(res.message || "更新失败");
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "更新请求发生错误");
        } finally {
            setIsUpdatingInfo(false);
        }
    };

    const handleUpdateProblemList = async () => {
        if (!data?.problem_set_id) {
            toast.error("无法获取题单内部ID，请稍后重试");
            return;
        }
        setIsUpdatingProblems(true);
        try {
            const res = await updateProblemSetProblemList(data.problem_set_id, {
                problem_list: problemList.map((p) => ({
                    pid: p.pid,
                    title: p.title,
                    order_id: p.order_id,
                })),
            });
            if (res.code === 0 || res.code === 200) {
                toast.success("题目列表更新成功");
            } else {
                toast.error(res.message || "更新失败");
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "更新请求发生错误");
        } finally {
            setIsUpdatingProblems(false);
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto py-10 max-w-3xl space-y-6">
                <Skeleton className="h-12 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="container mx-auto py-10 max-w-3xl text-center text-muted-foreground">
                <div className="text-xl font-semibold mb-2">加载题单信息失败</div>
                <Button variant="outline" className="mt-4" onClick={() => nav(-1)}>
                    返回上一页
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 max-w-3xl">
            <Helmet>
                <title>编辑题单 - SeuOJ</title>
            </Helmet>
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" onClick={() => nav(-1)}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">编辑题单</h1>
                    <p className="text-muted-foreground mt-2">
                        修改题单基础信息和题目列表
                    </p>
                </div>
            </div>

            {/* 基础信息编辑 */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>基础信息</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpdateInfo} className="space-y-6">
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
                            <Label htmlFor="description">题单描述</Label>
                            <Textarea
                                id="description"
                                placeholder="请输入题单描述"
                                className="min-h-[150px]"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
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
                                    公开题单对所有用户可见。
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" disabled={isUpdatingInfo}>
                                {isUpdatingInfo && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                <Save className="mr-2 h-4 w-4" />
                                保存基础信息
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Separator className="my-6" />

            {/* 题目列表编辑 */}
            <Card>
                <CardHeader>
                    <CardTitle>题目列表管理</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <ProblemListEditor
                        problemList={problemList}
                        onChange={setProblemList}
                    />
                    <div className="flex justify-end">
                        <Button
                            onClick={handleUpdateProblemList}
                            disabled={isUpdatingProblems}
                        >
                            {isUpdatingProblems && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            <Save className="mr-2 h-4 w-4" />
                            保存题目列表
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
