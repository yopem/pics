import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

import "dotenv/config"

function getProtocol() {
  if (process.env["APP_ENV"] === "development") {
    return "http://"
  }
  return "https://"
}

export const env = createEnv({
  server: {
    APP_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    DATABASE_URL: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_API: z.string().min(1),
    NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().min(1),
    NEXT_PUBLIC_GTM_ID: z.string().min(1),
    NEXT_PUBLIC_LOGO_OG_HEIGHT: z.string().min(1),
    NEXT_PUBLIC_LOGO_OG_URL: z.string().min(1),
    NEXT_PUBLIC_LOGO_OG_WIDTH: z.string().min(1),
    NEXT_PUBLIC_LOGO_URL: z.string().min(1),
    NEXT_PUBLIC_SITE_DESCRIPTION: z.string().min(1),
    NEXT_PUBLIC_SITE_DOMAIN: z.string().min(1),
    NEXT_PUBLIC_SITE_TAGLINE: z.string().min(1),
    NEXT_PUBLIC_SITE_TITLE: z.string().min(1),
    NEXT_PUBLIC_SITE_URL: z.string().min(1),
    NEXT_PUBLIC_X_USERNAME: z.string().min(1),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_API: `${getProtocol()}${process.env["NEXT_PUBLIC_SITE_DOMAIN"]}/api`,
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env["NEXT_PUBLIC_GA_MEASUREMENT_ID"],
    NEXT_PUBLIC_GTM_ID: process.env["NEXT_PUBLIC_GTM_ID"],
    NEXT_PUBLIC_LOGO_OG_HEIGHT: process.env["NEXT_PUBLIC_LOGO_OG_HEIGHT"],
    NEXT_PUBLIC_LOGO_OG_URL: process.env["NEXT_PUBLIC_LOGO_OG_URL"],
    NEXT_PUBLIC_LOGO_OG_WIDTH: process.env["NEXT_PUBLIC_LOGO_OG_WIDTH"],
    NEXT_PUBLIC_LOGO_URL: process.env["NEXT_PUBLIC_LOGO_URL"],
    NEXT_PUBLIC_SITE_DESCRIPTION: process.env["NEXT_PUBLIC_SITE_DESCRIPTION"],
    NEXT_PUBLIC_SITE_DOMAIN: process.env["NEXT_PUBLIC_SITE_DOMAIN"],
    NEXT_PUBLIC_SITE_TAGLINE: process.env["NEXT_PUBLIC_SITE_TAGLINE"],
    NEXT_PUBLIC_SITE_TITLE: process.env["NEXT_PUBLIC_SITE_TITLE"],
    NEXT_PUBLIC_SITE_URL: `${getProtocol()}${process.env["NEXT_PUBLIC_SITE_DOMAIN"]}`,
    NEXT_PUBLIC_X_USERNAME: process.env["NEXT_PUBLIC_X_USERNAME"],
  },
})
