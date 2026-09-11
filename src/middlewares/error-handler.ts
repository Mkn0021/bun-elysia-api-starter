import APIError from "@/lib/api/error";
import type { ErrorResponse } from "@/types";
import { ZodError, prettifyError } from "zod";

export const errorHandler = (err: unknown, set: { status?: number | string }): ErrorResponse => {
    const logMessage =
        err instanceof ZodError
            ? prettifyError(err)
            : err instanceof Error
              ? err.message
              : "Unknown error";
    console.error("API Error:", logMessage);

    if (err instanceof APIError) {
        const { statusCode, message, details } = err;
        set.status = statusCode;
        const response: ErrorResponse = { success: false, error: message };
        if (details) {
            response.details = details;
        }
        return response;
    }

    if (err instanceof ZodError) {
        set.status = 400;
        return {
            success: false,
            error: prettifyError(err),
            details: err.issues,
        };
    }

    if (err instanceof SyntaxError && "body" in err) {
        set.status = 400;
        return { success: false, error: "Malformed JSON in request body" };
    }

    set.status = 500;
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
};
