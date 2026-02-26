import { z } from 'zod';
import { insertCompanySchema, insertListSchema, insertListItemSchema, insertNoteSchema, insertSavedSearchSchema, companies, lists, listItems, notes, savedSearches } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  companies: {
    list: {
      method: 'GET' as const,
      path: '/api/companies' as const,
      input: z.object({
        search: z.string().optional(),
        page: z.string().optional(),
        limit: z.string().optional()
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof companies.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/companies/:id' as const,
      responses: {
        200: z.custom<typeof companies.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    enrich: {
      method: 'POST' as const,
      path: '/api/companies/:id/enrich' as const,
      responses: {
        200: z.custom<typeof companies.$inferSelect>(),
        404: errorSchemas.notFound,
        500: errorSchemas.internal,
      }
    }
  },
  lists: {
    list: {
      method: 'GET' as const,
      path: '/api/lists' as const,
      responses: {
        200: z.array(z.custom<typeof lists.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/lists' as const,
      input: insertListSchema,
      responses: {
        201: z.custom<typeof lists.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    getItems: {
      method: 'GET' as const,
      path: '/api/lists/:id/items' as const,
      responses: {
        // returning companies in the list
        200: z.array(z.custom<typeof companies.$inferSelect>()),
      }
    },
    addCompany: {
      method: 'POST' as const,
      path: '/api/lists/:id/companies' as const,
      input: z.object({ companyId: z.number() }),
      responses: {
        201: z.custom<typeof listItems.$inferSelect>(),
      }
    },
    removeCompany: {
      method: 'DELETE' as const,
      path: '/api/lists/:id/companies/:companyId' as const,
      responses: {
        204: z.void(),
      }
    }
  },
  notes: {
    list: {
      method: 'GET' as const,
      path: '/api/companies/:companyId/notes' as const,
      responses: {
        200: z.array(z.custom<typeof notes.$inferSelect>()),
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/companies/:companyId/notes' as const,
      input: z.object({ content: z.string() }),
      responses: {
        201: z.custom<typeof notes.$inferSelect>(),
      }
    }
  },
  savedSearches: {
    list: {
      method: 'GET' as const,
      path: '/api/saved-searches' as const,
      responses: {
        200: z.array(z.custom<typeof savedSearches.$inferSelect>()),
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/saved-searches' as const,
      input: insertSavedSearchSchema,
      responses: {
        201: z.custom<typeof savedSearches.$inferSelect>(),
      }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/saved-searches/:id' as const,
      responses: {
        204: z.void(),
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
