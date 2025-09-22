/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/app/second-hand-marketplace",
  experimental: {
    instrumentationHook: true,
  },
};

export default nextConfig;
