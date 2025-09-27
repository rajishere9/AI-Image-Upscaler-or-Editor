import JSZip from 'jszip';
import type { ImageData, ImageJob } from './types';

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // remove the data url prefix
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const fileToGenerativePart = async (file: File): Promise<ImageData> => {
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are supported.');
  }

  const base64Data = await fileToBase64(file);
  return {
    data: base64Data,
    mimeType: file.type,
  };
};

export const downloadJobsAsZip = async (jobs: ImageJob[]): Promise<void> => {
  const zip = new JSZip();
  const completedJobs = jobs.filter(job => job.status === 'completed' && job.upscaledUrl);

  if (completedJobs.length === 0) {
    console.warn("No completed jobs with images to download.");
    return;
  }

  await Promise.all(completedJobs.map(async (job) => {
    if (job.upscaledUrl) {
      try {
        const response = await fetch(job.upscaledUrl);
        const blob = await response.blob();
        zip.file(`upscaled-${job.file.name}`, blob);
      } catch (error) {
        console.error(`Failed to fetch and add image ${job.file.name} to zip:`, error);
      }
    }
  }));

  if (Object.keys(zip.files).length > 0) {
    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = 'upscaled-images.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }
};
