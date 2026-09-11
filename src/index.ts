import { Elysia } from "elysia";
import { env } from "@/lib/env";
import { auth } from "@/lib/auth";

const app = new Elysia()
    .get("/health", () => ({ status: "ok" }))
    .all("/api/auth/*", ({ request }) => auth.handler(request))

    .listen({ port: env.PORT, reusePort: true });

console.log(`🦊 Elysia backend is running at ${app.server?.hostname}:${app.server?.port}`);
