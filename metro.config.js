const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Limit workers on Windows to prevent EMFILE: too many open files
config.maxWorkers = 2;

module.exports = withNativeWind(config, { input: './src/global.css' });

