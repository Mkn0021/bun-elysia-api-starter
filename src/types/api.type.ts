import type { auth } from "@/lib/auth";
import type { CacheContext } from "@/middlewares/handle-cache";

export interface SuccessResponse<T> {
    success: true;
    data: T;
    message?: string;
}

export interface ErrorResponse {
    success: false;
    error: string;
    details?: unknown;
}

export interface HandlerResult<T> {
    data?: T;
    message?: string;
    statusCode?: number;
    etag?: string;
    headers?: Record<string, string>;
}

export type Session = Awaited<ReturnType<typeof auth.api.getSession>>;

export interface CacheConfig {
    table: string;
    getId: (context: CacheContext) => string | null;
    invalidate?: (context: CacheContext) => string[];
}
