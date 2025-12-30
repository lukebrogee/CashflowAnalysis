/*
------------------------------------------------------------------
FILE NAME:     AuthContext.tsx
PROJECT:       CashflowAnalysis
Date Created:  Dec-24-2025
--------------------------------------------------------------------
DESCRIPTION:
Authorizes the user based on active session-id cookie
--------------------------------------------------------------------
$HISTORY:

Dec-24-2025   Created initial file.
Dec-30-2025   Incorporated authentication logic with the backend api
------------------------------------------------------------------
*/
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

type AuthCtx = {
  authorized: boolean;
  loading: boolean;
  checkAuth: () => Promise<boolean>;
  setAuthorized: (v: boolean) => void; // optional, handy after login/logout
};

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  const location = useLocation();

  // Prevent overlapping checks + avoid spamming if route changes quickly
  const inFlight = useRef<AbortController | null>(null);
  const lastCheckedPath = useRef<string | null>(null);

  const checkAuth = async (): Promise<boolean> => {
    // cancel prior request if still running
    if (inFlight.current) inFlight.current.abort();
    const controller = new AbortController();
    inFlight.current = controller;

    try {
      const res = await fetch("/api/check_auth", {
        method: "GET",
        credentials: "include",
        signal: controller.signal,
      });

      // Best practice: backend returns 200 if valid, 401 if not.
      const ok = res.ok;
      console.log("check_auth:", res.status, res.ok);
      setAuthorized(ok);
      return ok;
    } catch (e: any) {
      // Ignore aborts (expected during route changes)
      if (e?.name === "AbortError") return authorized;
      setAuthorized(false);
      return false;
    } finally {
      setLoading(false);
      inFlight.current = null;
    }
  };

  // 1) On first load
  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) On route change
  useEffect(() => {
    // optional: don’t re-check if the pathname didn’t actually change
    if (lastCheckedPath.current === location.pathname) return;
    lastCheckedPath.current = location.pathname;

    // optional: skip checks on purely public routes to reduce calls
    const publicPaths = ["/", "/login", "/signup"];
    if (publicPaths.includes(location.pathname)) return;

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  console.log("Returning AuthContext.Provider")

  return (
    <AuthContext.Provider value={{ authorized, loading, checkAuth, setAuthorized }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}