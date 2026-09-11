import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const EnvSchema = z.object({
    PORT: z.coerce.number().default(3001),

    POSTGRES_URL: z.url().nonempty("POSTGRES_URL is required"),
    BETTER_AUTH_URL: z.url().min(1, "BETTER_AUTH_URL must be provided for Authentication"),
    BETTER_AUTH_SECRET: z.string().min(1, "BETTER_AUTH_SECRET must be provided for Authentication"),

    // Google OAuth
    GOOGLE_CLIENT_ID: z.string().min(1, "Google Client ID is required").optional(),
    GOOGLE_CLIENT_SECRET: z.string().min(1, "Google Client Secret is required").optional(),

    // Redis
    REDIS_URL: z.string().min(1, "REDIS_URL is required"),

    // Frontend origin, used for CORS once more modules are migrated
    FRONTEND_URL: z.string().optional(),
});

export const env: z.infer<typeof EnvSchema> = (() => {
    const result = EnvSchema.safeParse(process.env);
    if (!result.success) {
        throw new Error(
            `Invalid environment variables:\n${result.error.issues
                .map((i) => `${i.path}: ${i.message}`)
                .join("\n")}`,
        );
    }
    return result.data;
})();
