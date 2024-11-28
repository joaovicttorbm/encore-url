import { APIError } from 'encore.dev/api';
import { SQLDatabase } from 'encore.dev/storage/sqldb';
import { randomBytes } from 'node:crypto';

const db = new SQLDatabase('url', { migrations: './migrations' });

export default class UrlService {
    static validateUrl(url: string): void {
      if (!url || !this.isValidUrl(url)) {
        throw APIError.invalidArgument('Invalid URL format');
      }
    }
  
    static isValidUrl(url: string): boolean {
      try {
        new URL(url); // Verifica se a URL é válida usando a classe URL nativa
        return true;
      } catch {
        return false;
      }
    }
  
    static async isDuplicateUrl(url: string): Promise<boolean> {
      const result = await db.queryRow`
        SELECT 1 FROM url WHERE original_url = ${url}
      `;
      return Boolean(result);
    }
  
    static generateId(): string {
      return randomBytes(6).toString('base64url');
    }
  }
  