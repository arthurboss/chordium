"use client";
import { useEffect, useState, useCallback } from "react";

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Apply theme to document
  const applyTheme = useCallback((newTheme: "light" | "dark") => {
    document.documentElement.dataset.theme = newTheme;
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  }, []);

  // Initialize theme on mount
  useEffect(() => {
    const stored = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = stored || (systemPrefersDark ? "dark" : "light");
    applyTheme(initial);
    setTheme(initial);

    // Listen to system theme changes if user hasn't overridden
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem("theme")) {
        const systemTheme = e.matches ? "dark" : "light";
        applyTheme(systemTheme);
        setTheme(systemTheme);
      }
    };
    media.addEventListener("change", handleSystemChange);
    return () => media.removeEventListener("change", handleSystemChange);
  }, [applyTheme]);

  // Toggle theme manually
  const toggleTheme = useCallback(() => {
    const newTheme = theme === "dark" ? "light" : "dark";
    applyTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    setTheme(newTheme);
  }, [theme, applyTheme]);

  // Reset to system preference
  const resetTheme = useCallback(() => {
    localStorage.removeItem("theme");
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    applyTheme(systemTheme);
    setTheme(systemTheme);
  }, [applyTheme]);

  return { theme, toggleTheme, resetTheme, setTheme };
}