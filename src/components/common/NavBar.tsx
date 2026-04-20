import React from "react";
import LinkLists from "./LinkLists";
import Logo from "./Logo";
import AuthButton from "./AuthButton";
import { useSelector } from "react-redux/es/exports";
import { RootState } from "@/app/store";
import AvatarNew from "./AvatarNew";

export default function NavBar() {
  const { user, isAuthenticated } = useSelector(
    (store: RootState) => store.auth
  );

  return (
    <header className="w-full bg-background shadow-md">
      <div className="flex h-14 w-full items-center gap-4 px-4 shadow-sm md:px-10">
        <div className="flex shrink-0 items-center">
          <Logo />
        </div>

        <div className="min-w-0 flex-1 overflow-x-auto">
          <LinkLists />
        </div>

        <div className="ml-auto flex shrink-0 flex-nowrap items-center gap-4">
          {isAuthenticated && user ? <AvatarNew user={user} /> : <AuthButton />}
        </div>
      </div>
    </header>
  );
}
