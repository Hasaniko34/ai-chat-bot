/**
 * In-memory rate limiting yardımcısı
 * LRU önbellek prensibiyle çalışan basit bir rate limiter
 */
export interface RateLimitConfig {
  interval: number; // milisaniye cinsinden aralık (örn. 60000 = 1 dakika)
  uniqueTokenPerInterval: number; // Maksimum benzersiz token (ip, kullanıcı vb) sayısı
}

export function rateLimit(options: RateLimitConfig) {
  const tokenCache = new Map<string, number[]>();
  const { interval, uniqueTokenPerInterval } = options;
  
  // Her interval miktarında bir önbelleği temizlemek için zamanlayıcı başlat
  setInterval(() => {
    const now = Date.now();
    
    // Son intervalde olmayan kayıtları temizle
    tokenCache.forEach((timestamps, key) => {
      const filteredTimestamps = timestamps.filter(timestamp => now - timestamp < interval);
      
      if (filteredTimestamps.length > 0) {
        tokenCache.set(key, filteredTimestamps);
      } else {
        tokenCache.delete(key);
      }
    });
  }, interval);
  
  return {
    /**
     * Gönderilen token için rate limit kontrolü yapar
     * @param token Kontrol edilecek token (IP, kullanıcı ID, vb.)
     * @param limit İzin verilen maksimum istek sayısı
     * @throws Limit aşıldıysa hata fırlatır
     */
    check: async (res: Response, token: string, limit: number) => {
      // Önbelleği aşırı büyümeden korumak için boyut kontrolü
      if (tokenCache.size >= uniqueTokenPerInterval) {
        const oldestToken = [...tokenCache.keys()][0];
        tokenCache.delete(oldestToken);
      }
      
      // Tokena göre zaman damgalarını al veya oluştur
      const now = Date.now();
      const timestamps = tokenCache.get(token) || [];
      
      // Son interval içindeki istek sayısı
      const validTimestamps = timestamps.filter(timestamp => now - timestamp < interval);
      
      // Limit kontrolü
      if (validTimestamps.length >= limit) {
        throw new Error('Rate limit exceeded');
      }
      
      // Yeni zaman damgasını ekle
      tokenCache.set(token, [...validTimestamps, now]);
      
      return res;
    }
  };
} 