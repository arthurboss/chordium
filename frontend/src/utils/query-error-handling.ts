import { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface QueryInfo {
  queryKey?: unknown[];
  queryHash?: string;
}

export const handleQueryError = (error: Error, query?: QueryInfo) => {
  console.error("React Query Error:", {
    error: error.message,
    stack: error.stack,
    queryKey: query?.queryKey,
    queryHash: query?.queryHash,
    timestamp: new Date().toISOString(),
    url: window.location.href,
  });

  const shouldShowToast = !isNetworkError(error) && !isCancelledError(error);

  if (shouldShowToast) {
    let message = "Something went wrong";
    let description = error.message;

    if (isServerError(error)) {
      message = "Server Error";
      description = "Our servers are experiencing issues. Please try again later.";
    } else if (isClientError(error)) {
      message = "Request Error";
      description = "There was a problem with your request. Please check your input and try again.";
    }

    toast.error(message, { description, duration: 5000 });
  }
};

export const createQueryClientWithErrorHandling = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          if (isClientError(error)) return false;
          if (isServerError(error) || isNetworkError(error)) return failureCount < 3;
          return failureCount < 2;
        },
        staleTime: 5 * 60 * 1000,
      },
      mutations: {
        retry: (failureCount, error) => isNetworkError(error) && failureCount < 1,
      },
    },
  });
};

function hasErrorCode(error: unknown): error is { code: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code?: unknown }).code === "string"
  );
}

const isNetworkError = (error: Error): boolean => {
  if (hasErrorCode(error)) {
    if (["ECONNABORTED", "ENOTFOUND", "ETIMEDOUT"].includes(error.code)) return true;
  }
  if ("cause" in error && error.cause instanceof Error) return isNetworkError(error.cause);
  return (
    error.message.includes("Network Error") ||
    error.message.includes("fetch") ||
    error.name === "NetworkError"
  );
};

const isServerError = (error: Error): boolean =>
  "status" in error && typeof error.status === "number" && (error.status as number) >= 500;

const isClientError = (error: Error): boolean =>
  "status" in error &&
  typeof error.status === "number" &&
  (error.status as number) >= 400 &&
  (error.status as number) < 500;

const isCancelledError = (error: Error): boolean =>
  error.name === "AbortError" || error.message.includes("cancelled");

export const useQueryErrorHandler = () => {
  const handleError = (error: Error, context?: string) => {
    console.error(`Query Error in ${context}:`, error);
    handleQueryError(error);
  };
  return { handleError };
};
