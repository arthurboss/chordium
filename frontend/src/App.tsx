import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { lazy, Suspense, useEffect } from 'react';
import RootLayout from "@/components/layouts/RootLayout";
import { GlobalErrorBoundary, RouteErrorBoundary, AsyncErrorBoundary } from "@/components/ErrorBoundaryWrappers";
import { createQueryClientWithErrorHandling } from "@/utils/query-error-handling";
import { KeepAliveService } from "@/services/keep-alive.service";
import OfflineRouteHandler from "@/components/OfflineRouteHandler";
import OfflineTestPanel from "@/components/OfflineTestPanel";

// Lazy load pages instead of direct imports
const Home = lazy(() => import("./pages/Home"));
const ChordViewer = lazy(() => import("./pages/chord-viewer"));
const SmartRouteHandler = lazy(() => import("./components/SmartRouteHandler"));

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
              <OfflineRouteHandler>
                <Suspense fallback={<Loading />}>
                  <Home />
                </Suspense>
              </OfflineRouteHandler>
            </AsyncErrorBoundary>
          </RouteErrorBoundary>
        )
      },
      {
        path: "search",
        element: (
          <RouteErrorBoundary>
            <AsyncErrorBoundary>
              <OfflineRouteHandler>
                <Suspense fallback={<Loading />}>
                  <Home />
                </Suspense>
              </OfflineRouteHandler>
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
              <OfflineRouteHandler>
                <Suspense fallback={<Loading />}>
                  <Home />
                </Suspense>
              </OfflineRouteHandler>
            </AsyncErrorBoundary>
          </RouteErrorBoundary>
        )
      },
      {
        path: "my-chord-sheets",
        element: (
          <RouteErrorBoundary>
            <AsyncErrorBoundary>
              <OfflineRouteHandler>
                <Suspense fallback={<Loading />}>
                  <Home />
                </Suspense>
              </OfflineRouteHandler>
            </AsyncErrorBoundary>
          </RouteErrorBoundary>
        )
      },
      {
        // Route for artist pages: /artist
        path: ":artist",
        element: (
          <RouteErrorBoundary>
            <AsyncErrorBoundary>
              <OfflineRouteHandler>
                <Suspense fallback={<Loading />}>
                  <Home />
                </Suspense>
              </OfflineRouteHandler>
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
              <OfflineRouteHandler>
                <Suspense fallback={<Loading />}>
                  <ChordViewer />
                </Suspense>
              </OfflineRouteHandler>
            </AsyncErrorBoundary>
          </RouteErrorBoundary>
        )
      },
      {
        // Catch-all route for 404
        path: "*",
        element: (
          <RouteErrorBoundary>
            <AsyncErrorBoundary>
              <OfflineRouteHandler>
                <Suspense fallback={<Loading />}>
                  <SmartRouteHandler />
                </Suspense>
              </OfflineRouteHandler>
            </AsyncErrorBoundary>
          </RouteErrorBoundary>
        )
      }
    ]
  }
]);

// Component to handle app initialization
const AppInitializer = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    // Only initialize keep-alive service in production
    if (import.meta.env.PROD) {
      KeepAliveService.initializeOnAppStart();
    }
  }, []);

  return <>{children}</>;
};

const App = () => (
  <GlobalErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppInitializer>
          <RouterProvider router={router} />
          <OfflineTestPanel />
        </AppInitializer>
      </TooltipProvider>
    </QueryClientProvider>
  </GlobalErrorBoundary>
);


export default App;
