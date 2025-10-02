/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/second-hand-marketplace",
  experimental: {
    instrumentationHook: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
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
