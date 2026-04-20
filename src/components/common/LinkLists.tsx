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
  Network,
  Link2,
} from "lucide-react";
import React from "react";
import NavItem from "./NavItem";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";

export default function LinkLists() {
  const role = useSelector(
    (state: RootState) => state.auth.user?.role ?? "guest"
  );
  const isAdmin = role === "admin" || role === "superadmin";

  return (
    <ul className="flex w-max items-center justify-center gap-3 text-base md:gap-6 lg:gap-8">
      <NavItem to="/home" end icon={House} label="首页" />
      <NavItem to="/problemsLibrary" icon={List} label="题库" />
      <NavItem to="/contest" icon={Trophy} label="比赛" />
      <NavItem to="/class" icon={GraduationCap} label="班级" />
      <NavItem to="/evaluation" icon={ListCheck} label="评测" />
      <NavItem to="/problemset" icon={ClipboardList} label="题单" />
      <NavItem to="/agent-chat" icon={Bot} label="Agent Chat" />
      <NavItem to="/knowledge-graph" icon={Network} label="知识图谱" />
      <NavItem to="/learning-chain" icon={Link2} label="学习链" />
      <NavItem to="/help" icon={CircleQuestionMark} label="帮助" />
      {isAdmin && <NavItem to="/admin/users" icon={Shield} label="管理" />}
    </ul>
  );
}
