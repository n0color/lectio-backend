// src/storage/local-storage.service.ts
import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import type { IStorageService } from './storage-interface';

export class LocalStorageService implements IStorageService {
  private readonly baseDir = 'uploads/covers';
  private readonly staticBaseUrl = '/static/covers';

  constructor() {
    this.ensureDirectoryExists();
  }

  private async ensureDirectoryExists(): Promise<void> {
    await fs.mkdir(this.baseDir, { recursive: true });
  }

  async saveFile(buffer: Buffer, originalName: string, mimeType: string): Promise<string> {
    const ext = path.extname(originalName) || '.jpg';
    const filename = `${randomUUID()}${ext}`;
    const filePath = path.join(this.baseDir, filename);
    await fs.writeFile(filePath, buffer);
    return `${this.staticBaseUrl}/${filename}`;
  }

  async deleteFile(url: string): Promise<void> {
    const filename = path.basename(url);
    const filePath = path.join(this.baseDir, filename);
    try {
      await fs.unlink(filePath);
    } catch (err) {
      console.warn(`Failed to delete cover file: ${filePath}`, err);
    }
  }
}