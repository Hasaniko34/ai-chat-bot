import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(req: Request) {
  try {
    // İstek gövdesinden URL'yi al
    const body = await req.json();
    const { url } = body;
    
    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL parametresi gereklidir' },
        { status: 400 }
      );
    }
    
    // URL formatını kontrol et
    let validUrl: URL;
    try {
      validUrl = new URL(url);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz URL formatı' },
        { status: 400 }
      );
    }
    
    // Web sayfasını getir
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Web sayfası getirilemedi: ${response.status} ${response.statusText}` 
        },
        { status: response.status }
      );
    }
    
    const html = await response.text();
    
    // HTML parsing için cheerio kullan
    const $ = cheerio.load(html);
    
    // Metni topla
    let content = '';
    
    // Başlık ekle
    const title = $('title').text().trim();
    if (title) {
      content += `Başlık: ${title}\n\n`;
    }
    
    // Meta açıklaması ekle
    const metaDescription = $('meta[name="description"]').attr('content');
    if (metaDescription) {
      content += `Açıklama: ${metaDescription}\n\n`;
    }
    
    // Ana içeriği çek
    content += 'İçerik:\n';
    
    // Gereksiz elementleri kaldır
    $('script, style, nav, footer, header, aside, [role="banner"], [role="navigation"]').remove();
    
    // Önemli içerik alanlarını bul
    const mainContent = $('main, article, .content, .post, #content, #main');
    
    if (mainContent.length > 0) {
      // Öncelikli olarak ana içerik bölümlerinden metin çek
      mainContent.each((i, el) => {
        $(el).find('h1, h2, h3, h4, h5, h6, p, li, a, strong, em, blockquote').each((j, element) => {
          const text = $(element).text().trim();
          if (text) {
            const tagName = element.name.toLowerCase();
            if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
              content += `\n${text}\n`;
            } else if (tagName === 'a' && $(element).attr('href')?.includes('mailto:')) {
              content += `\nİletişim: ${text}\n`;
            } else {
              content += `${text}\n`;
            }
          }
        });
      });
    } else {
      // Ana içerik bulunamazsa, body'den önemli metinleri çek
      $('body').find('h1, h2, h3, h4, h5, h6, p, li').each((i, element) => {
        const text = $(element).text().trim();
        if (text) {
          const tagName = element.name.toLowerCase();
          if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
            content += `\n${text}\n`;
          } else {
            content += `${text}\n`;
          }
        }
      });
    }
    
    // Formları topla (sık sorulan sorular için)
    $('form').each((i, form) => {
      content += '\nForm:\n';
      $(form).find('label, input[placeholder], textarea[placeholder]').each((j, el) => {
        const labelText = $(el).text().trim() || $(el).attr('placeholder');
        if (labelText) {
          content += `${labelText}\n`;
        }
      });
    });
    
    // İletişim bilgilerini topla
    $('a[href^="mailto:"], a[href^="tel:"]').each((i, el) => {
      const href = $(el).attr('href') || '';
      const text = $(el).text().trim() || href;
      content += `\nİletişim: ${text}\n`;
    });
    
    // İçeriği temizle ve düzenle
    content = content
      .replace(/\s+/g, ' ')
      .replace(/\n\s+/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    
    // İçeriği sınırla (çok uzunsa)
    const maxLength = 5000;
    if (content.length > maxLength) {
      content = content.substring(0, maxLength) + '...\n[İçerik çok uzun olduğu için kısaltıldı]';
    }
    
    // URL'yi de içeriğe ekle
    content = `Website URL: ${url}\n\n${content}`;
    
    return NextResponse.json({ 
      success: true, 
      content, 
      url 
    });
    
  } catch (error) {
    console.error('Web scraping hatası:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu'
      },
      { status: 500 }
    );
  }
} 