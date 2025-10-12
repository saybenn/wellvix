// /lib/env-public.js
// Safe to import in CLIENT and SERVER. Only exposes NEXT_PUBLIC_* vars.
import { z } from "zod";

const PublicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith("pk_").optional(),
  NEXT_PUBLIC_ENV: z.enum(["development", "staging", "production"]).optional(),
});

const parsed = PublicEnvSchema.safeParse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV,
});

if (!parsed.success) {
  // Don't throw on client; just log a warning in dev to avoid breaking pages
  if (process.env.NODE_ENV !== "production") {
    console.warn("env-public validation warnings:", parsed.error.issues);
  }
}

const envPublic = parsed.success
  ? parsed.data
  : {
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV || "development",
    };

export default envPublic;
