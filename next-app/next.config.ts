import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  serverExternalPackages: ["@sentry/nextjs"],
}

import { withSentryConfig } from "@sentry/nextjs"
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG || "placementos",
  project: process.env.SENTRY_PROJECT || "placementos",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  sourcemaps: { disable: false },
  disableLogger: true,
  automaticVercelMonitors: true,
})
