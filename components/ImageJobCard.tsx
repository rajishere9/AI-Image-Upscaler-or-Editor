
import React from 'react';
import type { ImageJob } from '../types';
import { Spinner } from './Spinner';
import { ZoomableImage } from './ZoomableImage';
import { DownloadIcon } from './icons/DownloadIcon';
import { Button } from './Button';

interface ImageJobCardProps {
  job: ImageJob;
}

const StatusIndicator: React.FC<{ status: ImageJob['status'] }> = ({ status }) => {
  const statusConfig = {
    queued: { text: 'Queued', color: 'bg-slate-500' },
    processing: { text: 'Processing...', color: 'bg-sky-500 animate-pulse' },
    completed: { text: 'Completed', color: 'bg-green-500' },
    error: { text: 'Error', color: 'bg-red-500' },
  };
  const config = statusConfig[status];
  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <span className={`w-2.5 h-2.5 rounded-full ${config.color}`}></span>
      <span className="text-sm font-medium text-slate-300">{config.text}</span>
    </div>
  );
};


export const ImageJobCard: React.FC<ImageJobCardProps> = ({ job }) => {
  return (
    <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-700 space-y-3">
      <div className="flex justify-between items-center gap-4">
        <p className="text-sm text-slate-400 truncate" title={job.file.name}>
          {job.file.name}
        </p>
        <StatusIndicator status={job.status} />
      </div>

      {job.status === 'processing' && (
        <div className="flex flex-col items-center justify-center h-48 bg-slate-800 rounded-lg">
          <Spinner />
          <p className="mt-2 text-slate-400">Upscaling...</p>
        </div>
      )}

      {job.status === 'error' && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-lg">
          <p className="font-semibold">An error occurred:</p>
          <p className="text-sm mt-1">{job.error}</p>
        </div>
      )}

      {job.status === 'completed' && job.upscaledUrl && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-center text-slate-400 mb-2">Original</h4>
            <div className="aspect-square bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
               <ZoomableImage src={job.originalUrl} alt="Original" />
            </div>
          </div>
          <div>
            <h4 className="text-center text-slate-400 mb-2">Upscaled</h4>
            <div className="aspect-square bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
                <ZoomableImage src={job.upscaledUrl} alt="Upscaled" />
            </div>
             <a href={job.upscaledUrl} download={`upscaled-${job.file.name}`} className="w-full block" aria-label={`Download upscaled version of ${job.file.name}`}>
                <Button variant="secondary" className="mt-2 w-full">
                    <DownloadIcon className="w-5 h-5 mr-2" />
                    Download
                </Button>
            </a>
          </div>
        </div>
      )}

      {(job.status === 'queued') && (
        <div className="flex items-center justify-center h-48 bg-slate-800 rounded-lg p-2">
          <img src={job.originalUrl} alt="Preview" className="max-h-full max-w-full object-contain rounded-md" />
        </div>
      )}
    </div>
  );
};
