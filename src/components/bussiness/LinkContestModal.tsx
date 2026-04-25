import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Link as LinkIcon } from "lucide-react";
import useQueryToGetContestList from "@/hooks/useQueryToGetContestList";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { linkContest } from "@/services/Class/linkContest";
import { format, parseISO, isValid } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface LinkContestModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: number;
}

export default function LinkContestModal({
  isOpen,
  onClose,
  classId,
}: LinkContestModalProps) {
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState("");
  const [searchTitle, setSearchTitle] = useState("");
  const [page, setPage] = useState(1);
  const size = 5;

  const { data, isLoading, isFetching } = useQueryToGetContestList(
    {
      current: page,
      size,
      title: searchTitle || undefined,
    },
    isOpen
  );

  const records = data?.records || [];
  const totalPages = Math.ceil((data?.total || 0) / size);

  const linkMutation = useMutation({
    mutationFn: (contestId: number) => linkContest(classId, contestId),
    onSuccess: (res) => {
      if (res.code === 0) {
        toast.success("成功关联比赛");
        queryClient.invalidateQueries({
          queryKey: ["classLinkedContests", classId],
        });
        onClose();
      } else {
        toast.error(res.message || "关联失败");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "关联请求发生错误");
    },
  });

  const handleSearch = () => {
    setSearchTitle(keyword);
    setPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const formatTime = (start?: string, end?: string) => {
    if (!start || !end) return "-";
    const startDate = parseISO(start);
    const endDate = parseISO(end);
    if (!isValid(startDate) || !isValid(endDate)) return "-";
    return `${format(startDate, "MM-dd HH:mm")} ~ ${format(
      endDate,
      "MM-dd HH:mm"
    )}`;
  };

  const statusLabelMap = new Map([
    ["NOT_STARTED", "未开始"],
    ["IN_PROGRESS", "进行中"],
    ["FINISHED", "已结束"],
  ]);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "NOT_STARTED":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "IN_PROGRESS":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "FINISHED":
        return "bg-slate-100 text-slate-700 border-slate-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>关联比赛</DialogTitle>
          <DialogDescription>
            搜索并选择要关联到当前班级的比赛。
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 my-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索比赛标题..."
              className="pl-8"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <Button onClick={handleSearch}>搜索</Button>
        </div>

        <div className="flex-1 overflow-y-auto border rounded-md min-h-[300px]">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : records.length === 0 ? (
            <div className="flex justify-center items-center h-full text-muted-foreground">
              没有找到相关比赛
            </div>
          ) : (
            <div
              className={`divide-y ${
                isFetching ? "opacity-60 transition-opacity" : ""
              }`}
            >
              {records.map((contest) => (
                <div
                  key={contest.contest_id}
                  className="p-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <h4
                        className="font-medium truncate"
                        title={contest.title}
                      >
                        {contest.title}
                      </h4>
                      {contest.status && (
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 px-1.5 whitespace-nowrap ${getStatusColor(
                            contest.status
                          )}`}
                        >
                          {statusLabelMap.get(contest.status) || contest.status}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatTime(contest.start_time, contest.end_time)}
                      <span className="mx-2">|</span>
                      赛制: {contest.rule_type}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0"
                    onClick={() =>
                      linkMutation.mutate(contest.contest_id)
                    }
                    disabled={linkMutation.isPending}
                  >
                    {linkMutation.isPending &&
                    linkMutation.variables === contest.contest_id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <LinkIcon className="h-4 w-4 mr-1" />
                        关联
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              上一页
            </Button>
            <span className="text-sm text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              下一页
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
