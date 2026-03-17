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
import TagSelector, { Tag } from "../bussiness/TagSelector";
import { Search, RotateCcw, Filter, Plus } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/app/store";
import TagItem from "../bussiness/TagItem";
import { clearTags } from "@/features/Tags/tagsSlice";
import { useSearchQueryByKeyword } from "@/hooks/useSearchQueryByKeyword";
import {
  setTagIds,
  setTitle,
  setCurrent,
} from "@/features/ProblemList/problemListSlice";
import ProblemListTable, { ProblemRecord } from "../bussiness/ProblemListTable";
import ProblemListPageChoose from "../bussiness/ProblemListPageChoose";
import { useNavigate } from "react-router-dom";

export default function ProblemsLibraryPage() {
  const nav = useNavigate();
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

  // 进入页面时重置筛选条件
  useEffect(() => {
    dispatch(clearTags());
    dispatch(setTitle(""));
    dispatch(setCurrent(1));
    setKeyword("");
  }, []);

  const { data, isLoading, isFetching, refetch } =
    useSearchQueryByKeyword<ProblemRecord>(current, size, title, tag_ids);
  const records = data?.records || [];
  const total = data?.total || 0;
  // 调用函数传参数时位置要11对应
  const getTagIds = () => {
    const tag_idsArray = tags.map((item: Tag) => item.tag_id);
    return tag_idsArray;
  };
  useEffect(() => {
    dispatch(setTitle(keyword));
  }, [keyword]);
  useEffect(() => {
    dispatch(setTagIds(getTagIds()));
  }, [tags]);
  const pages = Math.ceil(total / Number(size));
  return (
    <div className="w-4/5 mx-auto py-6 space-y-6 min-h-screen overflow-x-hidden">
      <Helmet>
        <title>题库 - SeuOJ</title>
      </Helmet>

      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-semibold">题库</div>
          <div className="text-sm text-muted-foreground mt-1">
            浏览和管理题目列表
          </div>
        </div>
        <Button onClick={() => nav("/problemsLibrary/create")}>
          <Plus className="mr-2 h-4 w-4" />
          新建题目
        </Button>
      </div>

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
                <TagSelector className="h-auto min-h-0" />
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
                {tags.map((tag: Tag, idx: number) => (
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
            共计 <span className="font-semibold text-foreground">{total}</span>{" "}
            条结果
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
      <div className="mt-6 flex-1">
        <ProblemListTable
          records={records}
          isLoading={isLoading || isFetching}
        />
      </div>
      <div className="mt-6">
        {pages && (
          <ProblemListPageChoose
            pages={pages}
            current={current}
            dispatch={dispatch}
            refetch={refetch}
          />
        )}
      </div>
    </div>
  );
}
