/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Required for pdfjs-dist worker
    config.resolve.alias.canvas = false;
    return config;
  },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'ui-avatars.com' }],
  },
};

module.exports = nextConfig;
