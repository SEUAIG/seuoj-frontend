import React from "react";
import LinkLists from "./LinkLists";
import Logo from "./Logo";
import AuthButton from "./AuthButton";
import { useDispatch, useSelector } from "react-redux/es/exports";
import { RootState } from "@/app/store";
import AvatarNew from "./AvatarNew";
export default function NavBar() {
  const dispatch = useDispatch();
  const { user, isAuthenticated, error, status } = useSelector(
    (store: RootState) => store.auth
  );

  // 这里我们不使用shadcn 它相比我们需要的功能有点太复杂了 且不好理解
  //   我们使用lucide icon 作为icons库 他是无署名强制 无费用的 且是shadcn默认的
  return (
    <header
      className="
  w-full
  bg-background
  shadow-md
"
    >
      <div
        className="
    mx-10
    h-14
    px-8
    flex items-center justify-between shadow-sm
  "
      >
        <div className="flex items-center gap-6">
          <Logo />
          <LinkLists />
        </div>
        <div className="flex flex-nowrap items-center gap-4 pr-16">
          {isAuthenticated && user ? (
            <AvatarNew user={user!} />
          ) : (
            <AuthButton />
          )}
        </div>
      </div>
    </header>
  );
}
