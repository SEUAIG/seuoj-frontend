import { Outlet } from "react-router-dom";
import NavBar from "@/components/common/NavBar";
import Slogan from "@/components/common/Slogan";
import { Toaster } from "@/components/ui/sonner";
export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-none z-50 fixed top-0 left-0 right-0">
        <NavBar />
      </div>
      <main className="flex-1 w-full flex flex-col pt-14">
        <Outlet />
      </main>
      <footer className="flex-none mt-auto">
        <Slogan />
      </footer>
      <Toaster />
    </div>
  );
}
