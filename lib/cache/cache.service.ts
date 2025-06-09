// Using type imports to avoid actual code being included in client bundles
import type { Cache } from "cache-manager";

// Defines the cache interface, shared by client and server
interface ICacheService {
  get<T>(key: string): Promise<T | undefined>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
}

// Checks if it's a server-side environment
const isServer = typeof window === 'undefined';

// Client-side cache implementation class - uses simple localStorage or in-memory cache
export class BrowserCacheService implements ICacheService {
  private static instance: BrowserCacheService;
  private cache: Map<string, { value: any; expires: number }>;

  private constructor() {
    this.cache = new Map();
  }

  public async get<T>(key: string): Promise<T | undefined> {
    const item = this.cache.get(key);
    if (!item) return undefined;
    
    if (item.expires && item.expires < Date.now()) {
      this.cache.delete(key);
      return undefined;
    }
    
    return item.value as T;
  }

  public async set(key: string, value: any, ttl?: number): Promise<void> {
    const expires = ttl ? Date.now() + ttl : 0;
    this.cache.set(key, { value, expires });
  }

  public async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  public static getInstance(): BrowserCacheService {
    if (!BrowserCacheService.instance) {
      BrowserCacheService.instance = new BrowserCacheService();
    }
    return BrowserCacheService.instance;
  }
}

// Server-side cache implementation class - uses a real caching library
export class ServerCacheService implements ICacheService {
  private static instance: ServerCacheService;
  private cache: any; // Will be of type Cache in actual use

  private constructor() {
    // Dynamically import and initialize cache only on the server
    if (isServer) {
      this.initializeServerCache();
    } else {
      this.cache = null; // This class will not actually run on the client
    }
  }

  private async initializeServerCache() {
    if (isServer) {
      try {
        // Dynamic import, executed only on the server
        const { createCache } = await import('cache-manager');
        const { createKeyv } = await import('cacheable');
        
        // Call server-side cache initialization logic
        const cacheMode = process.env.CACHE_MODE || "memory";
        const memoryTtl = parseInt(process.env.CACHE_MEMORY_TTL || "60000", 10);
        const memoryLruSize = parseInt(process.env.CACHE_MEMORY_LRUSIZE || "5000", 10);
        
        const memoryStore = createKeyv({
          ttl: memoryTtl,
          lruSize: memoryLruSize,
        });
        
        this.cache = createCache({stores: [memoryStore]});
        
        // Redis store initialization if needed, can also dynamically import @keyv/redis
        if (cacheMode === 'redis') {
          const redisUrl = process.env.CACHE_REDIS_URL;
          if (redisUrl) {
            const { createKeyv: createKeyvRedis } = await import('@keyv/redis');
            const redisStore = createKeyvRedis(redisUrl);
            this.cache = createCache({stores: [redisStore]});
          }
        }
      } catch (error) {
        console.error("Failed to initialize server cache:", error);
        // If loading fails, create an empty in-memory implementation
        this.cache = {
          get: async () => undefined,
          set: async () => {},
          del: async () => {}
        };
      }
    }
  }

  public async get<T>(key: string): Promise<T | undefined> {
    if (!this.cache) await this.initializeServerCache();
    try {
      return await this.cache.get(key);
    } catch (error) {
      console.error(`Error getting cache key ${key}:`, error);
      return undefined;
    }
  }

  public async set(key: string, value: any, ttl?: number): Promise<void> {
    if (!this.cache) await this.initializeServerCache();
    try {
      await this.cache.set(key, value, { ttl });
    } catch (error) {
      console.error(`Error setting cache key ${key}:`, error);
    }
  }

  public async del(key: string): Promise<void> {
    if (!this.cache) await this.initializeServerCache();
    try {
      await this.cache.del(key);
    } catch (error) {
      console.error(`Error deleting cache key ${key}:`, error);
    }
  }

  public static getInstance(): ServerCacheService {
    if (!ServerCacheService.instance) {
      ServerCacheService.instance = new ServerCacheService();
    }
    return ServerCacheService.instance;
  }
}

// Export Cache Service class
export class CacheService {
  private static instance: ICacheService;

  public static getInstance(): ICacheService {
    if (!CacheService.instance) {
      CacheService.instance = isServer 
        ? ServerCacheService.getInstance() 
        : BrowserCacheService.getInstance();
    }
    return CacheService.instance;
  }

  // Exports an interface compatible with the old API
  public static getCache(): ICacheService {
    return CacheService.getInstance();
  }
}
