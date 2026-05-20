import * as React from "react";
import { useEffect } from "react";

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
import useQueryToGetLanguages from "@/hooks/useQueryToGetLanguages";

export default function SelectContestLanguage() {
  const dispatch = useDispatch();
  const { language } = useSelector((store: RootState) => store.contestCode);
  const { data, isLoading, isError } = useQueryToGetLanguages();
  const languages = Array.isArray(data?.data?.languages) ? data.data.languages : [];
  const available = languages.filter((lang) => lang.available);

  useEffect(() => {
    if (available.length > 0 && !available.some((lang) => lang.name === language)) {
      dispatch(setContestLanguage(available[0].name));
    }
  }, [available, language, dispatch]);

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
          {isLoading ? (
            <SelectItem value="loading" disabled>
              加载中...
            </SelectItem>
          ) : isError ? (
            <SelectItem value="error" disabled>
              加载失败
            </SelectItem>
          ) : (
            languages
              .filter((lang) => lang.available)
              .map((lang) => (
                <SelectItem key={lang.name} value={lang.name}>
                  {lang.name} {lang.version ? `(${lang.version})` : ""}
                </SelectItem>
              ))
          )}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
