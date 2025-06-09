export * from './keys';

import { CacheService } from './cache.service';

// Create and export a default environment-aware cache service instance.
// This cache service will automatically select the appropriate implementation based on the runtime environment.
const cacheService = CacheService.getInstance();
const cache = CacheService.getCache();

export { cacheService, cache };