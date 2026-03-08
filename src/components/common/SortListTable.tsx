import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  ArrowDown,
  ArrowUp,
  GripVertical,
  Loader2,
  Minus,
  Plus,
  Trash2,
} from "lucide-react";
import { ContestProblemOverviewInEditPage } from "@/services/Contest/getContestProblemListInEditPage";
import { Button } from "../ui/button";
import AddProblemModalWindow from "../bussiness/AddProblemModalWindow";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

type InsertPosition = "before" | "after";

interface SortListTableProps {
  problems: ContestProblemOverviewInEditPage[];
  isFetching: boolean;
  setProblems: React.Dispatch<
    React.SetStateAction<ContestProblemOverviewInEditPage[]>
  >;
}

function reorder(
  problems: ContestProblemOverviewInEditPage[],
  activePid: string,
  targetPid: string,
  position: InsertPosition
): ContestProblemOverviewInEditPage[] {
  if (activePid === targetPid) {
    return problems;
  }
  const nextProblems = [...problems];
  const activeIndex = nextProblems.findIndex((p) => p.pid === activePid);
  const targetIndex = nextProblems.findIndex((p) => p.pid === targetPid);
  if (activeIndex === -1 || targetIndex === -1) {
    return problems;
  }
  const [activeItem] = nextProblems.splice(activeIndex, 1);
  let insertIndex = position === "after" ? targetIndex + 1 : targetIndex;
  if (activeIndex < targetIndex) {
    insertIndex -= 1;
  }
  nextProblems.splice(insertIndex, 0, activeItem);
  return nextProblems;
}

export default function SortListTable({
  problems,
  isFetching,
  setProblems,
}: SortListTableProps) {
  const [draggingPid, setDraggingPid] = useState<string | null>(null);
  const [overPid, setOverPid] = useState<string | null>(null);
  const [insertPosition, setInsertPosition] = useState<InsertPosition | null>(
    null
  );
  const [dragHandlePid, setDragHandlePid] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  function resetDragState() {
    setDraggingPid(null);
    setOverPid(null);
    setInsertPosition(null);
    setDragHandlePid(null);
  }

  function handleDragStart(
    event: React.DragEvent<HTMLTableRowElement>,
    pid: string
  ) {
    if (dragHandlePid !== pid) {
      event.preventDefault();
      return;
    }
    setDraggingPid(pid);
  }

  function handleDragOver(
    event: React.DragEvent<HTMLTableRowElement>,
    targetPid: string
  ) {
    event.preventDefault();
    if (!draggingPid || draggingPid === targetPid) {
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const middleY = rect.top + rect.height / 2;
    const position: InsertPosition =
      event.clientY < middleY ? "before" : "after";
    setOverPid(targetPid);
    setInsertPosition(position);
  }

  function handleDrop(targetPid: string) {
    if (!draggingPid || !insertPosition) {
      resetDragState();
      return;
    }
    setProblems((prev) =>
      reorder(prev, draggingPid, targetPid, insertPosition)
    );
    resetDragState();
  }

  function handleDragEnd() {
    resetDragState();
  }

  function handleRemoveProblem(pid: string) {
    setProblems((prev) => prev.filter((problem) => problem.pid !== pid));
    if (draggingPid === pid || dragHandlePid === pid) {
      resetDragState();
    }
  }

  function renderTrendTag(currentOrder: number, originalOrder: number) {
    if (currentOrder < originalOrder) {
      return (
        <span className="inline-flex items-center justify-center rounded-full p-1 bg-green-50 text-green-600">
          <ArrowUp className="h-3 w-3" />
        </span>
      );
    }
    if (currentOrder > originalOrder) {
      return (
        <span className="inline-flex items-center justify-center rounded-full p-1 bg-red-50 text-red-600">
          <ArrowDown className="h-3 w-3" />
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center rounded-full p-1 bg-muted text-muted-foreground">
        <Minus className="h-3 w-3" />
      </span>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-md border bg-muted/20 px-3 py-2">
        <div className="text-sm font-medium">题目排序</div>
        <Button size="sm" className="h-8 gap-1.5" onClick={() => setOpen(true)}>
          <Plus className="h-3.5 w-3.5" />
          添加题目
        </Button>
      </div>
      <AddProblemModalWindow
        isOpen={open}
        onClose={() => setOpen(false)}
        problems={problems}
        setProblems={setProblems}
      />
      <div className="rounded-md border">
        <TooltipProvider>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead className="w-16">#</TableHead>
                <TableHead className="w-24">PID</TableHead>
                <TableHead>题目名称</TableHead>
                <TableHead className="w-28">原始顺序</TableHead>
                <TableHead className="w-12 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isFetching ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-20 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                  </TableCell>
                </TableRow>
              ) : problems.length > 0 ? (
                problems.map((problem, index) => {
                  const isDragging = draggingPid === problem.pid;
                  const isDragOver = overPid === problem.pid;
                  const currentOrder = index + 1;
                  return (
                    <TableRow
                      key={problem.pid}
                      draggable
                      onDragStart={(event) =>
                        handleDragStart(event, problem.pid)
                      }
                      onDragOver={(e) => handleDragOver(e, problem.pid)}
                      onDrop={() => handleDrop(problem.pid)}
                      onDragEnd={handleDragEnd}
                      className={`relative ${isDragging ? "opacity-40" : ""}`}
                    >
                      <TableCell className="w-8">
                        <div
                          className="cursor-grab flex items-center justify-center"
                          onMouseDown={() => setDragHandlePid(problem.pid)}
                        >
                          <GripVertical className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {currentOrder}
                      </TableCell>
                      <TableCell>{problem.pid}</TableCell>
                      <TableCell>{problem.title}</TableCell>
                      <TableCell>
                        <div className="inline-flex items-center gap-1">
                          <span>{problem.sort_order}</span>
                          {renderTrendTag(currentOrder, problem.sort_order)}
                        </div>
                      </TableCell>
                      <TableCell className="w-12 text-right">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-amber-600 hover:text-amber-700 hover:bg-amber-100"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => handleRemoveProblem(problem.pid)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>删除</TooltipContent>
                        </Tooltip>
                      </TableCell>
                      {isDragOver && insertPosition === "before" && (
                        <div className="absolute left-0 right-0 top-0 h-[2px] bg-blue-500" />
                      )}
                      {isDragOver && insertPosition === "after" && (
                        <div className="absolute left-0 right-0 bottom-0 h-[2px] bg-blue-500" />
                      )}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-20 text-center text-muted-foreground"
                  >
                    暂无题目
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TooltipProvider>
      </div>
      <div className="text-xs text-muted-foreground">
        提示：左侧拖拽图标可调整顺序
      </div>
    </div>
  );
}
