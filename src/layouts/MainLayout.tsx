import { Outlet, useLocation } from "react-router-dom";
import NavBar from "@/components/common/NavBar";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import Slogan from "@/components/common/Slogan";
import { Toaster } from "@/components/ui/sonner";
import NotificationToasts from "@/components/notification/NotificationToasts";

export default function MainLayout() {
  const { pathname } = useLocation();
  const isFullscreenPage = pathname === "/chat-agent" || /^\/contest\/\d+\/standings\/?$/.test(pathname);

  return (
    <div className={`flex flex-col min-h-screen bg-background ${isFullscreenPage ? "h-screen overflow-hidden" : ""}`}>
      <div className="flex-none z-50 fixed top-0 left-0 right-0">
        <NavBar />
      </div>
      <main
        className={`flex-1 w-full flex flex-col pt-14 ${isFullscreenPage ? "h-[calc(100vh-3.5rem)] overflow-hidden" : ""}`}
      >
        <ErrorBoundary resetKey={pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>
      {!isFullscreenPage ? (
        <footer className="flex-none mt-auto">
          <Slogan />
        </footer>
      ) : null}
      <Toaster />
      <NotificationToasts />
    </div>
  );
}
