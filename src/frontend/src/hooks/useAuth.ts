import { useState } from "react";

const AUTH_KEY = "mes_auth_email";
const PASSWORD_KEY = "mes_auth_password";
const ROLE_KEY = "mes_auth_role";

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => !!localStorage.getItem(AUTH_KEY),
  );

  function login(email: string, role?: string) {
    localStorage.setItem(AUTH_KEY, email);
    if (role) localStorage.setItem(ROLE_KEY, role);
    setIsLoggedIn(true);
  }

  function logout() {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(ROLE_KEY);
    sessionStorage.removeItem(PASSWORD_KEY);
    setIsLoggedIn(false);
  }

  function getEmail(): string | null {
    return localStorage.getItem(AUTH_KEY);
  }

  function getPasswordHash(): string | null {
    return sessionStorage.getItem(PASSWORD_KEY);
  }

  function getRole(): string | null {
    return localStorage.getItem(ROLE_KEY);
  }

  return { isLoggedIn, login, logout, getEmail, getPasswordHash, getRole };
}
