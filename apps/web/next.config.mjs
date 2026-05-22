/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: "http://localhost:8000/api/auth/:path*",
      },
      {
        source: "/api/scrape/:path*",
        destination: "http://localhost:8000/api/scrape/:path*",
      },
    ]
  },
}

export default nextConfig
