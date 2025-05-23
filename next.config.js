/** @type {import('next').NextConfig} */
const nextConfig = {
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
