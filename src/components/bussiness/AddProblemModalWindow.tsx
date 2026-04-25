import React, { useState } from 'react'
import { toast } from 'sonner'
import ModalWindow from '../common/ModalWindow'
import { Button } from '../ui/button'
import ProblemSearchSelect, {
  ProblemSearchOption,
} from "@/components/bussiness/ProblemSearchSelect";

interface Problem {
  sort_order: number;
  pid: string;
  title: string;
}

interface AddProblemModalWindowProps {
  isOpen: boolean;
  onClose: () => void;
  problems: Problem[];
  setProblems: React.Dispatch<React.SetStateAction<Problem[]>>;
}

export default function AddProblemModalWindow({
  isOpen,
  onClose,
  problems,
  setProblems,
}: AddProblemModalWindowProps) {
  const [selectedProblem, setSelectedProblem] =
    useState<ProblemSearchOption | null>(null)

  function handleClose() {
    setSelectedProblem(null)
    onClose()
  }

  async function handleAdd(){
    if(!selectedProblem)
    {
        toast.error("请选择题目")
        return
    }
    const exists = problems.some((p)=>p.pid===selectedProblem.pid)
    if(exists)
    {
        toast.error("题目已存在")
        return
    }
    const newProblem = {
        sort_order:problems.length+1,
        pid:selectedProblem.pid,
        title:selectedProblem.title,
    }
    setProblems((prev)=>[...prev,newProblem])
    handleClose()
  }
    return (
      <ModalWindow isOpen={isOpen} onClose={handleClose}>
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">添加题目</h2>
          <ProblemSearchSelect
            value={selectedProblem}
            onChange={setSelectedProblem}
            excludedPids={problems.map((problem)=>problem.pid)}
            autoFocus
          />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              取消
            </Button>

            <Button onClick={handleAdd} disabled={!selectedProblem}>添加</Button>
          </div>
        </div>
      </ModalWindow>
    );
}
