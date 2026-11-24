import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryErrorBoundary } from "@/components/ErrorBoundaryWrappers";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { JamSessionProvider } from "@/features/jam-session/JamSessionProvider";
import { ActiveChordSheetProvider } from "@/features/jam-session/ActiveChordSheetContext";
import { applyPageMetadata } from "@/seo/page-metadata";

const RootLayout = () => {
  const location = useLocation();

  useEffect(() => {
    applyPageMetadata(location.pathname);
  }, [location.pathname]);

  return (
    <>
      <Sonner />
      <QueryErrorBoundary>
        <JamSessionProvider>
          <ActiveChordSheetProvider>
            <div id="app-layout" className="flex flex-col min-h-dvh">
              {process.env.VITE_DEV_BUILD === 'true' && (
                <div className="w-full bg-primary/30 py-1 text-center text-xs font-medium">
                  Dev Mode
                </div>
              )}
              <Header />
              <Outlet />
              <Footer />
            </div>
          </ActiveChordSheetProvider>
        </JamSessionProvider>
      </QueryErrorBoundary>
    </>
  );
};

export default RootLayout;
