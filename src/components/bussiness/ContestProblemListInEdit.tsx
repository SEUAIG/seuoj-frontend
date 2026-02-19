import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, GripVertical } from "lucide-react";
import { ContestProblemOverviewInEditPage } from "@/services/Contest/getContestProblemListInEditPage";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ContestProblemListInEditProps {
  isFetchingProblems: boolean;
  problems: ContestProblemOverviewInEditPage[];
  setProblems: (problems: ContestProblemOverviewInEditPage[]) => void;
  isDragEnabled: boolean;
}

interface SortableRowProps {
  problem: ContestProblemOverviewInEditPage;
  index: number;
  isDragEnabled: boolean;
}

function SortableRow({ problem, index, isDragEnabled }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: problem.pid, disabled: !isDragEnabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <TableRow ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {isDragEnabled && (
        <TableCell className="w-[50px]">
          <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
        </TableCell>
      )}
      <TableCell className="font-medium">{problem.pid}</TableCell>
      <TableCell>{problem.title}</TableCell>
      <TableCell>{problem.sort_order}</TableCell>
      <TableCell>{index + 1}</TableCell>
    </TableRow>
  );
}

export default function ContestProblemListInEdit({
  isFetchingProblems,
  problems,
  setProblems,
  isDragEnabled,
}: ContestProblemListInEditProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setProblems((items) => {
        const oldIndex = items.findIndex((item) => item.pid === active.id);
        const newIndex = items.findIndex((item) => item.pid === over?.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {isDragEnabled && <TableHead className="w-[50px]"></TableHead>}
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>标题</TableHead>
            <TableHead className="w-[100px]">原排序</TableHead>
            <TableHead className="w-[100px]">现排序</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isFetchingProblems ? (
            <TableRow>
              <TableCell
                colSpan={isDragEnabled ? 5 : 4}
                className="text-center h-24"
              >
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              </TableCell>
            </TableRow>
          ) : problems.length > 0 ? (
            isDragEnabled ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={problems.map((p) => p.pid)}
                  strategy={verticalListSortingStrategy}
                >
                  {problems.map((problem, index) => (
                    <SortableRow
                      key={problem.pid}
                      problem={problem}
                      index={index}
                      isDragEnabled={isDragEnabled}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            ) : (
              problems.map((problem, index) => (
                <TableRow key={problem.pid}>
                  <TableCell className="font-medium">{problem.pid}</TableCell>
                  <TableCell>{problem.title}</TableCell>
                  <TableCell>{problem.sort_order}</TableCell>
                  <TableCell>{index + 1}</TableCell>
                </TableRow>
              ))
            )
          ) : (
            <TableRow>
              <TableCell
                colSpan={isDragEnabled ? 5 : 4}
                className="text-center h-24 text-muted-foreground"
              >
                暂无题目
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
