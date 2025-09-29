/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/second-hand-marketplace",
  experimental: {
    instrumentationHook: true,
  },
  async rewrites() {
    return [
      {
        source: '/second-hand-marketplace/favicon.ico',
        destination: '/favicon.ico',
      },
    ];
  }
};

export default nextConfig;
