import NavBar from "@/components/common/NavBar";
import Slogan from "@/components/common/Slogan";
import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
export default function AuthLayout() {
  return (
    <div className="relative min-h-screen bg-gray-50">
      <NavBar />
      <main className="pt-20">
        <Outlet />
      </main>
      <Slogan />
      <Toaster />
    </div>
  );
}
