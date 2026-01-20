const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development', // 개발 중 PWA 비활성화 (경고 제거)
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [],
  },
  experimental: {
    serverComponentsExternalPackages: ['@google-cloud/vision'],
  },
}

module.exports = withPWA(nextConfig);
