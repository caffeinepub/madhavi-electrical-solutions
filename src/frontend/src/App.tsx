import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { useAuth } from "./hooks/useAuth";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminPage from "./pages/AdminPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import SplashScreen from "./pages/SplashScreen";
import TechnicianLoginPageRoute from "./pages/TechnicianLoginPageRoute";
import TechnicianPage from "./pages/TechnicianPage";

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster theme="light" position="top-center" richColors />
    </>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const technicianRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/technician",
  component: TechnicianPage,
});

const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin-login",
  component: AdminLoginPage,
});

const technicianLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/technician-login",
  component: TechnicianLoginPageRoute,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  adminRoute,
  technicianRoute,
  adminLoginRoute,
  technicianLoginRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const { isLoggedIn, login, logout } = useAuth();
  const [showSignup, setShowSignup] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const pathname = window.location.pathname;
  // These routes handle their own auth — bypass global auth gate
  const isTechnicianRoute = pathname.startsWith("/technician");
  const isAdminLoginRoute = pathname === "/admin-login";
  const isTechnicianLoginRoute = pathname === "/technician-login";

  if (showSplash) {
    return (
      <AnimatePresence mode="wait">
        <SplashScreen key="splash" />
      </AnimatePresence>
    );
  }

  // Render standalone pages directly — they handle their own auth
  if (isTechnicianRoute) {
    return (
      <>
        <Toaster theme="light" position="top-center" richColors />
        <TechnicianPage />
      </>
    );
  }

  if (isAdminLoginRoute) {
    return (
      <>
        <Toaster theme="light" position="top-center" richColors />
        <AdminLoginPage />
      </>
    );
  }

  if (isTechnicianLoginRoute) {
    return (
      <>
        <Toaster theme="light" position="top-center" richColors />
        <TechnicianLoginPageRoute />
      </>
    );
  }

  if (!isLoggedIn) {
    return showSignup ? (
      <SignupPage
        onAuthSuccess={() => {}}
        onGoToLogin={() => setShowSignup(false)}
        loginFn={login}
      />
    ) : (
      <LoginPage
        onAuthSuccess={() => {}}
        onGoToSignup={() => setShowSignup(true)}
        loginFn={login}
      />
    );
  }

  return <RouterProvider router={router} context={{ logout }} />;
}
