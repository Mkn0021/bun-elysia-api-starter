import type { InferValidatedData, ValidationSchema } from "@/types";

export const validateRequest = async <T extends ValidationSchema | undefined>(
    context: {
        request: Request;
        query?: Record<string, unknown>;
        params?: Record<string, unknown>;
        body?: unknown;
    },
    schema?: T,
): Promise<InferValidatedData<T>> => {
    if (!schema) {
        return {} as InferValidatedData<T>;
    }

    const result: any = {
        query: undefined,
        params: undefined,
        body: undefined,
    };

    if (schema.query) {
        result.query = await schema.query.parseAsync(context.query ?? {});
    }

    if (schema.params && context.params) {
        result.params = await schema.params.parseAsync(context.params);
    }

    if (schema.body && context.request.method !== "GET" && context.request.method !== "HEAD") {
        result.body = await schema.body.parseAsync(context.body ?? {});
    }

    return result as InferValidatedData<T>;
};
