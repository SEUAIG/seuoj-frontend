import React from "react";
import { tagItem } from "./TagSelector";
import TagItem from "./TagItem";
interface SubGroup {
  subGroup: tagItem;
  category: "algorithm" | "source" | "time" | "special";
}
export default function SubTagCategory({ subGroup, category }: SubGroup) {
  return (
    <div className="space-y-3 rounded-lg border p-4 shadow-sm bg-card">
      {subGroup.group_name&&(<h4 className="font-medium leading-none flex items-center gap-2">
        <span className="h-4 w-1 rounded-full bg-primary/50"></span>
        {subGroup.group_name }
      </h4>)}
      <div className="flex flex-wrap gap-2">
        {subGroup.tags.map((i, idx) => (
          <TagItem tag_id={i.tag_id} tag_name={i.tag_name} key={idx} from={category} />
        ))}
      </div>
    </div>
  );
}
