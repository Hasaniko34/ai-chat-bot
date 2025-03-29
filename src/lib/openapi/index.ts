/**
 * ChatBot Forge API'sı için OpenAPI spesifikasyonu
 * Gemini AI entegrasyonu ile
 */
export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'ChatBot Forge API',
    version: '1.0.0',
    description: 'ChatBot Forge platformu için RESTful API, Gemini AI entegrasyonu ile',
    contact: {
      name: 'API Desteği',
      email: 'support@chatbotforge.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: '/api/v1',
      description: 'API Sunucusu v1'
    }
  ],
  tags: [
    {
      name: 'bots',
      description: 'Bot yönetimi işlemleri'
    },
    {
      name: 'conversations',
      description: 'Konuşma yönetimi işlemleri'
    },
    {
      name: 'visitors',
      description: 'Ziyaretçi yönetimi işlemleri'
    },
    {
      name: 'gemini',
      description: 'Gemini AI modeli entegrasyonu'
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT kimlik doğrulama belirteci'
      },
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-KEY',
        description: 'API anahtarı kimlik doğrulaması'
      }
    },
    schemas: {
      Bot: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Bot ID'
          },
          name: {
            type: 'string',
            description: 'Bot adı'
          },
          description: {
            type: 'string',
            description: 'Bot açıklaması'
          },
          avatar: {
            type: 'string',
            description: 'Bot avatar URL'
          },
          user: {
            type: 'string',
            description: 'Bot sahibi kullanıcı ID'
          },
          model: {
            type: 'string',
            description: 'Kullanılan AI modeli',
            enum: ['gemini-2.0-flash'],
            default: 'gemini-2.0-flash'
          },
          modelConfig: {
            type: 'object',
            description: 'Gemini model konfigürasyonu',
            properties: {
              temperature: {
                type: 'number',
                description: 'Yanıt çeşitliliği (0.0 - 1.0)',
                format: 'float',
                minimum: 0,
                maximum: 1
              },
              topK: {
                type: 'integer',
                description: 'Seçilecek en olası token sayısı',
                minimum: 1
              },
              topP: {
                type: 'number',
                description: 'Nucleus sampling eşiği',
                format: 'float',
                minimum: 0,
                maximum: 1
              },
              maxOutputTokens: {
                type: 'integer',
                description: 'Maksimum yanıt token sayısı',
                minimum: 1
              }
            }
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Oluşturulma tarihi'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Güncellenme tarihi'
          }
        }
      },
      Conversation: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Konuşma ID'
          },
          bot: {
            type: 'string',
            description: 'Bot ID'
          },
          visitor: {
            type: 'string',
            description: 'Ziyaretçi ID'
          },
          messages: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                role: {
                  type: 'string',
                  enum: ['user', 'bot', 'system'],
                  description: 'Mesaj gönderen rolü'
                },
                content: {
                  type: 'string',
                  description: 'Mesaj içeriği'
                },
                media: {
                  type: 'array',
                  description: 'Medya içerikleri (Gemini Vision için)',
                  items: {
                    type: 'object',
                    properties: {
                      type: {
                        type: 'string',
                        enum: ['image', 'video'],
                        description: 'Medya türü'
                      },
                      url: {
                        type: 'string',
                        description: 'Medya URL'
                      },
                      mimeType: {
                        type: 'string',
                        description: 'MIME türü'
                      }
                    }
                  }
                },
                timestamp: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Mesaj zamanı'
                }
              }
            }
          },
          geminiContext: {
            type: 'array',
            description: 'Gemini için bağlam bilgileri',
            items: {
              type: 'string'
            }
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Başlangıç tarihi'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Son güncelleme tarihi'
          }
        }
      },
      Visitor: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Ziyaretçi ID'
          },
          ipAddress: {
            type: 'string',
            description: 'IP adresi'
          },
          userAgent: {
            type: 'string',
            description: 'Kullanıcı tarayıcı bilgisi'
          },
          referrer: {
            type: 'string',
            description: 'Referans URL'
          },
          firstVisit: {
            type: 'string',
            format: 'date-time',
            description: 'İlk ziyaret tarihi'
          },
          lastVisit: {
            type: 'string',
            format: 'date-time',
            description: 'Son ziyaret tarihi'
          },
          visitCount: {
            type: 'integer',
            description: 'Toplam ziyaret sayısı'
          },
          conversationCount: {
            type: 'integer',
            description: 'Toplam konuşma sayısı'
          }
        }
      },
      GeminiCompletionRequest: {
        type: 'object',
        required: ['prompt'],
        properties: {
          prompt: {
            type: 'string',
            description: 'Tamamlanacak metin istemi'
          },
          model: {
            type: 'string',
            description: 'Kullanılacak Gemini modeli',
            enum: ['gemini-2.0-flash'],
            default: 'gemini-2.0-flash'
          },
          temperature: {
            type: 'number',
            format: 'float',
            minimum: 0,
            maximum: 1,
            description: 'Üretilen cevapların çeşitliliği (0.0 - 1.0)',
            default: 0.7
          },
          maxOutputTokens: {
            type: 'integer',
            minimum: 1,
            description: 'Maksimum üretilecek token sayısı',
            default: 1024
          },
          topK: {
            type: 'integer',
            minimum: 1,
            description: 'En olası K token arasından seçim yapma',
            default: 40
          },
          topP: {
            type: 'number',
            format: 'float',
            minimum: 0,
            maximum: 1,
            description: 'Nucleus sampling için olasılık eşiği',
            default: 0.95
          },
          safetySettings: {
            type: 'array',
            description: 'Güvenlik ayarları',
            items: {
              type: 'object',
              properties: {
                category: {
                  type: 'string',
                  enum: ['HARM_CATEGORY_HARASSMENT', 'HARM_CATEGORY_HATE_SPEECH', 'HARM_CATEGORY_SEXUALLY_EXPLICIT', 'HARM_CATEGORY_DANGEROUS_CONTENT'],
                  description: 'Güvenlik kategorisi'
                },
                threshold: {
                  type: 'string',
                  enum: ['BLOCK_NONE', 'BLOCK_LOW_AND_ABOVE', 'BLOCK_MED_AND_ABOVE', 'BLOCK_HIGH_AND_ABOVE', 'BLOCK_ALL'],
                  description: 'Engelleme eşiği'
                }
              }
            }
          },
          media: {
            type: 'array',
            description: 'Vision modeli için görsel içerikler',
            items: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['image'],
                  description: 'Medya türü'
                },
                data: {
                  type: 'string',
                  format: 'byte',
                  description: 'Base64 kodlanmış görsel verisi'
                },
                mimeType: {
                  type: 'string',
                  description: 'MIME türü (image/jpeg, image/png, vb.)'
                }
              }
            }
          }
        }
      },
      GeminiCompletionResponse: {
        type: 'object',
        properties: {
          text: {
            type: 'string',
            description: 'Gemini tarafından üretilen yanıt metni'
          },
          finishReason: {
            type: 'string',
            enum: ['STOP', 'MAX_TOKENS', 'SAFETY', 'RECITATION', 'OTHER'],
            description: 'Üretme işleminin sonlanma nedeni'
          },
          safetyRatings: {
            type: 'array',
            description: 'Güvenlik değerlendirmeleri',
            items: {
              type: 'object',
              properties: {
                category: {
                  type: 'string',
                  description: 'Güvenlik kategorisi'
                },
                probability: {
                  type: 'string',
                  enum: ['NEGLIGIBLE', 'LOW', 'MEDIUM', 'HIGH'],
                  description: 'Zararlı içerik olasılığı'
                }
              }
            }
          },
          usage: {
            type: 'object',
            properties: {
              promptTokens: {
                type: 'integer',
                description: 'İstek metninde kullanılan token sayısı'
              },
              completionTokens: {
                type: 'integer',
                description: 'Yanıt metninde kullanılan token sayısı'
              },
              totalTokens: {
                type: 'integer',
                description: 'Toplam token sayısı'
              }
            }
          }
        }
      },
      Error: {
        type: 'object',
        properties: {
          code: {
            type: 'integer',
            description: 'Hata kodu'
          },
          message: {
            type: 'string',
            description: 'Hata mesajı'
          }
        }
      }
    }
  },
  paths: {
    '/bots': {
      get: {
        summary: 'Tüm botları listele',
        tags: ['bots'],
        security: [
          { BearerAuth: [] }
        ],
        responses: {
          '200': {
            description: 'Başarılı',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Bot'
                  }
                }
              }
            }
          },
          '401': {
            description: 'Yetkilendirme hatası',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      },
      post: {
        summary: 'Yeni bot oluştur',
        tags: ['bots'],
        security: [
          { BearerAuth: [] }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'model'],
                properties: {
                  name: {
                    type: 'string',
                    description: 'Bot adı'
                  },
                  description: {
                    type: 'string',
                    description: 'Bot açıklaması'
                  },
                  avatar: {
                    type: 'string',
                    description: 'Bot avatar URL'
                  },
                  model: {
                    type: 'string',
                    enum: ['gemini-2.0-flash'],
                    description: 'Kullanılacak Gemini modeli',
                    default: 'gemini-2.0-flash'
                  },
                  modelConfig: {
                    type: 'object',
                    description: 'Gemini model konfigürasyonu',
                    properties: {
                      temperature: {
                        type: 'number',
                        description: 'Yanıt çeşitliliği (0.0 - 1.0)'
                      },
                      topK: {
                        type: 'integer',
                        description: 'Seçilecek en olası token sayısı'
                      },
                      topP: {
                        type: 'number',
                        description: 'Nucleus sampling eşiği'
                      },
                      maxOutputTokens: {
                        type: 'integer',
                        description: 'Maksimum yanıt token sayısı'
                      }
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Bot oluşturuldu',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Bot'
                }
              }
            }
          },
          '400': {
            description: 'Geçersiz istek',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '401': {
            description: 'Yetkilendirme hatası',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/bots/{id}': {
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Bot ID',
          schema: {
            type: 'string'
          }
        }
      ],
      get: {
        summary: 'Bot detaylarını getir',
        tags: ['bots'],
        security: [
          { BearerAuth: [] }
        ],
        responses: {
          '200': {
            description: 'Başarılı',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Bot'
                }
              }
            }
          },
          '404': {
            description: 'Bot bulunamadı',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '401': {
            description: 'Yetkilendirme hatası',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      },
      put: {
        summary: 'Bot bilgilerini güncelle',
        tags: ['bots'],
        security: [
          { BearerAuth: [] }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    description: 'Bot adı'
                  },
                  description: {
                    type: 'string',
                    description: 'Bot açıklaması'
                  },
                  avatar: {
                    type: 'string',
                    description: 'Bot avatar URL'
                  },
                  model: {
                    type: 'string',
                    enum: ['gemini-2.0-flash'],
                    description: 'Kullanılacak Gemini modeli'
                  },
                  modelConfig: {
                    type: 'object',
                    description: 'Gemini model konfigürasyonu',
                    properties: {
                      temperature: {
                        type: 'number',
                        description: 'Yanıt çeşitliliği (0.0 - 1.0)'
                      },
                      topK: {
                        type: 'integer',
                        description: 'Seçilecek en olası token sayısı'
                      },
                      topP: {
                        type: 'number',
                        description: 'Nucleus sampling eşiği'
                      },
                      maxOutputTokens: {
                        type: 'integer',
                        description: 'Maksimum yanıt token sayısı'
                      }
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Bot güncellendi',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Bot'
                }
              }
            }
          },
          '400': {
            description: 'Geçersiz istek',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '404': {
            description: 'Bot bulunamadı',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '401': {
            description: 'Yetkilendirme hatası',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      },
      delete: {
        summary: 'Bot sil',
        tags: ['bots'],
        security: [
          { BearerAuth: [] }
        ],
        responses: {
          '200': {
            description: 'Bot silindi',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true
                    },
                    message: {
                      type: 'string',
                      example: 'Bot başarıyla silindi'
                    }
                  }
                }
              }
            }
          },
          '404': {
            description: 'Bot bulunamadı',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '401': {
            description: 'Yetkilendirme hatası',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/gemini/completions': {
      post: {
        summary: 'Gemini tamamlama isteği gönder',
        description: 'Gemini API ile metin tamamlama isteği gönderir',
        tags: ['gemini'],
        security: [
          { BearerAuth: [] }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/GeminiCompletionRequest'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Başarılı',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/GeminiCompletionResponse'
                }
              }
            }
          },
          '400': {
            description: 'Geçersiz istek',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '401': {
            description: 'Yetkilendirme hatası',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '429': {
            description: 'İstek limiti aşıldı',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '500': {
            description: 'Gemini API hatası',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/gemini/embeddings': {
      post: {
        summary: 'Gemini gömme isteği gönder',
        description: 'Gemini API ile metin gömme vektörleri oluşturma isteği gönderir',
        tags: ['gemini'],
        security: [
          { BearerAuth: [] }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['text'],
                properties: {
                  text: {
                    type: 'string',
                    description: 'Vektör gömme oluşturulacak metin'
                  },
                  model: {
                    type: 'string',
                    enum: ['text-embedding-001'],
                    description: 'Kullanılacak gömme modeli',
                    default: 'text-embedding-001'
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Başarılı',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    embedding: {
                      type: 'array',
                      description: 'Metin gömme vektörü',
                      items: {
                        type: 'number',
                        format: 'float'
                      }
                    },
                    usage: {
                      type: 'object',
                      properties: {
                        totalTokens: {
                          type: 'integer',
                          description: 'Kullanılan token sayısı'
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Geçersiz istek',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          '401': {
            description: 'Yetkilendirme hatası',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    }
  }
}; 