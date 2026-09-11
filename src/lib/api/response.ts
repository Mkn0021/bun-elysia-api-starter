import type { SuccessResponse } from "@/types";

export const apiResponse = {
    success: <T>(data: T, message?: string): SuccessResponse<T> => ({
        success: true,
        data,
        message,
    }),
};
