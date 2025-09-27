
export interface ImageData {
  data: string; // base64 encoded string
  mimeType: string;
}

export interface ImageJob {
  id: string;
  file: File;
  originalUrl: string;
  upscaledUrl: string | null;
  status: 'queued' | 'processing' | 'completed' | 'error';
  error?: string;
}
