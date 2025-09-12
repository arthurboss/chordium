import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { lazy, Suspense, useEffect } from 'react';
import RootLayout from "@/components/layouts/RootLayout";
import { GlobalErrorBoundary, RouteErrorBoundary, AsyncErrorBoundary } from "@/components/ErrorBoundaryWrappers";
import { createQueryClientWithErrorHandling } from "@/utils/query-error-handling";
// import OfflineTestPanel from "@/components/OfflineTestPanel";
import OfflineToast from "@/components/OfflineToast";
import OfflineRouteHandler from "@/components/OfflineRouteHandler";
import SmallScreenWarning from "@/components/SmallScreenWarning";

// Lazy load pages instead of direct imports
const Home = lazy(() => import("./pages/Home"));
const ChordViewer = lazy(() => import("./pages/chord-viewer"));
// Temporarily removed SmartRouteHandler to fix rendering issues
// const SmartRouteHandler = lazy(() => import("./components/SmartRouteHandler"));

const queryClient = createQueryClientWithErrorHandling();

// Enhanced loading component for Suspense
const Loading = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    <span className="ml-2">Loading...</span>
  </div>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: (
          <RouteErrorBoundary>
            <AsyncErrorBoundary>
              <Suspense fallback={<Loading />}>
                <Home />
              </Suspense>
            </AsyncErrorBoundary>
          </RouteErrorBoundary>
        )
      },
      {
        path: "search",
        element: (
          <RouteErrorBoundary>
            <AsyncErrorBoundary>
              <Suspense fallback={<Loading />}>
                <Home />
              </Suspense>
            </AsyncErrorBoundary>
          </RouteErrorBoundary>
        )
      },
      {
        path: "search-refresh",
        element: <Navigate to="/search" replace /> // Redirect to /search
      },
      {
        path: "upload",
        element: (
          <RouteErrorBoundary>
            <AsyncErrorBoundary>
              <Suspense fallback={<Loading />}>
                <Home />
              </Suspense>
            </AsyncErrorBoundary>
          </RouteErrorBoundary>
        )
      },
      {
        path: "my-chord-sheets",
        element: (
          <RouteErrorBoundary>
            <AsyncErrorBoundary>
              <Suspense fallback={<Loading />}>
                <Home />
              </Suspense>
            </AsyncErrorBoundary>
          </RouteErrorBoundary>
        )
      },
      {
        // Route for artist pages: /:artist - temporarily simplified
        path: ":artist",
        element: (
          <RouteErrorBoundary>
            <AsyncErrorBoundary>
              <Suspense fallback={<Loading />}>
                <Home />
              </Suspense>
            </AsyncErrorBoundary>
          </RouteErrorBoundary>
        )
      },
      {
        // Unified route for all chord sheets: /artist/song
        path: ":artist/:song",
        element: (
          <RouteErrorBoundary>
            <AsyncErrorBoundary>
              <Suspense fallback={<Loading />}>
                <OfflineRouteHandler>
                  <ChordViewer />
                </OfflineRouteHandler>
              </Suspense>
            </AsyncErrorBoundary>
          </RouteErrorBoundary>
        )
      },
      {
        // Catch-all route for 404 - temporarily simplified
        path: "*",
        element: (
          <RouteErrorBoundary>
            <AsyncErrorBoundary>
              <Suspense fallback={<Loading />}>
                <Home />
              </Suspense>
            </AsyncErrorBoundary>
          </RouteErrorBoundary>
        )
      }
    ]
  }
]);

// Component to handle app initialization
const AppInitializer = ({ children }: { children: React.ReactNode }) => {
  // App initialization logic can be added here if needed
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
