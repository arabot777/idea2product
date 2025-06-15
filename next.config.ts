import type { NextConfig } from "next";
import type { WebpackConfigContext } from "next/dist/server/config-shared";
import withNextIntl from "next-intl/plugin";
import { mergeAllLocales } from "./scripts/merge-locales";
import { permissionCollector } from "./scripts/merge-permissions";

/**
 * 开发环境设置
 * 监听本地化文件和权限配置的变化
 */
const setupDevelopment = () => {
  console.log("Development environment setup started");
  // 初始化并监听本地化文件变化
  mergeAllLocales().catch(console.error);

  // 初始化并监听权限配置变化
  permissionCollector.generateMergedConfig().catch((error) => {
    console.error("❌ Failed to start permission config monitoring:", error);
  });
};

// 如果是开发环境，立即执行开发环境设置
// 生产环境设置已移至webpack entry函数中
if (process.env.NODE_ENV === "development") {
  setupDevelopment();
}
let hasRunBuildTimeSetup = false;

const nextConfig: NextConfig = {
  // 图片域名配置
  images: {
    domains: ["d2p7pge43lyniu.cloudfront.net"],
  },
  // 实验性功能
  experimental: {
    ppr: true,
    // clientSegmentCache: true,
    forceSwcTransforms: true,
  },
  onDemandEntries: {
    // Page cache duration in memory (milliseconds)
    maxInactiveAge: 60 * 1000,
    // Number of pages to preload simultaneously
    pagesBufferLength: 5,
  },
  // 移至顶层配置（修复警告）
  serverExternalPackages: ["sharp"],
  // TypeScript配置
  typescript: {
    ignoreBuildErrors: false,
  },
  // ESLint配置
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Vercel部署优化
  output: "standalone",
  poweredByHeader: false,
  compress: true,
  // Webpack配置
  webpack: (config: any, { dev, isServer }: WebpackConfigContext) => {
    // 保存原始entry函数
    const originalEntry = config.entry;
    // 重写entry函数以执行初始化任务
    config.entry = async () => {
      const entries = await originalEntry();
      if ((dev && isServer && !hasRunBuildTimeSetup) || (!dev && !hasRunBuildTimeSetup)) {
        try {
          console.log("Running build-time setup...");
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
