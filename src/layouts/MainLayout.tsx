import { Outlet } from "react-router-dom";
import NavBar from "@/components/common/NavBar";
import Slogan from "@/components/common/Slogan";
import { Toaster } from "@/components/ui/sonner";
export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-none z-50 sticky top-0">
        <NavBar />
      </div>
      <main className="flex-1 w-full flex flex-col">
        <Outlet />
      </main>
      <footer className="flex-none mt-auto">
        <Slogan />
      </footer>
      <Toaster />
    </div>
  );
}
