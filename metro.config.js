const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Limit workers on Windows to prevent EMFILE: too many open files
config.maxWorkers = 2;

const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (moduleName === '@hugeicons/core-free-icons') {
        return {
            filePath: path.resolve(__dirname, 'node_modules/@hugeicons/core-free-icons/dist/cjs/index.js'),
            type: 'sourceFile',
        };
    }
    if (originalResolveRequest) {
        return originalResolveRequest(context, moduleName, platform);
    }
    return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;

