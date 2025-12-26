import * as React from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { setLanguage } from "@/features/Code/codeSlice";

export default function SelectLanguage() {
  const dispatch = useDispatch()
  const {language} = useSelector((store:RootState)=>store.code)
  
  return (
    <Select value={language} onValueChange={(value)=>{
      dispatch(setLanguage(value))
    }}>
      <SelectTrigger className="w-[180px] bg-slate-100">
        <SelectValue placeholder="选择编程语言与版本" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>languages</SelectLabel>
          <SelectItem value="C++ (g++ 9.40)">C++ (g++ 9.40)</SelectItem>
          <SelectItem value="C++ 11 (g++ 9.40)">C++ 11 (g++ 9.40)</SelectItem>
          <SelectItem value="C++ 17 (g++ 9.40)">C++ 17 (g++ 9.40)</SelectItem>
          <SelectItem value="C++ (NOI) (g++ 4.84)">
            C++ (NOI) (g++ 4.84)
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
