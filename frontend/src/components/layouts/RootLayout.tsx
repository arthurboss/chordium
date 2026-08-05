import { Outlet } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryErrorBoundary } from "@/components/ErrorBoundaryWrappers";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { JamSessionProvider } from "@/features/jam-session/JamSessionProvider";
import { ActiveChordSheetProvider } from "@/features/jam-session/ActiveChordSheetContext";

const RootLayout = () => {
  return (
    <>
      <Sonner />
      <QueryErrorBoundary>
        <JamSessionProvider>
          <ActiveChordSheetProvider>
            <div id="app-layout" className="flex flex-col min-h-dvh">
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
