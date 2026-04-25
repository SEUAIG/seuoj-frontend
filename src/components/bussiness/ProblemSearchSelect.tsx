import React from "react";
import { Check, Loader2, Search } from "lucide-react";
import useDebounced from "@/hooks/useDebounced";
import { useSearchQueryByKeyword } from "@/hooks/useSearchQueryByKeyword";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

export interface ProblemSearchOption {
  pid: string;
  title: string;
  tags?: string[];
  total_submit?: number;
  total_accept?: number;
}

interface ProblemSearchSelectProps {
  value: ProblemSearchOption | null;
  onChange: (problem: ProblemSearchOption) => void;
  excludedPids?: string[];
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  pageSize?: number;
}

export default function ProblemSearchSelect({
  value,
  onChange,
  excludedPids = [],
  placeholder = "搜索 PID 或题目标题",
  className,
  autoFocus,
  pageSize = 7,
}: ProblemSearchSelectProps) {
  const [keyword, setKeyword] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const debouncedKeyword = useDebounced(keyword.trim(), 300);
  const excludedPidSet = React.useMemo(
    () => new Set(excludedPids),
    [excludedPids]
  );
  const { data, isLoading, isFetching } =
    useSearchQueryByKeyword<ProblemSearchOption>(
      currentPage,
      pageSize,
      debouncedKeyword,
      null
    );
  const records = data?.records ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [debouncedKeyword, pageSize]);

  function handleKeywordChange(event: React.ChangeEvent<HTMLInputElement>) {
    setKeyword(event.target.value);
    setCurrentPage(1);
  }

  function handlePageChange(page: number) {
    if (page < 1 || page > totalPages || page === currentPage) {
      return;
    }
    setCurrentPage(page);
  }

  function renderPaginationItems() {
    if (totalPages <= 1) {
      return null;
    }

    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    return Array.from(
      { length: endPage - startPage + 1 },
      (_, index) => startPage + index
    ).map((page) => (
      <PaginationItem key={page}>
        <PaginationLink
          onClick={() => handlePageChange(page)}
          isActive={currentPage === page}
          className="h-8 w-8 cursor-pointer"
        >
          {page}
        </PaginationLink>
      </PaginationItem>
    ));
  }

  function handleEnterSelect(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") {
      return;
    }
    const firstAvailable = records.find(
      (problem) => !excludedPidSet.has(problem.pid)
    );
    if (firstAvailable) {
      event.preventDefault();
      onChange(firstAvailable);
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          autoFocus={autoFocus}
          value={keyword}
          onChange={handleKeywordChange}
          onKeyDown={handleEnterSelect}
          placeholder={placeholder}
          className="pl-8"
        />
      </div>

      {value && (
        <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2 text-sm">
          <Check className="h-4 w-4 text-emerald-600" />
          <span className="font-mono text-muted-foreground">{value.pid}</span>
          <span className="min-w-0 flex-1 truncate font-medium">
            {value.title}
          </span>
        </div>
      )}

      <div className="overflow-hidden rounded-md border bg-background">
        <div className="flex h-9 items-center justify-between border-b px-3 text-xs text-muted-foreground">
          <span>{debouncedKeyword ? "搜索结果" : "可选题目"}</span>
          {isFetching && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        </div>
        <ScrollArea className="h-64">
          {isLoading && records.length === 0 ? (
            <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              加载题目中...
            </div>
          ) : records.length > 0 ? (
            <div className="p-1">
              {records.map((problem) => {
                const isSelected = value?.pid === problem.pid;
                const isExcluded = excludedPidSet.has(problem.pid);
                return (
                  <button
                    key={problem.pid}
                    type="button"
                    disabled={isExcluded}
                    onClick={() => onChange(problem)}
                    title={`${problem.pid} ${problem.title}`}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-sm px-2 py-2 text-left text-sm outline-none transition-colors",
                      "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                      isSelected && "bg-accent text-accent-foreground",
                      isExcluded &&
                      "cursor-not-allowed opacity-50 hover:bg-transparent hover:text-foreground"
                    )}
                  >
                    <span className="w-16 shrink-0 font-mono text-muted-foreground">
                      {problem.pid}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {problem.title}
                    </span>
                    {isExcluded ? (
                      <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        已添加
                      </span>
                    ) : isSelected ? (
                      <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
              暂无匹配题目
            </div>
          )}
        </ScrollArea>
        {totalPages > 1 && (
          <div className="flex flex-col gap-2 border-t px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-muted-foreground">
              共 {total} 题，第 {currentPage} / {totalPages} 页
            </div>
            <Pagination className="mx-0 w-auto justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={cn(
                      "h-8 cursor-pointer px-2",
                      currentPage <= 1 && "pointer-events-none opacity-50"
                    )}
                  />
                </PaginationItem>
                {renderPaginationItems()}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={cn(
                      "h-8 cursor-pointer px-2",
                      currentPage >= totalPages &&
                      "pointer-events-none opacity-50"
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}
