import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { GlobalErrorBoundary } from "@/components/ErrorBoundaryWrappers";
import { createQueryClientWithErrorHandling } from "@/utils/query-error-handling";
import OfflineToast from "@/components/OfflineToast";
import SmallScreenWarning from "@/components/SmallScreenWarning";
import { useServiceWorkerUpdate } from "@/hooks/useServiceWorkerUpdate";
import { router } from "./router";

const queryClient = createQueryClientWithErrorHandling();

// Component to handle app initialization
const AppInitializer = ({ children }: { children: React.ReactNode }) => {
  useServiceWorkerUpdate();
  return <>{children}</>;
};

const App = () => (
  <GlobalErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppInitializer>
          {/* Small screen warning - positioned at app level */}
          <SmallScreenWarning />
          <RouterProvider router={router} />
          <OfflineToast />
          {/* {import.meta.env.DEV && <OfflineTestPanel />} */}
        </AppInitializer>
      </TooltipProvider>
    </QueryClientProvider>
  </GlobalErrorBoundary>
);


export default App;
