import React from "react";
import SearchInput from "@/components/common/SearchInput";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

type ContestFilterPanelProps = {
  titleKeyword?: string | null;
  onTitleChange: (value: string) => void;
  onTitleClear: () => void;
  statusOptions: string[];
  status?: string | null;
  statusLabelMap: Map<string, string>;
  ruleTypeOptions: string[];
  ruleType?: string | null;
  onStatusToggle: (value: string) => void;
  onRuleTypeToggle: (value: string) => void;
  getTagClass: (value: string, selected: boolean) => string;
  isFetching: boolean;
  onSearch: () => void;
};

export default function ContestFilterPanel({
  titleKeyword,
  onTitleChange,
  onTitleClear,
  statusOptions,
  status,
  statusLabelMap,
  ruleTypeOptions,
  ruleType,
  onStatusToggle,
  onRuleTypeToggle,
  getTagClass,
  isFetching,
  onSearch,
}: ContestFilterPanelProps) {
  return (
    <div className="rounded-xl border bg-card/60 shadow-sm p-5 space-y-5">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <span className="text-sm font-medium text-muted-foreground w-20">
            搜索
          </span>
          <div className="flex w-full max-w-[420px]">
            <SearchInput
              value={titleKeyword ?? ""}
              onChange={onTitleChange}
              onClear={onTitleClear}
              placeholder="仅检索比赛大标题"
            />
          </div>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <span className="text-sm font-medium text-muted-foreground w-20">
            比赛状态
          </span>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((item) => {
              const selected = status === item;
              return (
                <Badge
                  key={item}
                  variant={selected ? "default" : "secondary"}
                  onClick={() => onStatusToggle(item)}
                  className={[
                    "cursor-pointer transition-all duration-300 ease-out",
                    "h-7 px-3 py-1 text-sm font-medium",
                    "active:scale-95 animate-in fade-in zoom-in-95",
                    getTagClass(item, selected),
                  ].join(" ")}
                >
                  {statusLabelMap.get(item) ?? item}
                </Badge>
              );
            })}
          </div>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <span className="text-sm font-medium text-muted-foreground w-20">
            赛制
          </span>
          <div className="flex flex-wrap gap-2">
            {ruleTypeOptions.map((item) => {
              const selected = ruleType === item;
              return (
                <Badge
                  key={item}
                  variant={selected ? "default" : "secondary"}
                  onClick={() => onRuleTypeToggle(item)}
                  className={[
                    "cursor-pointer transition-all duration-300 ease-out",
                    "h-7 px-3 py-1 text-sm font-medium",
                    "active:scale-95 animate-in fade-in zoom-in-95",
                    getTagClass(item, selected),
                  ].join(" ")}
                >
                  {item}
                </Badge>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end">
        <Button
          className="w-28 bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all active:scale-95"
          onClick={onSearch}
          disabled={isFetching}
        >
          <Search className="mr-2 h-4 w-4" />
          {isFetching ? "搜索中" : "搜索"}
        </Button>
      </div>
    </div>
  );
}
