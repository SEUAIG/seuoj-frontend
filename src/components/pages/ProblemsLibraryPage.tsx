import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import TagSelector from "../bussiness/TagSelector";
import SelectedTags from "../bussiness/SelectedTags";
import { Search, RotateCcw, Filter } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/app/store";
import TagItem from "../bussiness/TagItem";
import { clearTags } from "@/features/Tags/tagsSlice";
import { useSearchQueryByKeyword } from "@/hooks/useSearchQueryByKeyword";
import { setTagIds, setTitle } from "@/features/ProblemList/problemListSlice";
export default function ProblemsLibraryPage() {
  const { tags } = useSelector((state: RootState) => state.tags);
  const dispatch = useDispatch();
  const [keyword, setKeyword] = useState("");
  const handleClearTags = () => {
    dispatch(clearTags());
    setKeyword("");
  };
  const { current, size, tag_ids, title } = useSelector(
    (state: RootState) => state.problemList
  );
  const { data, isLoading, refetch } = useSearchQueryByKeyword(
    current,
    size,
    title,
    tag_ids
  );
  // 调用函数传参数时位置要11对应
  const getTagIds = () => {
    const tag_idsArray = tags.map((item) => item.tag_id);
    return tag_idsArray;
  };
  useEffect(() => {
    dispatch(setTitle(keyword));
  }, [keyword]);
  useEffect(() => {
    dispatch(setTagIds(getTagIds()));
  }, [tags]);
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <Helmet>
        <title>题库 - SeuOJ</title>
      </Helmet>
      <div className="bg-card rounded-xl border shadow-sm p-6 space-y-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          <div className="flex items-center gap-3 min-w-fit">
            <span className="text-sm font-medium text-muted-foreground w-16 shrink-0">
              筛选条件
            </span>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[200px] justify-between text-muted-foreground font-normal bg-background/50"
                >
                  <span className="flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5" />
                    算法/来源/时间
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                  <DialogTitle>选择题目标签</DialogTitle>
                </DialogHeader>
                <TagSelector />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button>确认</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex items-center gap-3 flex-1">
            <span className="text-sm font-medium text-muted-foreground w-12 md:w-auto md:ml-4 shrink-0">
              关键词
            </span>
            <div className="relative flex-1 max-w-lg">
              <Input
                placeholder="算法、标题或题目编号"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full bg-background/50"
              />
            </div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-sm font-medium text-muted-foreground w-16 mt-1.5 shrink-0">
            已选择
          </span>
          <div className="flex-1 min-h-[2rem] flex items-center">
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, idx) => (
                  <TagItem
                    key={idx}
                    tag_id={tag.tag_id}
                    tag_name={tag.tag_name}
                    from={tag.from}
                  />
                ))}
              </div>
            ) : (
              <span className="text-sm text-muted-foreground/50 italic flex items-center h-full">
                暂无，可在上方进行多维度筛选
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            共计 <span className="font-semibold text-foreground">0</span> 条结果
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearTags}
              className="text-muted-foreground hover:text-destructive transition-colors"
            >
              <RotateCcw className="mr-2 h-3.5 w-3.5" />
              清除筛选
            </Button>
            <Button
              className="w-24 bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all active:scale-95"
              onClick={() => {
                refetch();
              }}
            >
              <Search className="mr-2 h-4 w-4" /> 搜索
            </Button>
          </div>
        </div>
      </div>
      <div className="mt-6">{/* TODO: Problem List Component */}</div>
    </div>
  );
}
