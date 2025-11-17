/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Environment variables to expose to the browser
  env: {
    NEXT_PUBLIC_APP_NAME: 'Training Builder',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },

  // Turbopack configuration (empty to silence warning)
  turbopack: {},

  // Webpack configuration for Monaco Editor
  webpack: (config, { isServer }) => {
    // Monaco Editor requires global window object
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
