'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';
import { swaggerSpec } from '@/lib/openapi/index';
import { useLanguage } from '@/hooks/useLanguage';

// Swagger UI bileşenini yalnızca istemci tarafında yükle
const SwaggerUI = dynamic(() => import('swagger-ui-react').then((mod) => mod.default), { ssr: false });

export default function ApiDocsPage() {
  const { t } = useLanguage();
  
  useEffect(() => {
    // Belge başlığını ayarla
    document.title = t('api_docs.title') + ' | ChatBot Forge';
  }, [t]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-4">{t('api_docs.title')}</h1>
        <p className="text-gray-400 mb-8">
          {t('api_docs.description')}
        </p>
        
        <div className="bg-white rounded-lg overflow-hidden">
          <SwaggerUI spec={swaggerSpec} />
        </div>
      </div>
    </div>
  );
} 