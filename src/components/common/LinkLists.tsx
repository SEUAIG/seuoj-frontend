import {
  House,
  List,
  Trophy,
  ListCheck,
  ClipboardList,
  MessagesSquare,
  CircleQuestionMark,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import React from "react";
import NavItem from "./NavItem";
export default function LinkLists() {
  return (
    <ul className="flex text-lg justify-center items-center gap-8">
      <NavItem to="/home" end icon={House} label="首页" />
      <NavItem to="/problemsLibrary" icon={List} label="题库" />
      <NavItem to="/competition" icon={Trophy} label="比赛" />
      <NavItem to="/evaluation" icon={ListCheck} label="评测" />
      <NavItem to="/problemset" icon={ClipboardList} label="题单" />
      <NavItem to="/discussion" icon={MessagesSquare} label="讨论" />
      <NavItem to="/help" icon={CircleQuestionMark} label="帮助" />
    </ul>
  );
}
