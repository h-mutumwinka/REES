/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Ensure native modules are properly handled
  experimental: {
    serverComponentsExternalPackages: ["better-sqlite3"],
  },
}

export default nextConfig
