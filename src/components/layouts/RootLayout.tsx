import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

/**
 * Root layout component that wraps all routes
 * Provides common UI elements and context providers
 */
const RootLayout = () => {
  return (
    <>
      <Toaster />
      <Sonner />
      <Outlet />
    </>
  );
};

export default RootLayout;