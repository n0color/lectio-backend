export interface IStorageService {
  saveFile(buffer: Buffer, originalName: string, mimeType: string): Promise<string>; // возвращает public URL
  deleteFile(url: string): Promise<void>;
}