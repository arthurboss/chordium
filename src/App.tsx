
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { lazy, Suspense } from 'react';

// Lazy load pages instead of direct imports
const Home = lazy(() => import("./pages/Home"));
const ChordViewer = lazy(() => import("./pages/ChordViewer"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// Loading component for Suspense
const Loading = () => <div className="flex justify-center items-center h-screen">Loading...</div>;

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/my-songs" replace />
  },
  {
    path: "/search",
    element: <Suspense fallback={<Loading />}><Home /></Suspense>
  },
  {
    path: "/upload",
    element: <Suspense fallback={<Loading />}><Home /></Suspense>
  },
  {
    path: "/my-songs",
    element: <Suspense fallback={<Loading />}><Home /></Suspense>
  },
  {
    path: "/chord/:id",
    element: <Suspense fallback={<Loading />}><ChordViewer /></Suspense>
  },
  {
    // Catch-all route for 404
    path: "*",
    element: <Suspense fallback={<Loading />}><NotFound /></Suspense>
  }
]);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <RouterProvider router={router} />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
