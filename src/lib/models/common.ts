/**
 * LootLoom — Common API Models
 * Shared request/response envelope types used across all API services.
 */

/** Standard API success response envelope. */
export interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
}

/** Standard API error response envelope. */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

/** Union response type for type narrowing in services. */
export type ApiResult<T> = ApiResponse<T> | ApiErrorResponse;

/** Pagination metadata returned by list endpoints. */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/** Paginated list response wrapper. */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

/** Generic query parameters for list/filter endpoints. */
export interface ListQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/** ISO-8601 timestamp string (e.g. "2025-01-15T10:30:00.000Z"). */
export type ISODateString = string;

/** Branded UUID string type for type-safe IDs. */
export type UUID = string & { readonly __brand: "UUID" };

/** Generic identifier — UUID or database-generated ID. */
export type EntityId = string;

/** Standard entity timestamps. */
export interface Timestamps {
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/** Soft-delete aware entity. */
export interface SoftDeletable extends Timestamps {
  deletedAt?: ISODateString | null;
}

/** Generic key-value metadata bag. */
export type Metadata = Record<string, string | number | boolean | null>;

/** Helper: type guard for ApiResponse success. */
export function isApiSuccess<T>(result: ApiResult<T>): result is ApiResponse<T> {
  return result.success === true;
}

/** Helper: type guard for ApiErrorResponse. */
export function isApiError<T>(result: ApiResult<T>): result is ApiErrorResponse {
  return result.success === false;
}
