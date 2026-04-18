import NavBar from "@/components/common/NavBar";
import Slogan from "@/components/common/Slogan";
import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
export default function AuthLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex-none z-50">
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
