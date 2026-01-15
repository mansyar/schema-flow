import { createRouter } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import type * as React from "react"; // Added for React.ReactNode type

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Create a new router instance
export const getRouter = () => {
  const CONVEX_URL = (import.meta as any).env.VITE_CONVEX_URL!;
  if (!CONVEX_URL) {
    console.error("missing envar VITE_CONVEX_URL");
  }
  const convexClient = new ConvexReactClient(CONVEX_URL);
  const convexQueryClient = new ConvexQueryClient(convexClient);

  const queryClient: QueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: convexQueryClient.hashFn(),
        queryFn: convexQueryClient.queryFn(),
      },
    },
  });
  convexQueryClient.connect(queryClient);

  const router = createRouter({
    routeTree,
    context: { queryClient, convexClient },

    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    Wrap: ({ children }: { children: React.ReactNode }) => (
      <ConvexAuthProvider client={convexClient}>{children}</ConvexAuthProvider>
    ),
  });

  return router;
};
