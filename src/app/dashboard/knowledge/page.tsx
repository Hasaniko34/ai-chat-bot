'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { 
  Search, Plus, Upload, FileText, Loader2, Trash, 
  Edit, Check, X, Info, Database, ArrowUpDown, FileQuestion
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Animasyon varyantları
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
};

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

// Bilgi bankası öğeleri için tip tanımı
type KnowledgeItem = {
  id: string;
  title: string;
  content: string;
  type: 'document' | 'qa' | 'link';
  source?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
};

// Interface'i güncelliyoruz, required alanlar için non-optional tip tanımı
interface NewKnowledgeItem {
  title: string;
  content: string;
  type: 'document' | 'qa' | 'link';
  source?: string;
  tags: string[];
}

export default function KnowledgeBasePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([
    {
      id: '1',
      title: 'Şirket Genel Bilgileri',
      content: 'Şirketimiz 2010 yılında kurulmuş olup, e-ticaret sektöründe öncü firmalardan biridir. Ana hizmetlerimiz arasında online satış, dijital pazarlama ve müşteri hizmetleri bulunmaktadır.',
      type: 'document',
      createdAt: '2024-02-15T10:30:00Z',
      updatedAt: '2024-03-01T14:22:00Z',
      tags: ['şirket', 'hakkında', 'genel']
    },
    {
      id: '2',
      title: 'Sıkça Sorulan Sorular',
      content: 'Ürün iade süreçleri, kargo takibi, ödeme yöntemleri ve üyelik işlemleri hakkında sık sorulan sorular ve cevapları.',
      type: 'qa',
      createdAt: '2024-01-20T09:45:00Z',
      updatedAt: '2024-03-05T11:15:00Z',
      tags: ['sss', 'yardım', 'destek']
    },
    {
      id: '3',
      title: 'Ürün Kataloğu',
      content: 'Tüm ürünlerimizin detaylı açıklamaları, teknik özellikleri, fiyatları ve stok durumları.',
      type: 'document',
      source: 'ürün_kataloğu.pdf',
      createdAt: '2024-02-28T16:10:00Z',
      updatedAt: '2024-03-10T08:30:00Z',
      tags: ['ürünler', 'katalog', 'fiyat']
    },
    {
      id: '4',
      title: 'Kargo ve Teslimat Bilgileri',
      content: 'Kargo ücreti hesaplama, teslimat süreleri, kargo firmaları ve teslimat bölgeleri hakkında detaylı bilgiler.',
      type: 'document',
      createdAt: '2024-02-10T13:20:00Z',
      updatedAt: '2024-02-10T13:20:00Z',
      tags: ['kargo', 'teslimat', 'lojistik']
    },
    {
      id: '5',
      title: 'İade ve Değişim Politikası',
      content: 'Ürün iade koşulları, değişim süreçleri, iade talep formu ve yasal düzenlemeler hakkında bilgiler.',
      type: 'document',
      createdAt: '2024-01-15T11:40:00Z',
      updatedAt: '2024-03-02T09:50:00Z',
      tags: ['iade', 'değişim', 'politika']
    }
  ]);

  const [newItem, setNewItem] = useState<NewKnowledgeItem>({
    title: '',
    content: '',
    type: 'document',
    tags: []
  });

  // Yeni etiket eklemek için kullanılan state
  const [newTag, setNewTag] = useState('');

  const filteredItems = knowledgeItems.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreateItem = () => {
    if (!newItem.title || !newItem.content) {
      toast.error('Başlık ve içerik alanları gereklidir');
      return;
    }

    setIsLoading(true);
    
    // API çağrısını simüle et
    setTimeout(() => {
      const newId = Math.random().toString(36).substring(2, 9);
      const timestamp = new Date().toISOString();
      
      const createdItem: KnowledgeItem = {
        id: newId,
        title: newItem.title,
        content: newItem.content,
        type: newItem.type as 'document' | 'qa' | 'link',
        source: newItem.source,
        createdAt: timestamp,
        updatedAt: timestamp,
        tags: newItem.tags || []
      };
      
      setKnowledgeItems([...knowledgeItems, createdItem]);
      setNewItem({
        title: '',
        content: '',
        type: 'document',
        tags: []
      });
      
      setIsLoading(false);
      toast.success('Bilgi bankası öğesi başarıyla oluşturuldu');
    }, 1000);
  };

  const handleDeleteItems = () => {
    if (selectedItems.length === 0) return;
    
    setIsLoading(true);
    
    // API çağrısını simüle et
    setTimeout(() => {
      setKnowledgeItems(knowledgeItems.filter(item => !selectedItems.includes(item.id)));
      setSelectedItems([]);
      setIsLoading(false);
      toast.success(`${selectedItems.length} öğe başarıyla silindi`);
    }, 1000);
  };

  const handleSelectItem = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(item => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(item => item.id));
    }
  };

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    
    if (!newItem.tags?.includes(newTag)) {
      setNewItem({
        ...newItem,
        tags: [...(newItem.tags || []), newTag.trim()]
      });
    }
    
    setNewTag('');
  };

  const handleRemoveTag = (tag: string) => {
    setNewItem({
      ...newItem,
      tags: newItem.tags?.filter(t => t !== tag)
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString('tr-TR')} ${date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const getItemTypeLabel = (type: string) => {
    switch (type) {
      case 'document': return 'Doküman';
      case 'qa': return 'Soru-Cevap';
      case 'link': return 'Bağlantı';
      default: return 'Bilinmeyen';
    }
  };

  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="h-4 w-4" />;
      case 'qa': return <FileQuestion className="h-4 w-4" />;
      case 'link': return <Database className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  return (
    <motion.div 
      className="container mx-auto py-8 px-4 md:px-6"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bilgi Bankası</h1>
          <p className="text-white/70 mt-1">
            Chatbot'unuza bilgi sağlamak için dokümanları ve bilgileri yönetin
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full lg:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
            <Input 
              placeholder="Bilgi bankasında ara..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border-white/10 pl-10 w-full lg:w-60"
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid grid-cols-2 bg-black/50 border border-white/10 p-1 rounded-lg w-full sm:w-60 mb-6">
          <TabsTrigger value="browse" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600">
            <FileText className="h-4 w-4 mr-2" /> Gözat
          </TabsTrigger>
          <TabsTrigger value="add" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600">
            <Plus className="h-4 w-4 mr-2" /> Ekle
          </TabsTrigger>
        </TabsList>

        {/* Bilgi Bankası Gözat */}
        <TabsContent value="browse">
          <motion.div variants={slideUp} className="space-y-4">
            {selectedItems.length > 0 && (
              <div className="flex items-center justify-between bg-black/40 border border-white/10 p-3 rounded-lg mb-4">
                <span className="text-sm text-white/70">{selectedItems.length} öğe seçildi</span>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleDeleteItems}
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash className="h-4 w-4 mr-2" />}
                  Sil
                </Button>
              </div>
            )}

            <Card className="bg-black/40 border-white/10 shadow-xl backdrop-blur-sm">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>Bilgi Bankası Öğeleri</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAll}
                    className="text-xs h-8"
                  >
                    {selectedItems.length === filteredItems.length ? 'Hiçbirini Seçme' : 'Tümünü Seç'}
                  </Button>
                </div>
                <CardDescription>
                  Chatbot'un yanıtları için kullanacağı bilgi kaynakları
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="w-10 px-2 py-3 text-left">
                          <div className="flex items-center h-5">
                            <input
                              type="checkbox"
                              className="rounded bg-white/5 border-white/10"
                              checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                              onChange={handleSelectAll}
                            />
                          </div>
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                          <div className="flex items-center">
                            Öğe
                            <ArrowUpDown className="h-3 w-3 ml-1" />
                          </div>
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                          <div className="flex items-center">
                            Tür
                          </div>
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider hidden md:table-cell">
                          <div className="flex items-center">
                            Güncelleme
                            <ArrowUpDown className="h-3 w-3 ml-1" />
                          </div>
                        </th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-white/60 uppercase tracking-wider">
                          İşlemler
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {filteredItems.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-3 py-6 text-center text-white/60">
                            Bilgi bankasında öğe bulunamadı. Yeni öğe eklemek için "Ekle" sekmesini kullanabilirsiniz.
                          </td>
                        </tr>
                      ) : (
                        filteredItems.map((item) => (
                          <tr 
                            key={item.id} 
                            className={cn(
                              "hover:bg-white/5 transition-colors",
                              selectedItems.includes(item.id) ? "bg-indigo-900/20" : ""
                            )}
                          >
                            <td className="w-10 px-2 py-3">
                              <div className="flex items-center h-5">
                                <input
                                  type="checkbox"
                                  className="rounded bg-white/5 border-white/10"
                                  checked={selectedItems.includes(item.id)}
                                  onChange={() => handleSelectItem(item.id)}
                                />
                              </div>
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              <div className="flex flex-col">
                                <span className="font-medium">{item.title}</span>
                                <span className="text-xs text-white/60 mt-1 line-clamp-1">{item.content}</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {item.tags.map(tag => (
                                    <span 
                                      key={tag} 
                                      className="inline-flex text-[10px] bg-indigo-900/30 text-indigo-300 px-1.5 py-0.5 rounded"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              <div className="flex items-center">
                                {getItemTypeIcon(item.type)}
                                <span className="ml-1.5 text-sm">{getItemTypeLabel(item.type)}</span>
                              </div>
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap hidden md:table-cell">
                              <span className="text-sm text-white/70">{formatDate(item.updatedAt)}</span>
                            </td>
                            <td className="px-3 py-3 text-right whitespace-nowrap">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleSelectItem(item.id)}
                                  className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Bilgi Bankası Ekle */}
        <TabsContent value="add">
          <motion.div variants={slideUp} className="space-y-6">
            <Card className="bg-black/40 border-white/10 shadow-xl backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Bilgi Bankasına Öğe Ekle</CardTitle>
                <CardDescription>
                  Chatbot'unuzun kullanabileceği bilgi bankası öğeleri ekleyin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label htmlFor="title" className="text-sm font-medium">Başlık</label>
                      <span className="text-xs text-white/60">Gerekli</span>
                    </div>
                    <Input
                      id="title"
                      placeholder="Bilgi başlığı"
                      value={newItem.title}
                      onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                      className="bg-white/5 border-white/10 focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label htmlFor="content" className="text-sm font-medium">İçerik</label>
                      <span className="text-xs text-white/60">Gerekli</span>
                    </div>
                    <Textarea
                      id="content"
                      placeholder="Bilgi içeriği veya sorular/cevaplar"
                      value={newItem.content}
                      onChange={(e) => setNewItem({...newItem, content: e.target.value})}
                      className="min-h-[150px] bg-white/5 border-white/10 focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="type" className="text-sm font-medium">Bilgi Türü</label>
                    <div className="grid grid-cols-3 gap-3">
                      <Button
                        type="button"
                        variant={newItem.type === 'document' ? 'default' : 'outline'}
                        className={cn(
                          "border-white/10 flex flex-col items-center p-3 h-auto",
                          newItem.type === 'document' ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-white/5'
                        )}
                        onClick={() => setNewItem({...newItem, type: 'document'})}
                      >
                        <FileText className="h-5 w-5 mb-1" />
                        <span className="text-xs">Doküman</span>
                      </Button>
                      <Button
                        type="button"
                        variant={newItem.type === 'qa' ? 'default' : 'outline'}
                        className={cn(
                          "border-white/10 flex flex-col items-center p-3 h-auto",
                          newItem.type === 'qa' ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-white/5'
                        )}
                        onClick={() => setNewItem({...newItem, type: 'qa'})}
                      >
                        <FileQuestion className="h-5 w-5 mb-1" />
                        <span className="text-xs">Soru-Cevap</span>
                      </Button>
                      <Button
                        type="button"
                        variant={newItem.type === 'link' ? 'default' : 'outline'}
                        className={cn(
                          "border-white/10 flex flex-col items-center p-3 h-auto",
                          newItem.type === 'link' ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-white/5'
                        )}
                        onClick={() => setNewItem({...newItem, type: 'link'})}
                      >
                        <Database className="h-5 w-5 mb-1" />
                        <span className="text-xs">Veri Kaynağı</span>
                      </Button>
                    </div>
                  </div>

                  {newItem.type === 'link' && (
                    <div className="space-y-2">
                      <label htmlFor="source" className="text-sm font-medium">Kaynak URL</label>
                      <Input
                        id="source"
                        placeholder="https://example.com/data"
                        value={newItem.source || ''}
                        onChange={(e) => setNewItem({...newItem, source: e.target.value})}
                        className="bg-white/5 border-white/10 focus:border-indigo-500"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <label htmlFor="tags" className="text-sm font-medium">Etiketler</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {newItem.tags?.map(tag => (
                        <div 
                          key={tag} 
                          className="flex items-center bg-indigo-900/30 text-indigo-300 rounded px-2 py-1"
                        >
                          <span className="text-xs">{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1.5 text-white/60 hover:text-white"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        id="tags"
                        placeholder="Yeni etiket ekle"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        className="bg-white/5 border-white/10 focus:border-indigo-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={handleAddTag}
                        className="shrink-0"
                      >
                        Ekle
                      </Button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="p-4 rounded-lg bg-indigo-900/20 border border-indigo-900/30">
                      <div className="flex items-start">
                        <Info className="h-5 w-5 text-indigo-400 mr-3 mt-0.5" />
                        <div className="text-sm text-white/80">
                          <p className="font-medium text-white mb-1">Bilgi bankası nasıl kullanılır?</p>
                          <p className="mb-2">Bilgi bankasına eklediğiniz içerikler, chatbot'unuzun cevaplarını oluştururken kullanılacaktır. Daha iyi sonuçlar için:</p>
                          <ul className="list-disc list-inside space-y-1 text-white/70">
                            <li>Açık ve anlaşılır bilgiler ekleyin</li>
                            <li>İlgili bilgileri kategorilere ayırın</li>
                            <li>Soru-cevap formatını kullanarak doğrudan yanıtlar oluşturun</li>
                            <li>Etiketler ekleyerek içeriği daha kolay bulunabilir yapın</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t border-white/10 pt-6">
                <Button
                  variant="outline"
                  className="border-white/10 text-white/70 mr-2"
                  onClick={() => setNewItem({
                    title: '',
                    content: '',
                    type: 'document',
                    tags: []
                  })}
                >
                  Temizle
                </Button>
                <Button
                  onClick={handleCreateItem}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Bilgi Bankasına Ekle
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-black/40 border-white/10 shadow-xl backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Dosyadan İçe Aktar</CardTitle>
                <CardDescription>
                  PDF, DOC, TXT ve diğer doküman formatlarını bilgi bankasına aktarın
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-white/10 rounded-lg p-8 text-center">
                  <Upload className="h-8 w-8 mx-auto text-white/40 mb-3" />
                  <p className="text-white/70 mb-4">Dosyaları sürükleyip bırakın veya dosya seçin</p>
                  <Button
                    variant="outline"
                    className="bg-white/5 border-white/20"
                  >
                    Dosya Seç
                  </Button>
                  <p className="mt-4 text-xs text-white/50">
                    PDF, DOCX, TXT, CSV formatları desteklenir (Max: 10MB)
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
} 