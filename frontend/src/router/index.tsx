import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy } from 'react';
import { RouteWrapper } from "@/components/RouteWrapper";
import RootLayout from "@/components/layouts/RootLayout";
import OfflineRouteHandler from "@/components/OfflineRouteHandler";

// Lazy load pages
const Home = lazy(() => import("@/pages/Home"));
const ChordViewer = lazy(() => import("@/pages/chord-viewer"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <RouteWrapper><Home /></RouteWrapper> },
      { path: "search", element: <RouteWrapper><Home /></RouteWrapper> },
      { path: "search-refresh", element: <Navigate to="/search" replace /> },
      { path: "upload", element: <RouteWrapper><Home /></RouteWrapper> },
      {
        path: "my-chord-sheets",
        element: <RouteWrapper><Home /></RouteWrapper>
      },
      {
        path: ":artist",
        element: <RouteWrapper><Home /></RouteWrapper>
      },
      {
        path: ":artist/:song",
        element: (
          <RouteWrapper>
            <OfflineRouteHandler>
              <ChordViewer />
            </OfflineRouteHandler>
          </RouteWrapper>
        )
      },
      {
        path: "*",
        element: <RouteWrapper><Home /></RouteWrapper>
      }
    ]
  }
]);

export { router };
