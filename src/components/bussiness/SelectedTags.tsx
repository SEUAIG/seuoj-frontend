import React from "react";
import TagItem from "./TagItem";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/store";

export default function SelectedTags() {
  const { tags } = useSelector((state: RootState) => state.tags);
  const dispatch = useDispatch<AppDispatch>();
  return (
    <div className="rounded-md border border-dashed p-3 bg-muted/30">
      <p className="text-sm text-muted-foreground mb-2">已选择标签：</p>
      <div className="flex flex-wrap gap-2 min-h-[2rem]">
        {tags.length > 0 ? (
          tags.map((i, idx) => (
            <TagItem tag_id={i.tag_id} tag_name={i.tag_name} key={idx} />
          ))
        ) : (
          <span className="text-xs text-muted-foreground/50 italic">
            未选择任何标签
          </span>
        )}
      </div>
    </div>
  );
}
