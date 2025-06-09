// scripts/extract-missing-translations.ts
import * as fs from 'fs';
import * as path from 'path';

const PROJECT_ROOT = process.cwd();
const MESSAGES_DIR = path.join(PROJECT_ROOT, 'i18n');
const OUTPUT_FILE = path.join(MESSAGES_DIR, 'missing-translations.json');

interface Translations {
  [key: string]: string | Translations;
}

function flattenKeys(obj: Translations, prefix: string = ''): Set<string> {
  const keys = new Set<string>();
  for (const k in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) {
      const fullKey = prefix ? `${prefix}.${k}` : k;
      if (typeof obj[k] === 'object' && obj[k] !== null) {
        flattenKeys(obj[k] as Translations, fullKey).forEach(nestedKey => keys.add(nestedKey));
      } else {
        keys.add(fullKey);
      }
    }
  }
  return keys;
}

function loadTranslations(langDir: string): Set<string> {
  const allKeys = new Set<string>();
  const files = fs.readdirSync(langDir);

  for (const file of files) {
    if (file.endsWith('.json')) {
      const filePath = path.join(langDir, file);
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const translations: Translations = JSON.parse(content);
        const namespace = path.basename(file, '.json');
        flattenKeys(translations, namespace).forEach(key => allKeys.add(key));
      } catch (error) {
        console.error(`Error reading or parsing ${filePath}:`, error);
      }
    }
  }
  return allKeys;
}

function extractTranslationKeys(filePath: string): Set<string> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const keys = new Set<string>();

  // Regex to find useTranslations('namespace')
  // Regex to find useTranslations('namespace') and capture the variable it's assigned to
  // This regex tries to capture:
  // 1. const t = useTranslations('namespace');
  // 2. const { t } = useTranslations('namespace'); (less common for next-intl but possible)
  // 3. let t = useTranslations('namespace');
  // 4. var t = useTranslations('namespace');
  const useTranslationsRegex = /(?:(?:const|let|var)\s+([a-zA-Z0-9_]+)\s*=\s*useTranslations\(['"]([^'"]+)['"]\))|(?:useTranslations\(['"]([^'"]+)['"]\))/g;
  let match;
  const namespaces: { [key: string]: string } = {}; // Map variable name to namespace

  while ((match = useTranslationsRegex.exec(content)) !== null) {
    const varName = match[1] || 't'; // Default to 't' if no explicit variable name is captured
    const namespace = match[2] || match[3]; // Namespace from either capture group

    if (namespace) {
      namespaces[varName] = namespace;
    }
  }

  // Regex to find t('key') or t.nested('key')
  // This regex specifically targets calls to a variable (like 't') followed by
  // a string literal, optionally with nested properties.
  const tCallRegex = /([a-zA-Z0-9_]+)(?:\.([a-zA-Z0-9_.]+))?\(['"]([^'"]+)['"]\)/g;
  while ((match = tCallRegex.exec(content)) !== null) {
    const varName = match[1];
    const nestedPath = match[2]; // Optional nested path like 'nested.sub'
    const key = match[3];

    if (varName && key) {

      const namespace = namespaces[varName];
      if (namespace) {
        keys.add(`${namespace}.${nestedPath ? `${nestedPath}.` : ''}${key}`);
      } else if (varName === 't') {
        keys.add(`${nestedPath ? `${nestedPath}.` : ''}${key}`);
      }
    }
  }

  return keys;
}

function findCodeFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== 'messages' && file !== 'public' && file !== 'scripts') {
        findCodeFiles(filePath, fileList);
      }
    } else if ((file.endsWith('.tsx') || file.endsWith('.ts')) && file !== 'i18n.ts') {
      fileList.push(filePath);
    }
  }
  return fileList;
}

function generateMissingTranslationsFile(missingKeys: Set<string>) {
  const output: Translations = {};

  missingKeys.forEach(fullKey => {
    const parts = fullKey.split('.');
    let current: Translations = output;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        current[part] = ''; // Default empty string for missing translation
      } else {
        if (!current[part] || typeof current[part] !== 'object') {
          current[part] = {};
        }
        current = current[part] as Translations;
      }
    }
  });

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`Generated missing translations file: ${OUTPUT_FILE}`);
}

async function main() {
  console.log('Starting missing translations extraction...');

  const existingEnKeys = loadTranslations(path.join(MESSAGES_DIR, 'en'));
  const existingZhCnKeys = loadTranslations(path.join(MESSAGES_DIR, 'zh-CN'));
  const allExistingKeys = new Set([...existingEnKeys, ...existingZhCnKeys]);

  console.log(`Loaded ${allExistingKeys.size} existing translation keys.`);

  const codeFiles = findCodeFiles(PROJECT_ROOT);
  console.log(`Found ${codeFiles.length} code files to scan.`);

  const allUsedKeys = new Set<string>();
  for (const file of codeFiles) {
    try {
      extractTranslationKeys(file).forEach(key => allUsedKeys.add(key));
    } catch (error) {
      console.error(`Error processing file ${file}:`, error);
    }
  }

  console.log(`Found ${allUsedKeys.size} used translation keys in code.`);

  const missingKeys = new Set<string>();
  for (const usedKey of allUsedKeys) {
    if (!allExistingKeys.has(usedKey)) {
      missingKeys.add(usedKey);
    }
  }

  if (missingKeys.size > 0) {
    console.log(`Found ${missingKeys.size} missing translation keys.`);
    generateMissingTranslationsFile(missingKeys);
  } else {
    console.log('No missing translation keys found. Creating an empty file.');
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify({}, null, 2), 'utf-8');
  }

  console.log('Missing translations extraction complete.');
}

main().catch(console.error);