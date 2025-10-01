/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/second-hand-marketplace",
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
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
