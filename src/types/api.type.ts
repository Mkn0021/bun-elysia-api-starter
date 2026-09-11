import { z } from "zod";
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

export interface ValidationSchema {
    body?: z.ZodType;
    query?: z.ZodType;
    params?: z.ZodType;
}

export type Session = Awaited<ReturnType<typeof auth.api.getSession>>;

export interface CacheConfig {
    table: string;
    getId: (context: CacheContext) => string | null;
    invalidate?: (context: CacheContext) => string[];
}

export type InferValidatedData<T extends ValidationSchema | undefined> = T extends ValidationSchema
    ? {
          query: T["query"] extends z.ZodType ? z.infer<T["query"]> : undefined;
          params: T["params"] extends z.ZodType ? z.infer<T["params"]> : undefined;
          body: T["body"] extends z.ZodType ? z.infer<T["body"]> : undefined;
      }
    : {};
