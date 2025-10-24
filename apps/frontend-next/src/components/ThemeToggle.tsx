"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();
    const ThemeIcon = theme === "dark" ? Moon : Sun;

    return (
        <button
            type="button"
            aria-label="Toggle theme"
            className="flex justify-center items-center h-10 w-10 rounded-md border"
            onClick={toggleTheme}
        >
            <ThemeIcon size={20} />
        </button>
    );
};