import React from "react";
import { Badge } from "../ui/badge";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/store";
import { addTag, deleteTag } from "@/features/Tags/tagsSlice";
import { X } from "lucide-react";

interface Item {
  tag_id: number;
  tag_name: string;
}

export default function TagItem({ tag_id, tag_name }: Item) {
  const { tags } = useSelector((state: RootState) => state.tags);
  const dispatch = useDispatch<AppDispatch>();
  const isSelected = tags.some((t) => t.tag_id === tag_id);
  const handleClick = () => {
    if (isSelected) {
      dispatch(deleteTag({ tag_id, tag_name }));
    } else {
      dispatch(addTag({ tag_id, tag_name }));
    }
  };
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
            ? "hover:bg-primary/90 shadow-sm"
            : "hover:bg-primary hover:text-primary-foreground hover:shadow-sm"
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
