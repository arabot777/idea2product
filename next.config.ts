import type { NextConfig } from 'next';
import type { WebpackConfigContext } from 'next/dist/server/config-shared';
import withNextIntl from "next-intl/plugin";
import { mergeAllLocales, watchLocales } from "./scripts/merge-locales";
import { permissionCollector } from "./scripts/merge-permissions";
import { resolve } from 'path';
import { fa } from '@faker-js/faker';

// Use an immediately invoked async function to handle top-level await
(async () => {
  // Merge language files
  if (process.env.NODE_ENV === "development") {
    // Watch for file changes in development mode
    mergeAllLocales()
      .then(() => watchLocales())
      .catch(console.error);

    permissionCollector
      .watchPermissionFiles()
      .then(() => {
        // Generate config once first
        return permissionCollector.generateMergedConfig();
      })
      .catch((error) => {
        console.error("❌ Failed to start permission config monitoring:", error);
        process.exit(1);
      });
  } else {
    // Only merge once in production mode
    await mergeAllLocales();
    await permissionCollector.generateMergedConfig();
  }
})();

const nextConfig = {
  images: {
    domains: [
      'd2p7pge43lyniu.cloudfront.net',
      'd2g64w682n9w0w.cloudfront.net'
    ],
  },
  experimental: {
    ppr: false,
    clientSegmentCache: true,
    nodeMiddleware: true,
    // forceSwcTransforms: true,
  },
  // Development environment optimization
  onDemandEntries: {
    // Page cache duration in memory (milliseconds)
    maxInactiveAge: 60 * 1000,
    // Number of pages to preload simultaneously
    pagesBufferLength: 5,
  },
  // Disable type checking in development environment (can significantly improve compilation speed)
  typescript: {
    ignoreBuildErrors: false,
  },
  // Disable ESLint checking in development environment
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Optimize Webpack configuration
  webpack: (config: any, { isServer, dev }: WebpackConfigContext) => {
    if (isServer) {
      const cryptoExternal = { 'node:crypto': 'commonjs crypto' };

      if (Array.isArray(config.externals)) {
        config.externals.push(cryptoExternal);
      } else if (typeof config.externals === 'object' && config.externals !== null) {
        Object.assign(config.externals, cryptoExternal);
      } else if (!config.externals) { 
        config.externals = [cryptoExternal];
      } else { 
        config.externals = [config.externals, cryptoExternal];
      }
    } else {
      // Client Polyfills
      config.resolve.alias = {
        ...config.resolve.alias,
        // 'node:crypto': require.resolve('crypto-browserify') // temporarily commented out
      };
      
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer/'),
      };
    }

    // Ensure language files and permission configs are merged before building
    if (!dev) {
      const originalEntry = config.entry;
      config.entry = async () => {
        const entries = await originalEntry();
        await mergeAllLocales().catch(console.error);
        await permissionCollector.generateMergedConfig().catch(console.error);
        return entries;
      };
    }
    return config;
  },
};

export default withNextIntl('./i18n.config.ts')(nextConfig);
