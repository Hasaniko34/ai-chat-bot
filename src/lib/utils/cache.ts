/**
 * Bellek içi önbellek (in-memory cache) mekanizması
 * Üretim ortamında Redis gibi dağıtık bir önbellek sistemi kullanılmalıdır
 */

interface CacheItem<T> {
  value: T;
  expiresAt: number;
}

class Cache {
  private items: Map<string, CacheItem<unknown>>;

  constructor() {
    this.items = new Map();
  }

  set<T>(key: string, value: T, ttlSeconds: number): void {
    const expiresAt = Date.now() + (ttlSeconds * 1000);
    this.items.set(key, { value, expiresAt });
  }

  get<T>(key: string): T | null {
    const item = this.items.get(key);
    
    if (!item) {
      return null;
    }

    if (Date.now() > item.expiresAt) {
      this.items.delete(key);
      return null;
    }

    return item.value as T;
  }

  delete(key: string): void {
    this.items.delete(key);
  }

  clear(): void {
    this.items.clear();
  }

  has(key: string): boolean {
    const item = this.items.get(key);
    if (!item) {
      return false;
    }

    if (Date.now() > item.expiresAt) {
      this.items.delete(key);
      return false;
    }

    return true;
  }
}

export const cache = new Cache();

/**
 * Önbellekli API fonksiyonu için dekoratör
 * @param keyPrefix Önbellek anahtarı öneki
 * @param ttlSeconds Saniye cinsinden yaşam süresi
 */
export function cacheable<T>(
  keyPrefix: string,
  ttlSeconds: number = 60
) {
  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(...args: any[]) {
      // Önbellek anahtarını oluştur
      const cacheKey = `${keyPrefix}:${JSON.stringify(args)}`;
      
      // Önbellekte ara
      const cachedResult = cache.get<T>(cacheKey);
      if (cachedResult !== null) {
        console.log(`Cache hit: ${cacheKey}`);
        return cachedResult;
      }
      
      // Önbellekte yoksa orjinal metodu çağır
      console.log(`Cache miss: ${cacheKey}`);
      const result = await originalMethod.apply(this, args);
      
      // Sonucu önbelleğe kaydet
      cache.set<T>(cacheKey, result, ttlSeconds);
      
      return result;
    };
    
    return descriptor;
  };
} 