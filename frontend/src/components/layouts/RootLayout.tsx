import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryErrorBoundary } from "@/components/ErrorBoundaryWrappers";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { JamSessionProvider } from "@/features/jam-session/JamSessionProvider";

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
        <JamSessionProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
              <Outlet />
            </main>
            <Footer />
          </div>
        </JamSessionProvider>
      </QueryErrorBoundary>
    </>
  );
};

export default RootLayout;