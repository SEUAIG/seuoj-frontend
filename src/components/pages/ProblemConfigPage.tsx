import React, { useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { api } from "@/services/api/axios";
import { toast } from "sonner";
import { RefreshCw, Save } from "lucide-react";
type ConfigType = "META" | "CASE";
export default function ProblemConfigPage() {
  const { id } = useParams();
  const [activeType, setActiveType] = useState<ConfigType>("META");
  const [configText, setConfigText] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fetchConfig = useCallback(
    async (type: ConfigType) => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await api.get(`/api/problem/config/${id}`, {
          params: { type },
        });
        const result = res.data;
        if (result?.code !== 0 && result?.code !== 200) {
          throw new Error(result?.message || "加载配置失败");
        }
        setConfigText(result?.data?.config || "");
      } catch (error) {
        const message = error instanceof Error ? error.message : "加载配置失败";
        toast.error(message, { position: "top-center" });
      } finally {
        setLoading(false);
      }
    },
    [id]
  );
  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const res = await api.put(`/api/problem/config/${id}`, configText, {
        params: { type: activeType },
        headers: { "Content-Type": "text/plain" },
      });
      const result = res.data;
      if (result?.code !== 0 && result?.code !== 200) {
        throw new Error(result?.message || "保存失败");
      }
      toast.success("保存成功", { position: "top-center" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "保存失败";
      toast.error(message, { position: "top-center" });
    } finally {
      setSaving(false);
    }
  };
  useEffect(() => {
    fetchConfig(activeType);
  }, [activeType, fetchConfig]);
  return (
    <div className="w-4/5 mx-auto py-6">
      <Helmet>
        <title>{`题目配置 #${id} - SeuOJ`}</title>
      </Helmet>
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-bold">题目配置 #{id}</h1>
        <p className="text-sm text-muted-foreground">
          直接编辑配置源文件，保存后全量覆盖。
        </p>
      </div>
      <div className="space-y-4">
        <Alert className="bg-white/80">
          <AlertTitle>操作说明</AlertTitle>
          <AlertDescription>
            META 与 CASE 为两份独立配置，保存时只覆盖当前类型。
          </AlertDescription>
        </Alert>
        <Card className="border shadow-sm bg-white/80">
          <CardHeader className="border-b bg-muted/30">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg font-semibold">
                  配置文件
                </CardTitle>
                <div className="text-xs text-muted-foreground">
                  当前类型：{activeType}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchConfig(activeType)}
                  disabled={loading}
                >
                  <RefreshCw />
                  重新加载
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  <Save />
                  保存
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <Tabs
              value={activeType}
              onValueChange={(value) => setActiveType(value as ConfigType)}
              className="space-y-3"
            >
              <TabsList className="w-fit">
                <TabsTrigger value="META">META</TabsTrigger>
                <TabsTrigger value="CASE">CASE</TabsTrigger>
              </TabsList>
            </Tabs>
            <Textarea
              value={configText}
              onChange={(e) => setConfigText(e.target.value)}
              placeholder="配置内容为空"
              className="min-h-[480px] font-mono text-xs bg-background/60"
              disabled={loading || saving}
            />
            <div className="text-xs text-muted-foreground">
              字符数：{configText.length}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
