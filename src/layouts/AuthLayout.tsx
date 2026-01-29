import NavBar from "@/components/common/NavBar";
import Slogan from "@/components/common/Slogan";
import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
export default function AuthLayout() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      <div className="flex-none z-50">
        <NavBar />
      </div>
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        <main className="flex-1 w-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          <Outlet />
        </main>
        <footer className="flex-none">
          <Slogan />
        </footer>
      </div>
      <Toaster />
    </div>
  );
}
