import type { NextConfig } from "next";
import type { WebpackConfigContext } from "next/dist/server/config-shared";
import withNextIntl from "next-intl/plugin";
import { mergeAllLocales } from "./scripts/merge-locales";
import { permissionCollector } from "./scripts/merge-permissions";

let hasRunBuildTimeSetup = false;

/**
 * Development environment setup
 * Monitor changes in localization files and permission configurations
 */
const setupDevelopment = () => {
  hasRunBuildTimeSetup = true;
  // Initialize and monitor localization file changes
  mergeAllLocales().catch(console.error);

  // Initialize and monitor permission configuration changes
  permissionCollector.generateMergedConfig().catch((error) => {
    console.error("❌ Failed to start permission config monitoring:", error);
  });
};

// If it's a development environment, execute the development environment setup immediately
// Production environment setup has been moved to the webpack entry function
if (process.env.NODE_ENV === "development") {
  setupDevelopment();
}

const nextConfig: NextConfig = {
  // Image domain configuration
  images: {
    domains: ["kpkfvxxvdgwdbvpthqqr.supabase.co", "localhost", "127.0.0.1", "d2p7pge43lyniu.cloudfront.net"],
  },
  // Experimental features
  experimental: {
    ppr: false,
    clientSegmentCache: true,
    // forceSwcTransforms: true,
  },
  onDemandEntries: {
    // Page cache duration in memory (milliseconds)
    maxInactiveAge: 60 * 1000,
    // Number of pages to preload simultaneously
    pagesBufferLength: 5,
  },
  // Moved to top-level configuration (fix warning)
  serverExternalPackages: ["sharp"],
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },
  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Vercel deployment optimization
  output: "standalone",
  poweredByHeader: false,
  compress: true,
  // Webpack configuration
  webpack: (config: any, { dev, isServer }: WebpackConfigContext) => {
    // Save the original entry function
    const originalEntry = config.entry;
    // Rewrite the entry function to perform initialization tasks
    config.entry = async () => {
      const entries = await originalEntry();
      if ((dev && isServer && !hasRunBuildTimeSetup) || (!dev && !hasRunBuildTimeSetup)) {
        try {
          await mergeAllLocales();
          await permissionCollector.generateMergedConfig();
          hasRunBuildTimeSetup = true;
        } catch (error) {
          console.error("Build-time setup failed:", error);
        }
      }
      return entries;
    };

    return config;
  },
};

export default withNextIntl("./i18n.config.ts")(nextConfig);
