import { env } from "../env";
import type { Context } from "elysia";
import { getCookieCache } from "better-auth/cookies";

import APIError from "@/lib/api/error";
import { auth } from "@/lib/auth";
import { apiResponse } from "@/lib/api/response";
import { errorHandler } from "@/middlewares/error-handler";
import {
    checkCache,
    getCachedData,
    invalidateCache,
    persistCache,
} from "@/middlewares/handle-cache";

import type { CacheConfig, HandlerResult, Session } from "@/types";

type AuthMode = "cookie" | "database";

export const asyncHandler = <T>(
    handler: (context: Context, session: Session) => Promise<HandlerResult<T>>,
    options?: {
        requireAuth?: boolean;
        auth?: AuthMode;
        cache?: CacheConfig;
    },
) => {
    return async (context: Context) => {
        const { request, params, query, set } = context;

        try {
            const shouldRequireAuth = options?.requireAuth ?? true;
            const authMode = options?.auth ?? "database";

            const cookieSession =
                (shouldRequireAuth || options?.cache) && request.method === "GET"
                    ? await getCookieCache(request, {
                          secret: env.BETTER_AUTH_SECRET,
                          isSecure: new URL(request.url).protocol === "https:",
                      })
                    : null;

            if (options?.cache && request.method === "GET") {
                const cached = await checkCache(request, options.cache, {
                    params: params as Record<string, string> | undefined,
                    query: query as Record<string, unknown> | undefined,
                    session: cookieSession,
                });

                if (cached) {
                    set.status = cached.status;
                    Object.assign(set.headers, cached.headers);
                    return null;
                }
            }

            const session = shouldRequireAuth
                ? authMode === "cookie"
                    ? (cookieSession as Session)
                    : await auth.api.getSession({
                          headers: request.headers,
                      })
                : null;

            if (shouldRequireAuth && !session) {
                throw APIError.unauthorized("You must be logged in to access this resource");
            }

            if (options?.cache && request.method === "GET") {
                const cachedData = await getCachedData(options.cache, {
                    params: params as Record<string, string> | undefined,
                    query: query as Record<string, unknown> | undefined,
                    session,
                });

                if (cachedData) {
                    set.status = cachedData.statusCode ?? 200;

                    if (cachedData.etag) {
                        Object.assign(set.headers, {
                            ETag: cachedData.etag,
                        });
                    }

                    if (cachedData.headers) {
                        Object.assign(set.headers, cachedData.headers);
                    }

                    return apiResponse.success(cachedData.data ?? null, cachedData.message);
                }
            }

            const result = await handler(context, session);

            if (options?.cache?.invalidate) {
                const ids = options.cache.invalidate({
                    params: params as Record<string, string> | undefined,
                    query: query as Record<string, unknown> | undefined,
                    session,
                });

                await invalidateCache(options.cache.table, ids);
            }

            if (options?.cache && request.method === "GET") {
                await persistCache(result, options.cache, {
                    params: params as Record<string, string> | undefined,
                    query: query as Record<string, unknown> | undefined,
                    session,
                });
            }

            set.status = result.statusCode ?? 200;

            if (result.etag) {
                Object.assign(set.headers, {
                    ETag: result.etag,
                });
            }

            if (result.headers) {
                Object.assign(set.headers, result.headers);
            }

            return apiResponse.success(result.data ?? null, result.message);
        } catch (error) {
            return errorHandler(error, set);
        }
    };
};
