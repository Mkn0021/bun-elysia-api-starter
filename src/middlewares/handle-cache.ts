import Redis from "ioredis";
import { env } from "@/lib/env";
import type { CacheConfig, HandlerResult } from "@/types";

const ETAG_TTL = 60 * 60 * 24; // 24 hours
const DATA_TTL = 60 * 5; // 5 minutes

export const redis = new Redis(env.REDIS_URL);

export interface CacheContext {
    params?: Record<string, string>;
    query?: Record<string, unknown>;
    session?: {
        user: {
            id: string;
            organizationId?: string;
            role?: string;
        };
    } | null;
}

export interface CacheHit {
    status: 304;
    headers: Record<string, string>;
}

const getCacheKey = (cache: CacheConfig, ctx: CacheContext): string | null => {
    const cacheId = cache.getId(ctx);

    return cacheId ? `${cache.table}:${cacheId}` : null;
};

export const checkCache = async (
    request: Request,
    cache: CacheConfig,
    ctx: CacheContext,
): Promise<CacheHit | null> => {
    if (request.method !== "GET") return null;

    const cacheKey = getCacheKey(cache, ctx);
    if (!cacheKey) return null;

    const requestEtag = request.headers.get("If-None-Match");

    try {
        const storedEtag = await redis.get(`etag:${cacheKey}`);

        if (!storedEtag) {
            return null;
        }

        if (requestEtag !== String(storedEtag)) {
            return null;
        }

        return {
            status: 304,
            headers: {
                ETag: String(storedEtag),
                "Content-Length": "0",
            },
        };
    } catch (error) {
        console.error("Cache check failed:", error);
        return null;
    }
};

export const getCachedData = async <T>(
    cache: CacheConfig,
    ctx: CacheContext,
): Promise<HandlerResult<T> | null> => {
    const cacheKey = getCacheKey(cache, ctx);
    if (!cacheKey) return null;

    try {
        const cachedData = await redis.get(`data:${cacheKey}`);

        if (!cachedData) {
            return null;
        }

        return JSON.parse(cachedData) as HandlerResult<T>;
    } catch (error) {
        console.error("Cache read failed:", error);
        return null;
    }
};

export const persistCache = async <T>(
    result: HandlerResult<T>,
    cache: CacheConfig,
    ctx: CacheContext,
): Promise<void> => {
    if (!result.etag) return;

    const cacheKey = getCacheKey(cache, ctx);
    if (!cacheKey) return;

    try {
        await Promise.all([
            redis.set(`data:${cacheKey}`, JSON.stringify(result), "EX", DATA_TTL),
            redis.set(`etag:${cacheKey}`, result.etag, "EX", ETAG_TTL),
        ]);
    } catch (error) {
        console.error("Cache persist failed:", error);
    }
};

export const invalidateCache = async (table: string, ids: string[]): Promise<void> => {
    if (ids.length === 0) return;

    try {
        const patterns = ids.map((id) => `data:${table}:${id}`);

        const keys: string[] = [];

        for (const pattern of patterns) {
            if (pattern.endsWith("*")) {
                const stream = redis.scanStream({
                    match: pattern,
                    count: 100,
                });

                for await (const result of stream) {
                    keys.push(...(result as string[]));
                }
            } else {
                keys.push(pattern);
            }
        }

        const etagKeys = keys.map((key) => key.replace("data:", "etag:"));

        const allKeys = [...keys, ...etagKeys];

        if (allKeys.length > 0) {
            await redis.del(...allKeys);
        }
    } catch (error) {
        console.error("Cache invalidation failed:", error);
    }
};
