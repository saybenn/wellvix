// /lib/env-server.js
// SERVER-ONLY: safe to import in API routes, getServerSideProps, or server utilities.
// Throws if required secrets are missing.
import { z } from "zod";

const isServer = typeof window === "undefined";

const ServerEnvSchema = z.object({
  NODE_ENV: z.string().default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url(), // public but needed on server too
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith("pk_"),

  // Prefer RK; fallback to SK for local/dev
  STRIPE_RESTRICTED_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),

  STRIPE_WEBHOOK_SECRET: z.string(),
  WELLVIX_PLATFORM_FEE_PERCENT: z.string().default("10"),
  NEXT_PUBLIC_ENV: z.enum(["development", "staging", "production"]).optional(),
});

const values = {
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  STRIPE_RESTRICTED_KEY: process.env.STRIPE_RESTRICTED_KEY,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  WELLVIX_PLATFORM_FEE_PERCENT: process.env.WELLVIX_PLATFORM_FEE_PERCENT,
  NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV,
};

if (!isServer) {
  // Guard: never allow this file to be imported on the client accidentally
  throw new Error(
    "env-server imported on the client. Import env-public instead."
  );
}

const envServer = ServerEnvSchema.parse(values);
export default envServer;
