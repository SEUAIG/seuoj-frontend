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
}
// object 是弱类型 实际类型才是强类型
export default function TagSelector() {
  const { data, isLoading } = useQueryToGetTags();
  if (isLoading) {
    return null;
  }
  const { algorithm, source, time, special }: tagsData = data;
  return (
    <div className="flex flex-col h-[40vh] gap-4">
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
          <TagCategory groups={algorithm} />
        </TabsContent>
        <TabsContent
          value="source"
          className="flex-1 overflow-y-auto mt-2 pr-2"
        >
          <TagCategory groups={source} />
        </TabsContent>
        <TabsContent value="time" className="flex-1 overflow-y-auto mt-2 pr-2">
          <TagCategory groups={time} />
        </TabsContent>
        <TabsContent
          value="special"
          className="flex-1 overflow-y-auto mt-2 pr-2"
        >
          <TagCategory groups={special} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
