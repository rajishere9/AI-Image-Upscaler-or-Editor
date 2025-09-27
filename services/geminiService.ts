
import { GoogleGenAI, Modality } from '@google/genai';
import type { ImageData } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const upscaleImage = async (image: ImageData, prompt: string): Promise<{ imageUrl: string; text: string }> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [
          { inlineData: image },
          { text: prompt },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    let imageUrl: string | null = null;
    let text: string = '';

    const candidate = response.candidates?.[0];
    if (!candidate || !candidate.content || !candidate.content.parts) {
      throw new Error('Invalid response structure from the API.');
    }

    for (const part of candidate.content.parts) {
      if (part.text) {
        text = part.text;
      } else if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        const mimeType = part.inlineData.mimeType;
        imageUrl = `data:${mimeType};base64,${base64ImageBytes}`;
      }
    }

    if (!imageUrl) {
      throw new Error('No image was generated in the response. The model may have refused the request.');
    }

    return { imageUrl, text };
  } catch (error) {
    console.error('Error in upscaleImage:', error);
    if (error instanceof Error) {
        throw new Error(`Failed to upscale image: ${error.message}`);
    }
    throw new Error('An unknown error occurred during image upscaling.');
  }
};

export const generateCreativePrompt = async (image: ImageData): Promise<string> => {
  try {
    const modelPrompt = `Analyze this image and generate a concise, detailed, and artistic prompt for an AI image upscaler. The prompt should aim to enhance the image to a photorealistic 4k resolution. Focus on key subjects, lighting, colors, style, and atmosphere. For example: "Upscale to 4k photorealistic quality, focusing on the intricate details of the golden retriever's fur, the warm sunset lighting, and the deep green of the grass."`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
          parts: [
              {text: modelPrompt},
              {inlineData: image}
          ]
      }
    });

    const text = response.text.trim();
    if (!text) {
      throw new Error('The model returned an empty prompt.');
    }
    return text;
  } catch (error) {
    console.error('Error in generateCreativePrompt:', error);
     if (error instanceof Error) {
        throw new Error(`Failed to generate prompt: ${error.message}`);
    }
    throw new Error('An unknown error occurred during prompt generation.');
  }
};
