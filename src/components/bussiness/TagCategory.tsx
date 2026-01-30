import React from "react";
import { tagItem } from "./TagSelector";
import SubTagCategory from "./SubTagCategory";
interface Groups {
  groups: tagItem[];
}
export default function TagCategory({ groups }: Groups) {
  return (
    <div className="flex flex-col gap-6">
      {groups?.map((i, idx) => {
        return <SubTagCategory key={idx} subGroup={i} />;
      })}
    </div>
  );
}
