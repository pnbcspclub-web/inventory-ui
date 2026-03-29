"use client";

import { ConfigProvider, theme as antdTheme } from "antd";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type ThemeMode = "light" | "dark";

type ThemeContextValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = "theme";

const readStoredTheme = () => {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : null;
};

const getPreferredTheme = () => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = readStoredTheme();
    const preferred = getPreferredTheme();
    setMode(stored ?? preferred);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute("data-theme", mode);
    window.localStorage.setItem(THEME_STORAGE_KEY, mode);
  }, [mode, mounted]);

  const value = useMemo(
    () => ({
      mode,
      setMode,
      toggle: () => setMode((current) => (current === "dark" ? "light" : "dark")),
    }),
    [mode]
  );

  // Prevent hydration mismatch by not rendering theme-specific components until mounted
  // We still render children to allow SEO and initial paint, but we wrap them
  // to avoid Ant Design's ConfigProvider flicker during hydration.
  return (
    <ThemeContext.Provider value={value}>
      {!mounted ? (
        <div style={{ visibility: "hidden" }}>{children}</div>
      ) : (
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: mode === "dark" ? "#3b82f6" : "#2563eb",
              colorSuccess: "#10b981",
              colorError: "#ef4444",
              colorWarning: "#f59e0b",
              colorInfo: "#3b82f6",
              colorTextBase: mode === "dark" ? "#f8fafc" : "#1a1a1a",
              colorBgLayout: mode === "dark" ? "#0f172a" : "#fdfdfd",
              colorBgContainer: mode === "dark" ? "#1e293b" : "#ffffff",
              colorBorder: mode === "dark" ? "#334155" : "#e2e8f0",
              fontFamily: "var(--font-manrope)",
              borderRadius: 12,
            },
            algorithm:
              mode === "dark"
                ? antdTheme.darkAlgorithm
                : antdTheme.defaultAlgorithm,
          }}
        >
          {children}
        </ConfigProvider>
      )}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
