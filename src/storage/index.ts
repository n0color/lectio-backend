// src/storage/index.ts
import { LocalStorageService } from './localStorage-service';
export const storageService = new LocalStorageService();
import type { IStorageService } from './storage-interface';