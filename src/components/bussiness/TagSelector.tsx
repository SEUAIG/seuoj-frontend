import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import useQueryToGetTags from "@/hooks/useQueryToGetTags";
import TagCategory from "./TagCategory";
import SelectedTags from "./SelectedTags";
interface tagsData {
  algorithm: tagItem[];
  time: tagItem[];
  source: tagItem[];
  special: tagItem[];
}
export interface tagItem {
  group_name: string | null;
  tags: Tag[];
}
export interface Tag {
  tag_id: number;
  tag_name: string;
  from?: "algorithm" | "source" | "time" | "special";
}
// object 是弱类型 实际类型才是强类型
type TagSelectorProps = {
  className?: string;
};
export default function TagSelector({ className }: TagSelectorProps) {
  const { data, isLoading, isError } = useQueryToGetTags();
  if (isLoading || isError || !data) {
    return null;
  }
  const { algorithm, source, time, special }: tagsData = data;
  return (
    <div className={`flex flex-col h-[60vh] gap-4 ${className || ""}`}>
      <div className="flex-none">
        <SelectedTags />
      </div>
      <Tabs
        defaultValue="algorithm"
        className="flex-1 flex flex-col min-h-0 w-full"
      >
        <TabsList className="grid w-full grid-cols-4 flex-none">
          <TabsTrigger value="algorithm">算法</TabsTrigger>
          <TabsTrigger value="source">来源</TabsTrigger>
          <TabsTrigger value="time">时间</TabsTrigger>
          <TabsTrigger value="special">特殊题目</TabsTrigger>
        </TabsList>
        <TabsContent
          value="algorithm"
          className="flex-1 overflow-y-auto mt-2 pr-2"
        >
          <TagCategory groups={algorithm} category="algorithm" />
        </TabsContent>
        <TabsContent
          value="source"
          className="flex-1 overflow-y-auto mt-2 pr-2"
        >
          <TagCategory groups={source} category="source" />
        </TabsContent>
        <TabsContent value="time" className="flex-1 overflow-y-auto mt-2 pr-2">
          <TagCategory groups={time} category="time" />
        </TabsContent>
        <TabsContent
          value="special"
          className="flex-1 overflow-y-auto mt-2 pr-2"
        >
          <TagCategory groups={special} category="special" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
