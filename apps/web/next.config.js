/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@oshieru/types'],
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://oshieru-api.harukana1435.workers.dev',
  },
};

module.exports = nextConfig; 