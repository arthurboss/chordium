import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { lazy, Suspense } from 'react';
import RootLayout from "@/components/layouts/RootLayout";

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
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Suspense fallback={<Loading />}><Home /></Suspense> // Default to Home, which can handle /search
      },
      {
        path: "search",
        element: <Suspense fallback={<Loading />}><Home /></Suspense>
      },
      {
        path: "search-refresh",
        element: <Navigate to="/search" replace /> // Redirect to /search
      },
      {
        path: "upload",
        element: <Suspense fallback={<Loading />}><Home /></Suspense>
      },
      {
        path: "my-chord-sheets",
        element: <Suspense fallback={<Loading />}><Home /></Suspense>
      },
      {
        // Route for songs from My Chord Sheets: /my-chord-sheets/artist/song
        path: "my-chord-sheets/:artist/:song", 
        element: <Suspense fallback={<Loading />}><ChordViewer /></Suspense>
      },
      {
        // Route for songs from search results: /artist/song
        path: ":artist/:song",
        element: <Suspense fallback={<Loading />}><ChordViewer /></Suspense>
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
