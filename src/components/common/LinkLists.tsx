import {
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
  Sparkles,
  ChevronDown,
  BookOpen,
  Ellipsis,
  Users,
} from "lucide-react";
import React from "react";
import NavItem from "./NavItem";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { useLocation, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const AI_ROUTES = ["/chat-agent", "/knowledge-graph", "/learning-chain"];
const PRACTICE_ROUTES = ["/problemsLibrary", "/evaluation", "/problemset"];


export default function LinkLists() {
  const role = useSelector(
    (state: RootState) => state.auth.user?.role ?? "guest"
  );
  const isAdmin = role === "admin" || role === "superadmin";
  const location = useLocation();
  const navigate = useNavigate();
  const aiActive = AI_ROUTES.some((r) => location.pathname.startsWith(r));
  const practiceActive = PRACTICE_ROUTES.some((r) =>
    location.pathname.startsWith(r)
  );
  const moreActive =
    location.pathname.startsWith("/help") ||
    location.pathname.startsWith("/contributors") ||
    location.pathname.startsWith("/admin");

  return (
    <ul className="flex w-max items-center justify-center gap-3 text-base md:gap-6 lg:gap-8">
      <NavItem to="/class" icon={GraduationCap} label="班级" />
      <NavItem to="/contest" icon={Trophy} label="比赛" />
      <li>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <button
              className={`
                flex items-center gap-1.5
                px-4 py-2 rounded-md
                transition-all duration-200 outline-none
                ${
                  practiceActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }
              `}
            >
              <BookOpen
                strokeWidth={practiceActive ? 2.5 : 1.5}
                size={36}
                className="h-4 w-4"
              />
              <span className="whitespace-nowrap">练习</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-40 mt-2">
            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate("/problemsLibrary")}
            >
              <List className="h-4 w-4" />
              <span>题库</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate("/evaluation")}
            >
              <ListCheck className="h-4 w-4" />
              <span>评测</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate("/problemset")}
            >
              <ClipboardList className="h-4 w-4" />
              <span>题单</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </li>
      <li>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <button
              className={`
                flex items-center gap-1.5
                px-4 py-2 rounded-md
                transition-all duration-200 outline-none
                ${
                  aiActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }
              `}
            >
              <Sparkles
                strokeWidth={aiActive ? 2.5 : 1.5}
                size={36}
                className="h-4 w-4"
              />
              <span className="whitespace-nowrap">智能学习</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-40 mt-2">
            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate("/chat-agent")}
            >
              <Bot className="h-4 w-4" />
              <span>智能体助教</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate("/knowledge-graph")}
            >
              <Network className="h-4 w-4" />
              <span>知识图谱</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate("/learning-chain")}
            >
              <Link2 className="h-4 w-4" />
              <span>学习链</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </li>
      <li>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <button
              className={`
                flex items-center gap-1.5
                px-4 py-2 rounded-md
                transition-all duration-200 outline-none
                ${
                  moreActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }
              `}
            >
              <Ellipsis
                strokeWidth={moreActive ? 2.5 : 1.5}
                size={36}
                className="h-4 w-4"
              />
              <span className="whitespace-nowrap">更多</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-40 mt-2">
            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate("/help")}
            >
              <CircleQuestionMark className="h-4 w-4" />
              <span>帮助</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate("/contributors")}
            >
              <Users className="h-4 w-4" />
              <span>贡献者</span>
            </DropdownMenuItem>
            {isAdmin && (
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => navigate("/admin/users")}
              >
                <Shield className="h-4 w-4" />
                <span>管理</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </li>
    </ul>
  );
}
