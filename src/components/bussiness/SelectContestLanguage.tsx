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
import { setContestLanguage } from "@/features/Code/contestCodeSlice";

export default function SelectContestLanguage() {
  const dispatch = useDispatch();
  const { language } = useSelector((store: RootState) => store.contestCode);

  return (
    <Select
      value={language}
      onValueChange={(value) => {
        dispatch(setContestLanguage(value));
      }}
    >
      <SelectTrigger className="w-[180px] bg-slate-100">
        <SelectValue placeholder="选择编程语言与版本" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Languages</SelectLabel>
          <SelectItem value="C">C (gcc 9.40)</SelectItem>
          <SelectItem value="Cpp">C++ (g++ 9.40)</SelectItem>
          <SelectItem value="Cpp11">C++ 11 (g++ 9.40)</SelectItem>
          <SelectItem value="Cpp17">C++ 17 (g++ 9.40)</SelectItem>
          <SelectItem value="Cpp20">C++ 20 (g++ 9.40)</SelectItem>
          <SelectItem value="Python3_12">Python 3.12</SelectItem>
          <SelectItem value="Java17">Java 17 (OpenJDK 17)</SelectItem>
          <SelectItem value="Go1_22">Go 1.22</SelectItem>
          <SelectItem value="Nodejs22">Node.js 22</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
