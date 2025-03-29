/**
 * Basit loglama yardımcısı
 * Prodüksiyonda daha gelişmiş bir loglama kütüphanesi kullanılabilir (winston, pino vb.)
 */
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogOptions {
  level?: LogLevel;
  context?: string;
  data?: any;
}

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

// Ortam değişkenine göre loglama seviyesini belirle
const getMinLogLevel = (): LogLevel => {
  const env = process.env.NODE_ENV || 'development';
  const level = process.env.LOG_LEVEL || (env === 'production' ? 'info' : 'debug');
  return level as LogLevel;
};

const MIN_LOG_LEVEL = LOG_LEVELS[getMinLogLevel()];

/**
 * Yapılandırılmış bir log mesajı oluşturur
 */
export function log(message: string, options: LogOptions = {}) {
  const { level = 'info', context, data } = options;
  
  // Minimum log seviyesini kontrol et
  if (LOG_LEVELS[level] < MIN_LOG_LEVEL) {
    return;
  }
  
  const timestamp = new Date().toISOString();
  const contextStr = context ? `[${context}]` : '';
  
  let logFn: (message?: any, ...optionalParams: any[]) => void;
  
  switch (level) {
    case 'debug':
      logFn = console.debug;
      break;
    case 'warn':
      logFn = console.warn;
      break;
    case 'error':
      logFn = console.error;
      break;
    case 'info':
    default:
      logFn = console.info;
  }
  
  // Log mesajını oluştur
  logFn(`${timestamp} ${level.toUpperCase()} ${contextStr} ${message}`);
  
  // Varsa ek veriyi logla
  if (data) {
    logFn('Data:', data);
  }
}

/**
 * API isteklerinin loglanması için yardımcı fonksiyon
 */
export function logApiRequest(
  method: string,
  path: string,
  statusCode: number,
  duration: number,
  userId?: string,
  error?: any
) {
  // Temel API isteği logu
  const logMessage = `${method} ${path} ${statusCode} ${duration}ms`;
  
  const logLevel: LogLevel = 
    statusCode >= 500 ? 'error' :
    statusCode >= 400 ? 'warn' : 
    'info';
  
  const logContext = 'API';
  
  const logData = {
    method,
    path,
    statusCode,
    duration,
    ...(userId ? { userId } : {}),
    ...(error ? { error: error.message || String(error) } : {})
  };
  
  log(logMessage, { level: logLevel, context: logContext, data: logData });
}

// Kısayol fonksiyonlar
export const logger = {
  debug: (message: string, options?: Omit<LogOptions, 'level'>) => log(message, { ...options, level: 'debug' }),
  info: (message: string, options?: Omit<LogOptions, 'level'>) => log(message, { ...options, level: 'info' }),
  warn: (message: string, options?: Omit<LogOptions, 'level'>) => log(message, { ...options, level: 'warn' }),
  error: (message: string, options?: Omit<LogOptions, 'level'>) => log(message, { ...options, level: 'error' }),
  api: logApiRequest
}; 