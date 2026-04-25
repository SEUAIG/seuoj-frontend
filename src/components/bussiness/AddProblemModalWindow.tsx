import React, { useState } from 'react'
import { toast } from 'sonner'
import ModalWindow from '../common/ModalWindow'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { getProblemDetail } from "@/services/Problem/getProblemDetail";

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
  const [pid,setPid] = useState("")
  async function handleAdd(){
    if(!pid.trim())
    {
        return
    }
    const exists = problems.some((p)=>p.pid===pid)
    if(exists)
    {
        toast.error("题目已存在")
        return
    }
    const res = await getProblemDetail(pid)
    const {title} = res.data
    const newProblem = {
        sort_order:problems.length+1,
        pid,
        title,
    }
    // TODO:校验pid是否存在 
    setProblems((prev)=>[...prev,newProblem])
    setPid("")
    onClose()
  }
    return (
      <ModalWindow isOpen={isOpen} onClose={onClose}>
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">添加题目</h2>
          <Input
            placeholder="请输入题目 PID"
            value={pid}
            onChange={(e) => setPid(e.target.value)}
          />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              取消
            </Button>

            <Button onClick={handleAdd}>添加</Button>
          </div>
        </div>
      </ModalWindow>
    );
}
