const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
    resolver: {
        // Allow Metro to bundle .tflite model files via require()
        assetExts: [...defaultConfig.resolver.assetExts, 'tflite'],
    },
};

module.exports = mergeConfig(defaultConfig, config);
