/**
 * Backend — Configuration loaders (scaffold).
 * Future: env, database, security, app config.
 * Currently the Next.js app reads env directly; this module is prepared
 * for backend extraction.
 */
export const backendConfig = {
  env: process.env.NODE_ENV ?? "development",
  port: Number(process.env.APP_PORT ?? 3000),
  apiVersion: process.env.API_VERSION ?? "v1",
  jwtSecret: process.env.JWT_SECRET,
  databaseUrl: process.env.DATABASE_URL,
} as const;
