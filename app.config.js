// app.config.js
import 'dotenv/config'; // Import dotenv to load the .env file

export default {
  expo: {
    name: 'BaseExpoApp',
    slug: 'BaseExpoApp',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'baseexpoapp',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    splash: {
      image: './assets/images/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    extra: {
      // Load environment variables using dotenv
      apiKey: process.env.API_KEY || 'default_api_key', // Default value in case .env is not set
    },
    plugins: ['expo-router'],
    experiments: {
      typedRoutes: true,
    },
  },
};
