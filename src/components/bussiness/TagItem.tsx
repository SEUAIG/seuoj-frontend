import React from "react";
import { Badge } from "../ui/badge";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/store";
import { addTag, deleteTag } from "@/features/Tags/tagsSlice";
import { X } from "lucide-react";
import { Tag } from "./TagSelector";

interface Item {
  tag_id: number;
  tag_name: string;
  from?: "algorithm" | "source" | "time" | "special";
}

export default function TagItem({ tag_id, tag_name, from }: Item) {
  const { tags } = useSelector((state: RootState) => state.tags);
  const dispatch = useDispatch<AppDispatch>();
  const selectedTag = tags.find((t: Tag) => t.tag_id === tag_id);
  const isSelected = !!selectedTag;
  const currentFrom: "algorithm" | "source" | "time" | "special" =
    selectedTag?.from || from || "algorithm";
  const handleClick = () => {
    if (isSelected) {
      dispatch(deleteTag({ tag_id, tag_name }));
    } else {
      dispatch(addTag({ tag_id, tag_name, from }));
    }
  };
  const colorMap: Record<"algorithm" | "source" | "time" | "special", string> = {
    algorithm: "hover:bg-blue-500 hover:text-white",
    source: "hover:bg-emerald-500 hover:text-white",
    time: "hover:bg-amber-500 hover:text-white",
    special: "hover:bg-purple-500 hover:text-white",
  };
  const selectedColorMap: Record<
    "algorithm" | "source" | "time" | "special",
    string
  > = {
    algorithm: "bg-blue-500 hover:bg-blue-600",
    source: "bg-emerald-500 hover:bg-emerald-600",
    time: "bg-amber-500 hover:bg-amber-600",
    special: "bg-purple-500 hover:bg-purple-600",
  };
  const hoverClass = colorMap[currentFrom] || colorMap.algorithm;
  const activeClass = selectedColorMap[currentFrom] || selectedColorMap.algorithm;
  return (
    <Badge
      variant={isSelected ? "default" : "secondary"}
      className={`
        cursor-pointer transition-all duration-300 ease-out 
        h-7 px-3 py-1 text-sm font-medium
        active:scale-95 animate-in fade-in zoom-in-95
        flex items-center gap-1.5
        ${
          isSelected
            ? `${activeClass} shadow-sm text-white border-transparent`
            : `${hoverClass} hover:shadow-sm`
        }
      `}
      onClick={handleClick}
    >
      {tag_name}
      {isSelected && (
        <span className="animate-in fade-in zoom-in-0 duration-200 flex items-center">
          <X className="h-3.5 w-3.5 opacity-70 hover:opacity-100 transition-opacity" />
        </span>
      )}
    </Badge>
  );
}
