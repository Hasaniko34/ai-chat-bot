'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';

// Bot şema doğrulama
const botSchema = z.object({
  name: z.string().min(3, { message: 'Bot adı en az 3 karakter olmalıdır' }),
  description: z.string().min(10, { message: 'Açıklama en az 10 karakter olmalıdır' }),
  websiteUrl: z.string().url({ message: 'Geçerli bir URL girmelisiniz' }),
  prompt: z.string().min(20, { message: 'Prompt en az 20 karakter olmalıdır' }),
  primaryColor: z.string().regex(/^#([0-9A-F]{6})$/i, { 
    message: 'Geçerli bir HEX renk kodu girin (örn: #4338ca)' 
  }).default('#4338ca'),
  fontFamily: z.string().default('Inter, sans-serif'),
});

type BotFormValues = z.infer<typeof botSchema>;

interface BotFormProps {
  initialData?: BotFormValues;
  isEditing?: boolean;
}

export function BotForm({ initialData, isEditing = false }: BotFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form varsayılan değerleri
  const defaultValues: Partial<BotFormValues> = {
    name: '',
    description: '',
    websiteUrl: '',
    prompt: 'Sen yardımcı bir asistansın. Kullanıcı sorularına nazik ve bilgilendirici cevaplar ver.',
    primaryColor: '#4338ca',
    fontFamily: 'Inter, sans-serif',
    ...initialData,
  };

  const form = useForm<BotFormValues>({
    resolver: zodResolver(botSchema),
    defaultValues,
  });

  // Form gönderme işlemi
  const onSubmit = async (values: BotFormValues) => {
    try {
      setIsSubmitting(true);
      
      const url = isEditing 
        ? `/api/bots/${initialData?.name}` // Düzenleme için
        : '/api/bots'; // Yeni bot oluşturma için
      
      const response = await fetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Bir hata oluştu');
      }
      
      toast.success(
        isEditing ? 'Bot başarıyla güncellendi!' : 'Bot başarıyla oluşturuldu!'
      );
      
      router.push('/dashboard/bots');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>
          {isEditing ? 'Bot Düzenle' : 'Yeni Bot Oluştur'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bot Adı</FormLabel>
                  <FormControl>
                    <Input placeholder="Yardımcı Asistan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Açıklama</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Bu bot müşterilere yardımcı olmak için tasarlanmıştır." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="websiteUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prompt</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Bot davranışını tanımlayan talimatlar..." 
                      className="min-h-32"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="primaryColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bot Rengi</FormLabel>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Input type="color" {...field} className="w-16 h-10" />
                    </FormControl>
                    <FormControl>
                      <Input {...field} className="w-32" />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="fontFamily"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Yazı Tipi</FormLabel>
                  <FormControl>
                    <select
                      className="w-full border rounded p-2"
                      {...field}
                    >
                      <option value="Inter, sans-serif">Inter</option>
                      <option value="Roboto, sans-serif">Roboto</option>
                      <option value="Poppins, sans-serif">Poppins</option>
                      <option value="Arial, sans-serif">Arial</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <CardFooter className="flex justify-between px-0">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.back()}
              >
                İptal
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting 
                  ? isEditing ? 'Güncelleniyor...' : 'Oluşturuluyor...' 
                  : isEditing ? 'Güncelle' : 'Oluştur'
                }
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 