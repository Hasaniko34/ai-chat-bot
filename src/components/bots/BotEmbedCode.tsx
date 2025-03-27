'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface BotEmbedCodeProps {
  apiKey: string;
  botName: string;
}

export function BotEmbedCode({ apiKey, botName }: BotEmbedCodeProps) {
  const [copied, setCopied] = useState(false);

  // Base URL
  const baseUrl = typeof window !== 'undefined' 
    ? `${window.location.protocol}//${window.location.host}`
    : 'https://yourdomain.com';

  // Embed kodu
  const embedCode = `
<!-- ${botName} Chatbot Widget -->
<script>
  (function() {
    // Chatbot yapılandırması
    window.CHATBOT_CONFIG = {
      apiKey: "${apiKey}",
      botName: "${botName}",
      apiEndpoint: "${baseUrl}/api/widget/${apiKey}"
    };
    
    // Widget script'ini yükle
    const script = document.createElement('script');
    script.src = "${baseUrl}/widget.js";
    script.async = true;
    document.body.appendChild(script);
    
    // Widget CSS'ini yükle
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = "${baseUrl}/widget.css";
    document.head.appendChild(link);
  })();
</script>
<!-- Chatbot Widget End -->
`;

  // Kodu kopyala
  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode)
      .then(() => {
        setCopied(true);
        toast.success('Entegrasyon kodu panoya kopyalandı!');
        
        // 2 saniye sonra "Kopyalandı" ifadesini kaldır
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        toast.error('Kod kopyalanırken bir hata oluştu');
        console.error('Kod kopyalama hatası:', err);
      });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Website Entegrasyon Kodu</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Aşağıdaki kodu web sitenizin HTML body bölümünün sonuna, &lt;/body&gt; etiketinden hemen önce ekleyin.
        </p>
        
        <div className="relative">
          <pre className="p-4 bg-muted rounded-md overflow-x-auto text-xs">
            {embedCode}
          </pre>
          
          <Button 
            onClick={copyToClipboard}
            size="sm"
            className="absolute top-2 right-2"
            variant="secondary"
          >
            {copied ? 'Kopyalandı!' : 'Kopyala'}
          </Button>
        </div>
        
        <div className="text-sm space-y-2 mt-4">
          <h4 className="font-medium">Kurulum Adımları:</h4>
          <ol className="list-decimal list-inside space-y-1">
            <li>Yukarıdaki kodu web sitenizin HTML kodundaki body etiketinin sonuna ekleyin.</li>
            <li>Kod otomatik olarak gerekli script ve CSS dosyalarını yükleyecektir.</li>
            <li>Widget sayfanızın sağ alt köşesinde görünecektir.</li>
            <li>Test etmek için sayfanızı yenileyin ve sağ alt köşedeki sohbet simgesine tıklayın.</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
} 