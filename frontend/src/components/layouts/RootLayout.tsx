import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { SearchStateProvider } from "@/context/SearchStateContext";

/**
 * Root layout component that wraps all routes
 * Provides common UI elements and context providers
 */
const RootLayout = () => {
  return (
    <SearchStateProvider>
      <Toaster />
      <Sonner />
      <Outlet />
    </SearchStateProvider>
  );
};

export default RootLayout;