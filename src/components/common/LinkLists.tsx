import {
  House,
  List,
  Trophy,
  ListCheck,
  ClipboardList,
  CircleQuestionMark,
  GraduationCap,
  Shield,
  Bot,
} from "lucide-react";
import React from "react";
import NavItem from "./NavItem";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";

export default function LinkLists() {
  const role = useSelector(
    (state: RootState) => state.auth.user?.role ?? "guest",
  );
  const isAdmin = role === "admin" || role === "superadmin";

  return (
    <ul className="flex text-lg justify-center items-center gap-8">
      <NavItem to="/home" end icon={House} label="首页" />
      <NavItem to="/problemsLibrary" icon={List} label="题库" />
      <NavItem to="/contest" icon={Trophy} label="比赛" />
      <NavItem to="/class" icon={GraduationCap} label="班级" />
      <NavItem to="/evaluation" icon={ListCheck} label="评测" />
      <NavItem to="/problemset" icon={ClipboardList} label="题单" />
      <NavItem to="/agent-chat" icon={Bot} label="Agent Chat" />
      {/* <NavItem to="/discussion" icon={MessagesSquare} label="讨论" /> */}
      <NavItem to="/help" icon={CircleQuestionMark} label="帮助" />
      {isAdmin && <NavItem to="/admin/users" icon={Shield} label="管理" />}
    </ul>
  );
}
