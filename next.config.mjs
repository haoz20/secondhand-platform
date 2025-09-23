/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/app/second-hand-marketplace",
  experimental: {
    instrumentationHook: true,
  },
  async rewrites() {
    return [
      {
        source: '/app/second-hand-marketplace/favicon.ico',
        destination: '/favicon.ico',
      },
    ];
  }
};

export default nextConfig;
