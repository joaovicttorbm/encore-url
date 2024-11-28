import { api, APIError } from 'encore.dev/api';
import { SQLDatabase } from 'encore.dev/storage/sqldb';
import { randomBytes } from 'node:crypto';
import UrlService from './urlService';

const db = new SQLDatabase('url', { migrations: './migrations' });

// Interface para o formato de resposta
interface UrlResponse {
  id: string;
  url: string;
}

// Interface para os parâmetros de entrada
interface UrlParams {
  url: string;
}

// Endpoint para encurtar URL
export const shorten = api(
  {
    method: 'POST',
    path: '/url',
    expose: true,
  },
  async ({ url }: UrlParams): Promise<UrlResponse> => {
    UrlService.validateUrl(url);

    if (await UrlService.isDuplicateUrl(url)) {
      throw APIError.alreadyExists('URL already shortened');
    }

    const id = UrlService.generateId();
    try {
      await db.exec`INSERT INTO url (id, original_url) VALUES (${id}, ${url})`;
    } catch (error) {
      throw APIError.internal('Failed to save URL');
    }

    return { id, url };
  }
);

// Endpoint para recuperar a URL original
export const getShortenedUrl = api(
  {
    method: 'GET',
    path: '/url/:id',
    expose: true,
  },
  async ({ id }: { id: string }): Promise<UrlResponse> => {
    if (!id) {
      throw APIError.unavailable('ID is required');
    }

    const row = await db.queryRow`
      SELECT original_url FROM url WHERE id = ${id}
    `;

    if (!row) {
      throw APIError.notFound('URL not found');
    }

    return { id, url: row.original_url };
  }
);