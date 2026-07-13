import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
}

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || `Request failed: ${url}`);
  }
  return json.data as T;
}

async function poster<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || `Request failed: ${url}`);
  }
  return json.data as T;
}

/**
 * useApi — fetch data with automatic caching, deduplication, and background refetch.
 * Stale time: 30s. Cache time: 5min.
 */
export function useApi<T = unknown>(url: string | null, options?: { enabled?: boolean }) {
  return useQuery<T, Error>({
    queryKey: [url],
    queryFn: () => fetcher<T>(url!),
    enabled: !!url && (options?.enabled ?? true),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * useApiMutation — mutation hook for POST/PATCH/DELETE.
 * Automatically invalidates related queries on success.
 */
export function useApiMutation<T = unknown>(
  url: string,
  options?: {
    method?: "POST" | "PATCH" | "DELETE";
    invalidateKeys?: string[];
  }
) {
  const queryClient = useQueryClient();
  const { method = "POST", invalidateKeys } = options || {};

  return useMutation<T, Error, unknown>({
    mutationFn: async (body) => {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: method !== "DELETE" ? JSON.stringify(body) : undefined,
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || `Request failed: ${url}`);
      }
      return json.data as T;
    },
    onSuccess: () => {
      if (invalidateKeys) {
        invalidateKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
      }
    },
  });
}

/**
 * prefetchApi — prefetch data into cache for instant navigation.
 */
export function prefetchApi(queryClient: ReturnType<typeof useQueryClient>, url: string) {
  return queryClient.prefetchQuery({
    queryKey: [url],
    queryFn: () => fetcher(url),
    staleTime: 30 * 1000,
  });
}
