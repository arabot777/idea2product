import type { NextConfig } from 'next';
import type { WebpackConfigContext } from 'next/dist/server/config-shared';
import withNextIntl from "next-intl/plugin";
import { mergeAllLocales, watchLocales } from "./scripts/merge-locales";
import { permissionCollector } from "./scripts/merge-permissions";

// Build-time setup for production
const setupBuildTime = async () => {
  if (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV) {
    try {
      await mergeAllLocales();
      await permissionCollector.generateMergedConfig();
    } catch (error) {
      console.error("Build-time setup failed:", error);
      // Don't exit process in production build
    }
  }
};

// Setup for development
const setupDevelopment = () => {
  if (process.env.NODE_ENV === "development") {
    // Watch for file changes in development mode
    mergeAllLocales()
      .then(() => watchLocales())
      .catch(console.error);

    permissionCollector
      .watchPermissionFiles()
      .then(() => {
        return permissionCollector.generateMergedConfig();
      })
      .catch((error) => {
        console.error("❌ Failed to start permission config monitoring:", error);
      });
  }
};

// Execute setup
if (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV) {
  await setupBuildTime();
} else {
  setupDevelopment();
}

const nextConfig: NextConfig = {
  images: {
    domains: ['d2p7pge43lyniu.cloudfront.net'],
  },
  experimental: {
    // Remove deprecated/problematic experimental features for Vercel
    ppr: true,
    serverComponentsExternalPackages: ['sharp'],
  },
  // Remove deprecated options
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Add output configuration for Vercel
  output: 'standalone',
  // Optimize for serverless
  poweredByHeader: false,
  compress: true,
  // Webpack configuration
  webpack: (config: any, { isServer, dev }: WebpackConfigContext) => {
    // Only modify entry in development
    if (dev) {
      const originalEntry = config.entry;
      config.entry = async () => {
        const entries = await originalEntry();
        try {
          await mergeAllLocales();
          await permissionCollector.generateMergedConfig();
        } catch (error) {
          console.error("Entry setup failed:", error);
        }
        return entries;
      };
    }

    return config;
  },
};

export default withNextIntl('./i18n.config.ts')(nextConfig);