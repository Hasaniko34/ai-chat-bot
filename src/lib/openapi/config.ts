import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ChatBot Forge API',
      version: '1.0.0',
      description: 'AI Chatbot Platformu için API Dokümantasyonu',
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
        description: 'API v1'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key'
        }
      },
      schemas: {
        Bot: {
          type: 'object',
          required: ['name', 'description', 'websiteUrl', 'prompt'],
          properties: {
            _id: {
              type: 'string',
              description: 'Bot benzersiz kimliği'
            },
            name: {
              type: 'string',
              description: 'Bot adı'
            },
            description: {
              type: 'string',
              description: 'Bot açıklaması'
            },
            status: {
              type: 'string',
              enum: ['online', 'offline', 'maintenance'],
              description: 'Bot durumu'
            },
            websiteUrl: {
              type: 'string',
              description: 'Bot entegre edilecek web sitesi URL'
            },
            prompt: {
              type: 'string',
              description: 'Bot sistem talimatları'
            },
            primaryColor: {
              type: 'string',
              description: 'Bot birincil rengi (hex)'
            },
            secondaryColor: {
              type: 'string',
              description: 'Bot ikincil rengi (hex)'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Oluşturma tarihi'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Güncelleme tarihi'
            }
          }
        },
        Conversation: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Konuşma benzersiz kimliği'
            },
            botId: {
              type: 'string',
              description: 'Bot kimliği'
            },
            userId: {
              type: 'string',
              description: 'Kullanıcı kimliği'
            },
            messages: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  role: {
                    type: 'string',
                    enum: ['user', 'assistant', 'system']
                  },
                  content: {
                    type: 'string'
                  },
                  timestamp: {
                    type: 'string',
                    format: 'date-time'
                  }
                }
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                message: {
                  type: 'string'
                },
                code: {
                  type: 'string'
                },
                details: {
                  type: 'object'
                }
              }
            }
          }
        }
      }
    }
  },
  apis: ['./src/app/api/v1/**/*.ts'], // API rotalarının yolları
};

// OpenAPI şemasını oluştur
const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec; 