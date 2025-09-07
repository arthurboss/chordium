import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryErrorBoundary } from "@/components/ErrorBoundaryWrappers";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import SmallScreenWarning from "@/components/SmallScreenWarning";

/**
 * Root layout component that wraps all routes
 * Provides common UI elements and context providers
 */
const RootLayout = () => {
  return (
    <>
      <Toaster />
      <Sonner />
      <QueryErrorBoundary>
        <Header />
        {/* Warning for small screens. CSS handles visibility */}
        <SmallScreenWarning />
        <Outlet />
        <Footer />
      </QueryErrorBoundary>
    </>
  );
};

export default RootLayout;