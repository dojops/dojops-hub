const isDev = process.env.NODE_ENV !== "production";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      // Google avatars for users signing in via Google OAuth
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // HSTS: enforce HTTPS for 1 year and include subdomains.
          // Only set in production; dev uses HTTP, so the header is omitted there.
          ...(isDev
            ? []
            : [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }]),
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: isDev
              ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' https://avatars.githubusercontent.com https://lh3.googleusercontent.com data:; font-src 'self'; connect-src 'self' ws://localhost:*; frame-ancestors 'none'"
              : "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' https://avatars.githubusercontent.com https://lh3.googleusercontent.com data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'",
          },
        ],
      },
      {
        source: "/api/newsletter/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.CORS_ORIGIN || "https://dojops.ai",
          },
          { key: "Access-Control-Allow-Methods", value: "POST, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type" },
        ],
      },
    ];
  },
};

export default nextConfig;
