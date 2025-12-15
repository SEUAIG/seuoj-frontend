import { Outlet } from "react-router-dom";
import NavBar from "@/components/common/NavBar";
import Slogan from "@/components/common/Slogan";
export default function MainLayout() {
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
