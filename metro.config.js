const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Metro can hang during web export on machines without a healthy Watchman
// install. Force the Node crawler so `npm run web:8083` is deterministic.
config.resolver.useWatchman = false;

module.exports = config;
