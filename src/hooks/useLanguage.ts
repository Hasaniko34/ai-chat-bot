import { useState, useEffect, useCallback } from 'react';
import tr from '@/locales/tr';

// Varsayılan dil
const DEFAULT_LANGUAGE = 'tr';

// Desteklenen dillerin listesi
export const supportedLanguages = ['tr', 'en'];

// Kullanılabilir dil dosyaları
const translations = {
  tr,
  // İngilizce dil dosyası eklenmemiş, varsayılan olarak key'leri döndürüyoruz
  en: {}
};

export type Language = typeof DEFAULT_LANGUAGE;

type Translations = typeof tr;

/**
 * Dil desteği için hook
 * @returns Çeviri fonksiyonlarını ve dil değiştirme işlevlerini içeren nesne
 */
export const useLanguage = () => {
  // Dil durumunu tutan state
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);

  // Tarayıcı dil ayarını kontrol ederek başlangıç dili belirleme
  useEffect(() => {
    const storedLanguage = localStorage.getItem('language') as Language | null;
    
    if (storedLanguage && supportedLanguages.includes(storedLanguage)) {
      setLanguage(storedLanguage);
    } else {
      const browserLang = navigator.language.split('-')[0];
      const newLanguage = supportedLanguages.includes(browserLang) 
        ? browserLang as Language 
        : DEFAULT_LANGUAGE;
      
      setLanguage(newLanguage);
      localStorage.setItem('language', newLanguage);
    }
  }, []);

  // Dil değiştirme fonksiyonu
  const changeLanguage = useCallback((newLanguage: Language) => {
    if (supportedLanguages.includes(newLanguage)) {
      setLanguage(newLanguage);
      localStorage.setItem('language', newLanguage);
      document.documentElement.lang = newLanguage;
    }
  }, []);

  // Çeviri fonksiyonu (basit anahtarlar için)
  const t = useCallback((key: string): string => {
    // Anahtarı nokta notasyonu ile ayırma (örn: "common.welcome" -> ["common", "welcome"])
    const keys = key.split('.');
    
    try {
      // Aktif dil dosyası
      const translationObj = translations[language] || {};
      
      // Anahtar yolunu takip ederek çeviriyi bulma
      let result = translationObj as any;
      for (const k of keys) {
        result = result[k];
        if (result === undefined) break;
      }
      
      return result || key; // Çeviri bulunamadıysa anahtarın kendisini döndür
    } catch (error) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
  }, [language]);

  // Dinamik parametreli çeviri fonksiyonu
  const tWithParams = useCallback((key: string, params: Record<string, any>): string => {
    let translatedText = t(key);
    
    // Parametreleri ${paramName} formatlı yerleştiricilerle değiştir
    Object.keys(params).forEach(paramKey => {
      translatedText = translatedText.replace(
        new RegExp(`\\$\\{${paramKey}\\}`, 'g'),
        String(params[paramKey])
      );
    });
    
    return translatedText;
  }, [t]);

  return {
    language,
    supportedLanguages,
    changeLanguage,
    t,
    tWithParams
  };
}; 