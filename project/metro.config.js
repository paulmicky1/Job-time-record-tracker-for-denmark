const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for web
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];
config.resolver.assetExts = [...config.resolver.assetExts, 'db'];

// Configure server middleware for proper MIME types
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Set proper MIME types for different file types
      if (req.url.includes('.bundle')) {
        res.setHeader('Content-Type', 'application/javascript');
      }
      return middleware(req, res, next);
    };
  },
};

// Configure transformer
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
  assetPlugins: ['expo-asset/tools/hashAssetFiles'],
};

module.exports = config; 