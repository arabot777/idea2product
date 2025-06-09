import * as fs from 'fs/promises';
import * as path from 'path';
import * as chokidar from 'chokidar';

const MESSAGES_DIR = path.join(process.cwd(), 'i18n');
const LOCALES: string[] = ['en', 'zh-CN'];

/**
 * Converts a string to PascalCase.
 * @param str The input string.
 * @returns The converted string in PascalCase.
 */
function convertToPascalCase(str: string): string {
  return str
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

/**
 * Merges localization files for a specific locale.
 * @param locale The locale code.
 */
async function mergeLocaleFiles(locale: string): Promise<void> {
  const localeDir = path.join(MESSAGES_DIR, locale);
  const outputFile = path.join(MESSAGES_DIR, `${locale}.json`);
  
  try {
    const files = await fs.readdir(localeDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    const merged: Record<string, any> = {};
    
    for (const file of jsonFiles) {
      const filePath = path.join(localeDir, file);
      const content = await fs.readFile(filePath, 'utf8');
      const fileName = file.replace(/\.json$/, '');
      const key = convertToPascalCase(fileName);
      try {
        merged[key] = JSON.parse(content);
      } catch (error) {
        console.error(`Error parsing ${filePath}:`, error instanceof Error ? error.message : String(error));
      }
    }
    
    await fs.writeFile(outputFile, JSON.stringify(merged, null, 2) + '\n');
  } catch (error) {
    console.error(`Error merging ${locale} files:`, error instanceof Error ? error.message : String(error));
  }
}

/**
 * Merges localization files for all locales.
 */
async function mergeAllLocales(): Promise<void> {
  for (const locale of LOCALES) {
    await mergeLocaleFiles(locale);
  }
}

/**
 * Watches for changes in localization files and merges them automatically.
 * @returns The chokidar watcher instance.
 */
function watchLocales(): chokidar.FSWatcher {
  const watcher = chokidar.watch(
    LOCALES.map(locale => path.join(MESSAGES_DIR, locale, '**/*.json')),
    { ignoreInitial: true }
  );
  
  const handleFileChange = (filePath: string): void => {
    const locale = filePath.split(path.sep).find(dir => LOCALES.includes(dir));
    if (locale) {
      mergeLocaleFiles(locale);
    }
  };
  
  watcher
    .on('add', (path) => handleFileChange(path))
    .on('change', (path) => handleFileChange(path))
    .on('unlink', (path) => handleFileChange(path));  
  return watcher;
}

// Export functions
export {
  mergeAllLocales,
  watchLocales,
  mergeLocaleFiles
};

// If this script is run directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const watch = args.includes('--watch');
  
  mergeAllLocales().then(() => {
    if (watch) {
      watchLocales();
    }
  });
}
