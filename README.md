# Bun Elysia Starter

A TypeScript backend starter built with [Bun](https://bun.com), [Elysia](https://elysiajs.com/), [Better Auth](https://www.better-auth.com/), [Drizzle ORM](https://orm.drizzle.team/), PostgreSQL, and Redis.

The application currently exposes Better Auth at `/api/auth/*`. The reusable API helpers support authenticated handlers, Zod request validation, consistent success and error responses, ETag-based caching, and Redis-backed cache invalidation.

## Requirements

- Bun 1.3 or newer
- Docker and Docker Compose
- A PostgreSQL connection
- A Redis connection

## Getting Started

Install dependencies and create the local environment file:

```bash
bun install
cp .env.example .env
```

Start PostgreSQL and Redis:

```bash
docker compose up -d
```

The default Compose configuration publishes PostgreSQL on `127.0.0.1:5432` and Redis on `127.0.0.1:6379`. Update `.env` if you use different services or credentials. `BETTER_AUTH_SECRET` should be replaced with a long, random value.

Start the development server:

```bash
bun run dev
```

The API listens on `http://localhost:3001` by default. Check that the server is running with:

```bash
curl http://localhost:3001/health
```

The health endpoint returns `{ "status": "ok" }`. Better Auth is available at `http://localhost:3001/api/auth/*`.

## Health Check

`GET /health` is a dependency-free liveness check for the API process. A healthy response has HTTP status `200` and the following JSON body:

```json
{ "status": "ok" }
```

## Environment Variables

| Variable               | Required | Description                                                |
| ---------------------- | -------- | ---------------------------------------------------------- |
| `PORT`                 | No       | API port. Defaults to `3001`.                              |
| `POSTGRES_URL`         | Yes      | PostgreSQL connection URL used by Drizzle and Better Auth. |
| `BETTER_AUTH_URL`      | Yes      | Public base URL for Better Auth.                           |
| `BETTER_AUTH_SECRET`   | Yes      | Secret used to sign and protect auth data.                 |
| `GOOGLE_CLIENT_ID`     | No       | Google OAuth client ID.                                    |
| `GOOGLE_CLIENT_SECRET` | No       | Google OAuth client secret.                                |
| `REDIS_URL`            | Yes      | Redis connection URL used by caching helpers.              |
| `FRONTEND_URL`         | No       | Reserved frontend origin for future CORS configuration.    |

`GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are optional in the environment schema, but Google sign-in is configured in `src/lib/auth.ts`; provide both values when enabling that provider.

## Available Commands

| Command               | Purpose                                        |
| --------------------- | ---------------------------------------------- |
| `bun run dev`         | Run the API with file watching.                |
| `bun run start`       | Run the API without file watching.             |
| `bun run build`       | Build the server into `dist/`.                 |
| `bun run format`      | Format project source and configuration files. |
| `bun run db:generate` | Generate Drizzle migrations.                   |
| `bun run db:migrate`  | Apply Drizzle migrations.                      |
| `bun run db:push`     | Push the schema directly to the database.      |
| `bun run db:studio`   | Open Drizzle Studio.                           |

## Project Layout

```text
src/
	index.ts                 Elysia application entrypoint
	lib/auth.ts              Better Auth configuration
	lib/env.ts               Validated environment configuration
	lib/api/                 API errors, responses, and handler wrapper
	lib/db/                  Drizzle client and Better Auth schema
	middlewares/             Error, cache, and request-validation helpers
	types/                   Shared API and handler types
docker-compose.yml         Local PostgreSQL and Redis services
.env.example               Environment variable template
```

## Adding Routes

Define routes in `src/index.ts` or split them into a route module. For handlers that need the shared behavior, wrap the route logic with `asyncHandler` from `src/lib/api/handler.ts` and provide a Zod schema when request validation is needed.

## Database

Better Auth uses the Drizzle PostgreSQL adapter and the schema in `src/lib/db/schemas/auth.ts`. After changing the schema, generate and apply a migration, or use `bun run db:push` during local development.
