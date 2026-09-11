export default class APIError extends Error {
    public statusCode: number;
    public details?: unknown;

    constructor(message: string, statusCode: number = 500, details?: unknown) {
        super(message);
        this.name = "APIError";
        this.statusCode = statusCode;
        this.details = details;

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, APIError);
        }
    }

    static badRequest(message: string = "Bad request", details?: unknown): APIError {
        return new APIError(message, 400, details);
    }

    static unauthorized(message: string = "Unauthorized"): APIError {
        return new APIError(message, 401);
    }

    static forbidden(message: string = "Forbidden"): APIError {
        return new APIError(message, 403);
    }

    static notFound(message: string = "Not found"): APIError {
        return new APIError(message, 404);
    }

    static conflict(message: string, details?: unknown): APIError {
        return new APIError(message, 409, details);
    }

    static validation(message: string, details?: unknown): APIError {
        return new APIError(message, 422, details);
    }

    static internal(message: string = "Internal server error"): APIError {
        return new APIError(message, 500);
    }
}
