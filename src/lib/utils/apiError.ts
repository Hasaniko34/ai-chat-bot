/**
 * API hatalarını standartlaştırmak için özel hata sınıfı
 */
export class ApiError extends Error {
  public statusCode: number;
  public code: string;
  public details?: unknown;
  
  constructor({
    message,
    statusCode = 500,
    code = 'INTERNAL_SERVER_ERROR',
    details
  }: {
    message: string;
    statusCode?: number;
    code?: string;
    details?: unknown;
  }) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
  
  /**
   * Hata yanıtı oluşturmak için
   */
  toResponse() {
    return {
      error: {
        message: this.message,
        code: this.code,
        ...(this.details ? { details: this.details } : {})
      }
    };
  }
  
  /**
   * Geçersiz istek hatası oluşturmak için
   */
  static badRequest(message: string, details?: unknown) {
    return new ApiError({
      message,
      statusCode: 400,
      code: 'BAD_REQUEST',
      details
    });
  }
  
  /**
   * Kimlik doğrulama hatası oluşturmak için
   */
  static unauthorized(message = 'Yetkilendirme gerekli') {
    return new ApiError({
      message,
      statusCode: 401,
      code: 'UNAUTHORIZED'
    });
  }
  
  /**
   * Yetkilendirme hatası oluşturmak için 
   */
  static forbidden(message = 'Bu işlem için yetkiniz yok') {
    return new ApiError({
      message,
      statusCode: 403,
      code: 'FORBIDDEN'
    });
  }
  
  /**
   * Bulunamadı hatası oluşturmak için
   */
  static notFound(message = 'Kaynak bulunamadı') {
    return new ApiError({
      message,
      statusCode: 404,
      code: 'NOT_FOUND'
    });
  }
  
  /**
   * Çakışma hatası oluşturmak için
   */
  static conflict(message = 'Kaynak zaten mevcut') {
    return new ApiError({
      message,
      statusCode: 409,
      code: 'CONFLICT'
    });
  }
  
  /**
   * Rate limit hatası oluşturmak için
   */
  static tooManyRequests(message = 'Çok fazla istek gönderildi') {
    return new ApiError({
      message,
      statusCode: 429,
      code: 'TOO_MANY_REQUESTS'
    });
  }
  
  /**
   * Sunucu hatası oluşturmak için
   */
  static internal(message = 'Sunucu hatası') {
    return new ApiError({
      message,
      statusCode: 500,
      code: 'INTERNAL_SERVER_ERROR'
    });
  }

  static serviceUnavailable(message = 'Servis geçici olarak kullanılamıyor') {
    return new ApiError({
      message,
      statusCode: 503,
      code: 'SERVICE_UNAVAILABLE'
    });
  }
} 