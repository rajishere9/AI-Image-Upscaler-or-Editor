

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { PromptInput } from './components/PromptInput';
import { ImageJobsList } from './components/ImageJobsList';
import { Button } from './components/Button';
import type { ImageJob } from './types';
import { fileToGenerativePart, downloadJobsAsZip } from './utils/fileUtils';
import { upscaleImage, generateCreativePrompt } from './services/geminiService';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { Spinner } from './components/Spinner';

const App: React.FC = () => {
  const [imageJobs, setImageJobs] = useState<ImageJob[]>([]);
  const [prompt, setPrompt] = useState<string>('Upscale this image to 4k resolution, enhancing details, improving sharpness, and enriching colors for a photorealistic quality.');
  const [isUpscaling, setIsUpscaling] = useState<boolean>(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [jobsToProcessCount, setJobsToProcessCount] = useState(0);

  const handleAddImages = (files: File[]) => {
    const newJobs: ImageJob[] = files.map(file => ({
      id: crypto.randomUUID(),
      file,
      originalUrl: URL.createObjectURL(file),
      upscaledUrl: null,
      status: 'queued',
    }));
    setImageJobs(prevJobs => [...prevJobs, ...newJobs]);
    setError(null);
  };

  const handleClearJobs = () => {
    imageJobs.forEach(job => URL.revokeObjectURL(job.originalUrl));
    setImageJobs([]);
  }

  const imageJobsRef = useRef(imageJobs);
  imageJobsRef.current = imageJobs;

  useEffect(() => {
    return () => {
      if (imageJobsRef.current) {
        imageJobsRef.current.forEach(job => URL.revokeObjectURL(job.originalUrl));
      }
    };
  }, []);


  const handleGeneratePrompt = useCallback(async () => {
    const firstImage = imageJobs.find(job => job.status === 'queued')?.file;
    if (!firstImage) {
      setError('Please upload an image first to generate a prompt.');
      return;
    }
    setIsGeneratingPrompt(true);
    setError(null);
    try {
      const imageData = await fileToGenerativePart(firstImage);
      const newPrompt = await generateCreativePrompt(imageData);
      setPrompt(newPrompt);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred while generating the prompt.');
    } finally {
      setIsGeneratingPrompt(false);
    }
  }, [imageJobs]);

  const handleUpscale = async () => {
    const jobsToProcess = imageJobs.filter(job => job.status === 'queued');
    if (jobsToProcess.length === 0) {
      setError('No images in the queue to upscale.');
      return;
    }
    
    setJobsToProcessCount(jobsToProcess.length);
    setIsUpscaling(true);
    setError(null);

    for (const job of jobsToProcess) {
      setImageJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'processing' } : j));
      try {
        const imageData = await fileToGenerativePart(job.file);
        const { imageUrl } = await upscaleImage(imageData, prompt);
        setImageJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'completed', upscaledUrl: imageUrl } : j));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setImageJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'error', error: errorMessage } : j));
      }
    }

    setIsUpscaling(false);
  };

  const handleDownloadAll = async () => {
    try {
      await downloadJobsAsZip(imageJobs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create ZIP file.');
    }
  };
  
  const queuedJobsCount = imageJobs.filter(j => j.status === 'queued').length;

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Header />
        <main className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col space-y-6 bg-slate-800/50 p-6 rounded-2xl border border-slate-700 self-start">
            <h2 className="text-xl font-semibold text-sky-400">1. Upload Images</h2>
            <ImageUploader onImagesSelect={handleAddImages} />
            
            {imageJobs.length > 0 && (
              <>
                <h2 className="text-xl font-semibold text-sky-400 pt-4">2. Set a Prompt for the Batch</h2>
                <PromptInput 
                  prompt={prompt} 
                  setPrompt={setPrompt} 
                  onGenerate={handleGeneratePrompt}
                  isGenerating={isGeneratingPrompt}
                  disabled={isUpscaling}
                />
                
                <h2 className="text-xl font-semibold text-sky-400 pt-4">3. Upscale!</h2>
                <Button 
                  onClick={handleUpscale} 
                  disabled={isUpscaling || queuedJobsCount === 0}
                  className="w-full"
                >
                  {isUpscaling ? <Spinner className="w-5 h-5 mr-2" /> : <SparklesIcon className="w-5 h-5 mr-2" />}
                  {isUpscaling ? `Upscaling ${imageJobs.filter(j => j.status === 'processing').length} of ${jobsToProcessCount}...` : `Upscale ${queuedJobsCount} Image(s)`}
                </Button>
              </>
            )}
          </div>

          <div className="flex flex-col bg-slate-800/50 p-6 rounded-2xl border border-slate-700 min-h-[400px] lg:min-h-0 lg:max-h-[calc(100vh-12rem)]">
            {error && <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg mb-4">{error}</div>}
             <ImageJobsList jobs={imageJobs} onClear={handleClearJobs} onDownloadAll={handleDownloadAll} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;