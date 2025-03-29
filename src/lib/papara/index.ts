import { ApiError } from '../utils/apiError';
import { logger } from '../utils/logger';

interface PaparaPaymentOptions {
  amount: number;
  currency: string;
  referenceId: string;
  description: string;
  callbackUrl: string;
}

export class PaparaService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.PAPARA_API_KEY || '';
    this.baseUrl = process.env.PAPARA_API_URL || 'https://api.papara.com';

    if (!this.apiKey) {
      throw new Error('PAPARA_API_KEY environment variable is not set');
    }
  }

  async createPayment(options: PaparaPaymentOptions) {
    try {
      const response = await fetch(`${this.baseUrl}/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: options.amount,
          currency: options.currency,
          referenceId: options.referenceId,
          description: options.description,
          callbackUrl: options.callbackUrl,
          notificationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/payments/papara/webhook`
        })
      });

      if (!response.ok) {
        throw new ApiError({
          message: 'Papara ödeme oluşturma hatası',
        });
      }

      const data = await response.json();
      return data;
    } catch (error) {
      logger.error('Papara ödeme oluşturma hatası', {
        context: 'PAPARA',
        data: { error: error instanceof Error ? error.message : 'Bilinmeyen hata' }
      });
      throw new ApiError({
        message: 'Papara ödeme oluşturma hatası',
      });
    }
  }
} 