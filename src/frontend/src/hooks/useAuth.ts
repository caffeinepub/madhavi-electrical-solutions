import { useState } from "react";

const AUTH_KEY = "mes_auth_email";

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => !!localStorage.getItem(AUTH_KEY),
  );

  function login(email: string) {
    localStorage.setItem(AUTH_KEY, email);
    setIsLoggedIn(true);
  }

  function logout() {
    localStorage.removeItem(AUTH_KEY);
    setIsLoggedIn(false);
  }

  function getEmail(): string | null {
    return localStorage.getItem(AUTH_KEY);
  }

  return { isLoggedIn, login, logout, getEmail };
}
