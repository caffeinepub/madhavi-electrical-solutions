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
import AdminPage from "./pages/AdminPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import SplashScreen from "./pages/SplashScreen";
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

const routeTree = rootRoute.addChildren([
  indexRoute,
  adminRoute,
  technicianRoute,
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

  function handleAuthSuccess() {
    // isLoggedIn is updated via login() call inside pages
  }

  if (showSplash) {
    return (
      <AnimatePresence mode="wait">
        <SplashScreen key="splash" />
      </AnimatePresence>
    );
  }

  if (!isLoggedIn) {
    return showSignup ? (
      <SignupPage
        onAuthSuccess={handleAuthSuccess}
        onGoToLogin={() => setShowSignup(false)}
        loginFn={login}
      />
    ) : (
      <LoginPage
        onAuthSuccess={handleAuthSuccess}
        onGoToSignup={() => setShowSignup(true)}
        loginFn={login}
      />
    );
  }

  return <RouterProvider router={router} context={{ logout }} />;
}
