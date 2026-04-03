/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost'],
  },

  // Server-side environment variables are available by default in API routes
  // and server components. Only NEXT_PUBLIC_ prefixed vars are exposed to the
  // client bundle. Notion keys (NOTION_API_KEY, NOTION_*_DB, etc.) are
  // server-only — they are NOT prefixed and will never leak to the browser.

  // Allow server-side fetches to the Notion API
  async rewrites() {
    return [];
  },
}

module.exports = nextConfig