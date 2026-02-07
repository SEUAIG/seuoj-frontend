import React from "react";
import { tagItem } from "./TagSelector";
import SubTagCategory from "./SubTagCategory";
interface Groups {
  groups: tagItem[];
  category: "algorithm" | "source" | "time" | "special";
}
export default function TagCategory({ groups, category }: Groups) {
  return (
    <div className="flex flex-col gap-6">
      {groups?.map((i, idx) => {
        return <SubTagCategory key={idx} subGroup={i} category={category} />;
      })}
    </div>
  );
}
