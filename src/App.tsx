
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from "react-router-dom";
import { lazy, Suspense } from 'react';
import RootLayout from "@/components/layouts/RootLayout";

// Lazy load pages instead of direct imports
const Home = lazy(() => import("./pages/Home"));
const ChordViewer = lazy(() => import("./pages/ChordViewer"));
const NotFound = lazy(() => import("./pages/NotFound"));
const TestPage = lazy(() => import("./pages/TestPage"));
const ScrapeTestPage = lazy(() => import("./pages/ScrapeTestPage"));

const queryClient = new QueryClient();

// Loading component for Suspense
const Loading = () => <div className="flex justify-center items-center h-screen">Loading...</div>;

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/my-songs" replace />
      },
      {
        path: "search",
        element: <Suspense fallback={<Loading />}><Home /></Suspense>
      },
      {
        path: "upload",
        element: <Suspense fallback={<Loading />}><Home /></Suspense>
      },
      {
        path: "my-songs",
        element: <Suspense fallback={<Loading />}><Home /></Suspense>
      },
      {
        path: "chord/:artist/:song",
        element: <Suspense fallback={<Loading />}><ChordViewer /></Suspense>
      },
      {
        path: "chord/:id",
        element: <Suspense fallback={<Loading />}><ChordViewer /></Suspense>
      },
      {
        path: "test",
        element: <Suspense fallback={<Loading />}><TestPage /></Suspense>
      },
      {
        path: "scrape-test",
        element: <Suspense fallback={<Loading />}><ScrapeTestPage /></Suspense>
      },
      {
        // Catch-all route for 404
        path: "*",
        element: <Suspense fallback={<Loading />}><NotFound /></Suspense>
      }
    ]
  }
]);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <RouterProvider router={router} />
    </TooltipProvider>
  </QueryClientProvider>
);


export default App;
