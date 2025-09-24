/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable server-side rendering for Electron
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  
  // Optimize for Electron environment
  distDir: 'out',
  
  // Disable image optimization for Electron
  images: {
    unoptimized: true
  },
  
  // Configure for Electron's file:// protocol
  assetPrefix: process.env.NODE_ENV === 'production' ? './' : '',
  
  // Webpack configuration for Electron
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Ensure proper module resolution for Electron
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        path: false,
        os: false,
        stream: false,
        util: false,
        buffer: false,
        assert: false,
        http: false,
        https: false,
        zlib: false,
        url: false,
        querystring: false,
        child_process: false,
      };
    }
    
    return config;
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Headers for security (disabled for export mode)
  // async headers() {
  //   return [
  //     {
  //       source: '/(.*)',
  //       headers: [
  //         {
  //           key: 'X-Frame-Options',
  //           value: 'SAMEORIGIN',
  //         },
  //         {
  //           key: 'X-Content-Type-Options',
  //           value: 'nosniff',
  //         },
  //         {
  //           key: 'Referrer-Policy',
  //           value: 'strict-origin-when-cross-origin',
  //         },
  //       ],
  //     },
  //   ];
  // },
};

module.exports = nextConfig;
