/** @type {import('next').NextConfig} */
const nextConfig = {
  // TypeORM loads database drivers (e.g. `pg`) dynamically at runtime, which breaks when bundled
  serverExternalPackages: ['typeorm'],
  experimental: {
    // TypeORM identifies entities by their class names, which server minification mangles
    serverMinification: false,
  },
  compiler: {
    // Remove console calls (except inside node_modules)
    removeConsole: process.env.NODE_ENV === 'production' ? {
      // keep console.error and console.warn, remove others in production
      exclude: ['error', 'warn']
    } : false,
  },
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.(mp3|wav|m4a)$/,
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/audio/',
          outputPath: 'static/audio/',
          name: '[name].[ext]',
        },
      },
    });
    // Exclude react-native-sqlite-storage from the client-side bundle for TypeORM
    config.externals = config.externals || {};
    config.externals['react-native-sqlite-storage'] = 'commonjs react-native-sqlite-storage';
    return config;
  },
  // webpack(config) {
  //   config.infrastructureLogging = { debug: /PackFileCache/ }
  //   return config;
  // }
  // i18n,
  // experimental: {
  //   serverComponentsExternalPackages: ['typeorm'],
  // },
};

module.exports = nextConfig;
