import NavBar from "@/components/common/NavBar";
import Slogan from "@/components/common/Slogan";
import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="relative">
      <NavBar />
      <main className="pt-20">
        
      <Outlet />
      </main>
      <Slogan />
    </div>
  );
}
