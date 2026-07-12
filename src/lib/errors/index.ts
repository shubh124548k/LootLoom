/**
 * LootLoom — API Error Types
 * Standardized error hierarchy for the frontend service layer.
 *
 * All API errors extend ApiError. Services throw these; UI catches and
 * renders appropriate ErrorState / toast / inline message.
 */

/** HTTP status codes used across the app. */
export type HttpStatus =
  | 400 // Bad Request
  | 401 // Unauthorized
  | 403 // Forbidden
  | 404 // Not Found
  | 409 // Conflict
  | 422 // Unprocessable Entity
  | 429 // Too Many Requests
  | 500 // Internal Server Error
  | 502 // Bad Gateway
  | 503 // Service Unavailable
  | 504; // Gateway Timeout

/** Base API error — all other errors extend this. */
export class ApiError extends Error {
  readonly status: HttpStatus | number;
  readonly code: string;
  readonly details?: Record<string, unknown>;
  readonly timestamp: string;
  readonly isApiError = true;

  constructor(
    message: string,
    options: {
      status?: HttpStatus | number;
      code?: string;
      details?: Record<string, unknown>;
      cause?: unknown;
    } = {}
  ) {
    super(message);
    this.name = "ApiError";
    this.status = options.status ?? 500;
    this.code = options.code ?? "INTERNAL_ERROR";
    this.details = options.details;
    this.timestamp = new Date().toISOString();
    if (options.cause) {
      (this as { cause?: unknown }).cause = options.cause;
    }
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /** Serialize to plain object (for logging / toast payloads). */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp,
    };
  }
}

/** 401 Unauthorized — session expired or never authenticated. */
export class UnauthorizedError extends ApiError {
  constructor(
    message = "Your session has expired. Please sign in again.",
    options: { details?: Record<string, unknown> } = {}
  ) {
    super(message, {
      status: 401,
      code: "UNAUTHORIZED",
      details: options.details,
    });
    this.name = "UnauthorizedError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** 403 Forbidden — authenticated but lacks permission (e.g. user accessing CEO area). */
export class ForbiddenError extends ApiError {
  constructor(
    message = "You don't have permission to perform this action.",
    options: { details?: Record<string, unknown> } = {}
  ) {
    super(message, {
      status: 403,
      code: "FORBIDDEN",
      details: options.details,
    });
    this.name = "ForbiddenError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** 400/422 Validation error — backend rejected the request payload. */
export class ValidationError extends ApiError {
  readonly fieldErrors: Record<string, string>;

  constructor(
    message = "Please correct the highlighted fields.",
    options: {
      fieldErrors?: Record<string, string>;
      details?: Record<string, unknown>;
    } = {}
  ) {
    super(message, {
      status: 422,
      code: "VALIDATION_ERROR",
      details: options.details,
    });
    this.name = "ValidationError";
    this.fieldErrors = options.fieldErrors ?? {};
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** 404 Not Found — requested resource does not exist. */
export class NotFoundError extends ApiError {
  constructor(
    resource: string,
    options: { details?: Record<string, unknown> } = {}
  ) {
    super(`${resource} not found.`, {
      status: 404,
      code: "NOT_FOUND",
      details: options.details,
    });
    this.name = "NotFoundError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** 409 Conflict — duplicate resource state (e.g. username taken). */
export class ConflictError extends ApiError {
  constructor(
    message = "This action conflicts with the current state.",
    options: { details?: Record<string, unknown> } = {}
  ) {
    super(message, {
      status: 409,
      code: "CONFLICT",
      details: options.details,
    });
    this.name = "ConflictError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** 429 Too Many Requests — rate limited. */
export class RateLimitError extends ApiError {
  readonly retryAfterSeconds: number;

  constructor(
    message = "Too many requests. Please slow down.",
    options: { retryAfterSeconds?: number; details?: Record<string, unknown> } = {}
  ) {
    super(message, {
      status: 429,
      code: "RATE_LIMITED",
      details: options.details,
    });
    this.name = "RateLimitError";
    this.retryAfterSeconds = options.retryAfterSeconds ?? 60;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** 5xx Server Error — backend fault. */
export class ServerError extends ApiError {
  constructor(
    message = "Something went wrong on our end. Please try again.",
    options: { status?: number; details?: Record<string, unknown> } = {}
  ) {
    super(message, {
      status: options.status ?? 500,
      code: "SERVER_ERROR",
      details: options.details,
    });
    this.name = "ServerError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Network error — request never reached the server (offline/DNS failure). */
export class NetworkError extends ApiError {
  constructor(
    message = "Network error. Please check your connection and try again.",
    options: { cause?: unknown } = {}
  ) {
    super(message, {
      status: 0,
      code: "NETWORK_ERROR",
    });
    this.name = "NetworkError";
    if (options.cause) {
      (this as { cause?: unknown }).cause = options.cause;
    }
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Type guard: is the thrown value an ApiError? */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "isApiError" in error &&
    (error as { isApiError: boolean }).isApiError === true
  );
}

/** Type guard: is this a specific ApiError subclass? */
export function isUnauthorizedError(error: unknown): error is UnauthorizedError {
  return isApiError(error) && error.status === 401;
}

export function isValidationError(error: unknown): error is ValidationError {
  return isApiError(error) && error.code === "VALIDATION_ERROR";
}

export function isNetworkError(error: unknown): error is NetworkError {
  return isApiError(error) && error.code === "NETWORK_ERROR";
}

export function isServerError(error: unknown): error is ServerError {
  return isApiError(error) && error.status >= 500 && error.status < 600;
}

/**
 * Normalize any thrown value into an ApiError instance.
 * Useful in catch blocks: `catch (e) { throw toApiError(e); }`
 */
export function toApiError(error: unknown): ApiError {
  if (isApiError(error)) return error;

  if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
    return new NetworkError(undefined, { cause: error });
  }

  if (error instanceof Error) {
    return new ApiError(error.message, { cause: error });
  }

  return new ApiError("An unknown error occurred.");
}
