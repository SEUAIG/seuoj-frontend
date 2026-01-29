import { Outlet } from "react-router-dom";
import NavBar from "@/components/common/NavBar";
import Slogan from "@/components/common/Slogan";
import { Toaster } from "@/components/ui/sonner";
export default function MainLayout() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      <div className="flex-none z-50">
        <NavBar />
      </div>
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        <main className="flex-1 w-full overflow-hidden">
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
