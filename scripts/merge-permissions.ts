import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { readdir } from "fs/promises";
import { dirname, join, relative } from "path";
import { z } from "zod";
import type { PermissionFileConfig, PermissionsFileMap, PermissionDetail, MergedPermissionFileConfig } from "../lib/types/permission/permission-config.bean";
import { permissionConfigSchema, PermissionError } from "../lib/types/permission/permission-config.bean";

// Ignored file patterns
export const IGNORE_PATTERNS = ["**/node_modules/**", "**/dist/**", "**/build/**", "**/.git/**", "**/.next/**", "**/coverage/**", "**/tmp/**", "**/.cache/**"];

export class PermissionCollector {
  private rootDir: string;
  private outputPath: string;

  constructor(rootDir: string = process.cwd(), outputPath: string = "config/permission.merge.json") {
    this.rootDir = rootDir;
    this.outputPath = outputPath;
  }

  /**
   * Parses a single permission configuration file
   * @throws {PermissionError} when file format or content is invalid
   */
  private parsePermissionFile(filePath: string): PermissionFileConfig {
    try {
      const content = readFileSync(filePath, "utf-8");
      let config: unknown;

      try {
        config = JSON.parse(content);
      } catch (e) {
        throw new PermissionError(`Permission configuration file JSON format error: ${filePath}`, { error: e, content });
      }

      try {
        const validated = permissionConfigSchema.parse(config);
        return validated;
      } catch (e) {
        const zodError = e as z.ZodError;
        throw new PermissionError(`Permission configuration file validation failed: ${filePath}`, {
          error: zodError,
          config,
          validationErrors: zodError.errors,
        });
      }
    } catch (error) {
      if (error instanceof PermissionError) {
        throw error;
      }
      throw new PermissionError(`Failed to read permission configuration file: ${filePath}`, { error });
    }
  }

  /**
   * Collects all permission configuration files
   */
  /**
   * Recursively searches for permission configuration files
   */
  private async searchFiles(dir: string): Promise<string[]> {
    const files: string[] = [];

    try {
      const entries = await readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        const relativePath = relative(this.rootDir, fullPath);

        // Checks if the file is in the ignore list
        if (
          IGNORE_PATTERNS.some((pattern) => {
            const regex = new RegExp(pattern.replace(/\*\*/g, ".*"));
            return regex.test(relativePath);
          })
        ) {
          continue;
        }

        if (entry.isDirectory()) {
          const subFiles = await this.searchFiles(fullPath);
          files.push(...subFiles);
        } else if (entry.name.endsWith(".permission.json")) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.warn(`⚠️ Cannot access directory ${dir}:`, error);
    }

    return files;
  }

  /**
   * Collects all permission configuration files
   */
  async collectPermissionFiles(): Promise<string[]> {
    try {
      const files = await this.searchFiles(this.rootDir);
      return files;
    } catch (error) {
      throw new PermissionError("Failed to search for permission configuration files", { error });
    }
  }

  /**
   * Merges all permission configurations
   */
  private mergePermissionConfigs(files: string[]): MergedPermissionFileConfig {
    const merged: MergedPermissionFileConfig = {
      permissions: {
        page: {},
        api: {},
        component: {},
        action: {},
      },
      generatedAt: new Date().toISOString(),
      sourceFiles: files,
      totalConfigs: 0,
    };

    const configMap = new Map<
      string,
      {
        file: string;
        type: keyof PermissionsFileMap;
        key: string;
      }
    >();

    for (const file of files) {
      const config = this.parsePermissionFile(file);
      if (!config) continue;

      // Checks and merges permissions of each type
      (Object.keys(config.permissions) as Array<keyof PermissionsFileMap>).forEach((type) => {
        const permissions = config.permissions[type];
        if (!permissions) return;

        Object.entries(permissions).forEach(([key, value]) => {
          // Checks for permission key conflicts
          const existingConfig = configMap.get(key);
          if (existingConfig) {
            throw new PermissionError(`Permission key conflict: "${key}"`, {
              currentFile: file,
              existingFile: existingConfig.file,
              key,
              type,
            });
          }

          // Records the source of the permission key
          configMap.set(key, { file, type, key });
          // Merges permission configurations
          merged.permissions[type]![key] = value as PermissionDetail;
          merged.totalConfigs++;
        });
      });
    }

    return merged;
  }

  /**
   * Generates the merged permission configuration file
   */
  async generateMergedConfig(): Promise<void> {
    try {
      const files = await this.collectPermissionFiles();

      if (files.length === 0) {
        return;
      }
      const mergedConfig = this.mergePermissionConfigs(files);

      // Ensures the output directory exists
      const outputDir = dirname(this.outputPath);
      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
      }

      // Writes the merged configuration
      writeFileSync(this.outputPath, JSON.stringify(mergedConfig, null, 2));

      console.log(`✅ Permission configuration merged to: ${this.outputPath}`);
      console.log(`📊 Total ${mergedConfig.totalConfigs} permission configurations`);
    } catch (error) {
      console.error("❌ Failed to generate merged permission configuration:", error);
      throw error;
    }
  }

  /**
   * Watches for changes in permission configuration files (development environment)
   */
  async watchPermissionFiles(): Promise<void> {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    try {
      const { watch } = await import("chokidar");
      const pattern = join(this.rootDir, "**/*.permission.json");

      const watcher = watch(pattern, {
        ignored: (path) => {
          const relativePath = relative(this.rootDir, path);
          return IGNORE_PATTERNS.some((pattern) => {
            const regex = new RegExp(pattern.replace(/\*\*/g, ".*"));
            return regex.test(relativePath);
          });
        },
        persistent: true,
        ignoreInitial: true,
      });

      const handleChange = async (path: string, event: string) => {
        console.log(`${event === "add" ? "➕" : event === "unlink" ? "➖" : "🔄"} ${event} permission configuration file: ${path}`);
        await this.generateMergedConfig();
      };

      watcher
        .on("change", (path) => handleChange(path, "change"))
        .on("add", (path) => handleChange(path, "add"))
        .on("unlink", (path) => handleChange(path, "delete"));
    } catch (error) {
      console.warn("⚠️  Failed to start file watcher, please recompile manually:", error);
    }
  }
}

// Export singleton instance
export const permissionCollector = new PermissionCollector();
