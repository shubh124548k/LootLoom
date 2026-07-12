/**
 * LootLoom — Typed HTTP Client
 * Foundation for the API service layer. Wraps fetch with:
 *   - JSON serialization/parsing
 *   - Typed responses via generics
 *   - Standardized error mapping (throws ApiError subclasses)
 *   - Auth token forwarding (cookies — NextAuth JWT)
 *   - Query string builder
 *
 * No fake responses. No hardcoded data. Pure typed transport.
 */
import type { ApiResult, ApiResponse, ApiErrorResponse, ListQueryParams } from "@/lib/models/common";
import {
  ApiError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ServerError,
  NetworkError,
  toApiError,
  isApiError,
} from "@/lib/errors";

/* ============================================================
   Configuration
   ============================================================ */

/** Base API path — all requests are relative to this. */
const BASE_URL = "/api";

/** Default request timeout (ms). */
const DEFAULT_TIMEOUT = 30_000;

/** Default headers for JSON requests. */
const JSON_HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

/* ============================================================
   Types
   ============================================================ */

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
  headers?: Record<string, string>;
  timeout?: number;
  /** AbortSignal from caller (for cancellable requests). */
  signal?: AbortSignal;
  /** Set to `true` to skip JSON parsing (e.g. for blob downloads). */
  rawResponse?: boolean;
}

export interface HttpClient {
  get<T>(path: string, options?: Omit<RequestOptions, "method" | "body">): Promise<T>;
  post<T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">): Promise<T>;
  put<T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">): Promise<T>;
  patch<T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">): Promise<T>;
  delete<T>(path: string, options?: Omit<RequestOptions, "method" | "body">): Promise<T>;
}

/* ============================================================
   Query string builder
   ============================================================ */

export function buildQueryString(params?: Record<string, string | number | boolean | undefined | null>): string {
  if (!params) return "";
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== ""
  );
  if (entries.length === 0) return "";
  const search = new URLSearchParams();
  for (const [key, value] of entries) {
    search.set(key, String(value));
  }
  return `?${search.toString()}`;
}

/** Build query string from ListQueryParams (page, pageSize, search, sortBy, sortOrder). */
export function buildListQuery(params?: ListQueryParams): string {
  if (!params) return "";
  return buildQueryString({
    page: params.page,
    pageSize: params.pageSize,
    search: params.search,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  });
}

/* ============================================================
   Error mapping
   ============================================================ */

function mapStatusToError(
  status: number,
  body: ApiErrorResponse | unknown
): ApiError {
  const errorBody = (body as ApiErrorResponse)?.error;
  const message = errorBody?.message ?? "Request failed.";
  const details = errorBody?.details;
  const code = errorBody?.code;

  switch (status) {
    case 401:
      return new UnauthorizedError(message, { details });
    case 403:
      return new ForbiddenError(message, { details });
    case 404:
      return new NotFoundError(message, { details });
    case 409:
      return new ConflictError(message, { details });
    case 422:
      return new ValidationError(message, {
        fieldErrors: details as Record<string, string> | undefined,
        details,
      });
    case 429: {
      const retryAfter = (details as { retryAfterSeconds?: number } | undefined)?.retryAfterSeconds;
      return new RateLimitError(message, { retryAfterSeconds: retryAfter, details });
    }
    default:
      if (status >= 500) {
        return new ServerError(message, { status, details });
      }
      return new ApiError(message, { status, code, details });
  }
}

/* ============================================================
   Core request function
   ============================================================ */

/**
 * Core typed request. Unwraps the `ApiResponse<T>` envelope and returns `T`.
 * Throws ApiError subclasses on failure.
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const {
    method = "GET",
    body,
    params,
    headers = {},
    timeout = DEFAULT_TIMEOUT,
    signal,
    rawResponse = false,
  } = options;

  const url = `${BASE_URL}${path}${buildQueryString(params)}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // Combine caller's signal with our timeout signal
  if (signal) {
    signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: { ...JSON_HEADERS, ...headers },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: "include", // send NextAuth JWT cookie
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError("Request timed out.", { status: 0, code: "TIMEOUT" });
    }
    throw new NetworkError(undefined, { cause: err });
  }
  clearTimeout(timeoutId);

  if (rawResponse) {
    return response as unknown as T;
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    if (!response.ok) {
      throw mapStatusToError(response.status, null);
    }
    throw new ServerError("Invalid JSON response from server.");
  }

  if (!response.ok) {
    throw mapStatusToError(response.status, json);
  }

  const result = json as ApiResult<T>;
  if (result.success === true) {
    return result.data;
  }
  if (result.success === false) {
    throw mapStatusToError(response.status, result);
  }

  // Some endpoints may return data directly without an envelope.
  // Allow passthrough for non-conforming endpoints.
  return json as T;
}

/* ============================================================
   HttpClient implementation
   ============================================================ */

export const httpClient: HttpClient = {
  get: (path, options) => request(path, { ...options, method: "GET" }),
  post: (path, body, options) => request(path, { ...options, method: "POST", body }),
  put: (path, body, options) => request(path, { ...options, method: "PUT", body }),
  patch: (path, body, options) => request(path, { ...options, method: "PATCH", body }),
  delete: (path, options) => request(path, { ...options, method: "DELETE" }),
};

/* ============================================================
   Convenience: requestRaw (for non-JSON responses)
   ============================================================ */

export async function requestRaw(path: string, options: RequestOptions = {}): Promise<Response> {
  return request<Response>(path, { ...options, rawResponse: true });
}

/* ============================================================
   Re-exports
   ============================================================ */

export { toApiError, isApiError, ApiError, UnauthorizedError, ValidationError, NetworkError, ServerError };
