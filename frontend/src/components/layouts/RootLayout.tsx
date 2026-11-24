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
  const devBuild = process.env.VITE_DEV_BUILD === "true";
  const bannerLabel = devBuild
    ? "Dev Mode"
    : process.env.NODE_ENV === "production"
      ? "In development: some features may not work as expected"
      : null;

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
              {bannerLabel && (
                <div
                  className={`w-full py-1 text-center text-xs font-medium ${
                    devBuild ? "bg-destructive text-destructive-foreground" : "bg-primary/30"
                  }`}
                >
                  {bannerLabel}
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
