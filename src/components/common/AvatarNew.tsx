import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import React from "react";
import { User } from "../../features/auth/types";
import { ArrowDown, User as UserIcon, LogOut,ChevronDown } from "lucide-react"; 
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import nahida from "./../../assets/nahida.png";
import { useDispatch } from "react-redux";
import { resetAuth } from "@/features/auth/authSlice";
import { persistor } from "@/app/store";
import { useNavigate } from "react-router-dom";

export default function AvatarNew({ user }: { user: User }) {
  const username = user?.username || "Unknown";
  const dispatch = useDispatch()
  const initial = username[0] ? username[0].toUpperCase() : "U";
  const nav = useNavigate()
  return (
    <div className="flex items-center space-x-2">
      <Avatar>
        <AvatarImage src={nahida} />
        <AvatarFallback>{initial}</AvatarFallback>
      </Avatar>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center space-x-1 text-lg font-medium hover:bg-gray-200 rounded-lg p-2"
          >
            <span>{username}</span>
            <ChevronDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-40 mt-2">
          <DropdownMenuItem 
            className="flex items-center space-x-2 hover:bg-gray-100 rounded-lg p-2 cursor-pointer"
            onClick={() => nav("/personal")}
          >
            <UserIcon size={16} />
            <span>个人中心</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="flex items-center space-x-2 hover:bg-gray-100 rounded-lg p-2 cursor-pointer"
            onClick={() => {
              dispatch(resetAuth());
              persistor.purge();
            }}
          >
            <LogOut size={16} />
            <div>退出登录</div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
