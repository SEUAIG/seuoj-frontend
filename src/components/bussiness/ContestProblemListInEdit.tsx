import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { ContestProblemOverviewInEditPage } from "@/services/Contest/getContestProblemListInEditPage";

interface ContestProblemListInEditProps {
  isFetchingProblems: boolean;
  problems: ContestProblemOverviewInEditPage[];
}

export default function ContestProblemListInEdit({
  isFetchingProblems,
  problems,
}: ContestProblemListInEditProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>标题</TableHead>
            <TableHead className="w-[100px]">原排序</TableHead>
            <TableHead className="w-[100px]">现排序</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isFetchingProblems ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center h-24">
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              </TableCell>
            </TableRow>
          ) : problems.length > 0 ? (
            problems.map((problem, index) => (
              <TableRow key={problem.pid}>
                <TableCell className="font-medium">{problem.pid}</TableCell>
                <TableCell>{problem.title}</TableCell>
                <TableCell>{problem.sort_order}</TableCell>
                <TableCell>{index + 1}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={4}
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
