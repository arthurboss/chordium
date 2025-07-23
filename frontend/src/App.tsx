import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { lazy, Suspense } from 'react';
import RootLayout from "@/components/layouts/RootLayout";
import { GlobalErrorBoundary, RouteErrorBoundary, AsyncErrorBoundary } from "@/components/ErrorBoundaryWrappers";
import { createQueryClientWithErrorHandling } from "@/utils/query-error-handling";

// Lazy load pages instead of direct imports
const Home = lazy(() => import("./pages/Home"));
const ChordViewer = lazy(() => import("./pages/ChordViewer"));
const NotFound = lazy(() => import("./pages/NotFound"));

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
        // Route for artist pages: /artist
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
        // Route for songs from My Chord Sheets: /my-chord-sheets/artist/song
        path: "my-chord-sheets/:artist/:song", 
        element: (
          <RouteErrorBoundary>
            <AsyncErrorBoundary>
              <Suspense fallback={<Loading />}>
                <ChordViewer />
              </Suspense>
            </AsyncErrorBoundary>
          </RouteErrorBoundary>
        )
      },
      {
        // Route for songs from search results: /artist/song
        path: ":artist/:song",
        element: (
          <RouteErrorBoundary>
            <AsyncErrorBoundary>
              <Suspense fallback={<Loading />}>
                <ChordViewer />
              </Suspense>
            </AsyncErrorBoundary>
          </RouteErrorBoundary>
        )
      },
      {
        path: "chord/:artist/:song",
        element: (
          <RouteErrorBoundary>
            <AsyncErrorBoundary>
              <Suspense fallback={<Loading />}>
                <ChordViewer />
              </Suspense>
            </AsyncErrorBoundary>
          </RouteErrorBoundary>
        )
      },
      {
        path: "chord/:id",
        element: (
          <RouteErrorBoundary>
            <AsyncErrorBoundary>
              <Suspense fallback={<Loading />}>
                <ChordViewer />
              </Suspense>
            </AsyncErrorBoundary>
          </RouteErrorBoundary>
        )
      },
      {
        // Catch-all route for 404
        path: "*",
        element: (
          <RouteErrorBoundary>
            <Suspense fallback={<Loading />}>
              <NotFound />
            </Suspense>
          </RouteErrorBoundary>
        )
      }
    ]
  }
]);

const App = () => (
  <GlobalErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RouterProvider router={router} />
      </TooltipProvider>
    </QueryClientProvider>
  </GlobalErrorBoundary>
);


export default App;
