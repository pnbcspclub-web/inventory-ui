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

  useEffect(() => {
    const stored = readStoredTheme();
    setMode(stored ?? getPreferredTheme());
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-theme", mode);
    window.localStorage.setItem(THEME_STORAGE_KEY, mode);
  }, [mode]);

  const value = useMemo(
    () => ({
      mode,
      setMode,
      toggle: () => setMode((current) => (current === "dark" ? "light" : "dark")),
    }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={value}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "var(--brand)",
            colorSuccess: "var(--accent)",
            colorTextBase: "var(--foreground)",
            colorBgLayout: "var(--background)",
            colorBgContainer: "var(--surface)",
            colorBorder: "var(--border)",
            fontFamily: "var(--font-manrope)",
          },
          algorithm:
            mode === "dark"
              ? antdTheme.darkAlgorithm
              : antdTheme.defaultAlgorithm,
        }}
      >
        {children}
      </ConfigProvider>
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
