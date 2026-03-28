import { useState } from "react";

const AUTH_KEY = "mes_auth_email";
const PASSWORD_KEY = "mes_auth_password";

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
    sessionStorage.removeItem(PASSWORD_KEY);
    setIsLoggedIn(false);
  }

  function getEmail(): string | null {
    return localStorage.getItem(AUTH_KEY);
  }

  function getPasswordHash(): string | null {
    return sessionStorage.getItem(PASSWORD_KEY);
  }

  return { isLoggedIn, login, logout, getEmail, getPasswordHash };
}
