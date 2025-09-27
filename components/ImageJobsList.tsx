
import React from 'react';
import type { ImageJob } from '../types';
import { ImageJobCard } from './ImageJobCard';
import { Button } from './Button';
import { TrashIcon } from './icons/TrashIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface ImageJobsListProps {
  jobs: ImageJob[];
  onClear: () => void;
  onDownloadAll: () => void;
}

export const ImageJobsList: React.FC<ImageJobsListProps> = ({ jobs, onClear, onDownloadAll }) => {
  if (jobs.length === 0) {
    return (
       <div className="flex-grow flex items-center justify-center text-center text-slate-500">
        <p>Your image queue is empty. <br/> Upload some images to begin.</p>
      </div>
    );
  }
  
  const completedJobsCount = jobs.filter(j => j.status === 'completed').length;

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4 flex-shrink-0 gap-2">
        <h2 className="text-xl font-semibold text-sky-400">
          Image Queue ({jobs.length})
        </h2>
        <div className="flex items-center gap-2">
            {completedJobsCount > 1 && (
                <Button onClick={onDownloadAll} variant="secondary" className="px-3 py-1.5 text-sm">
                    <DownloadIcon className="w-5 h-5 mr-2" />
                    Download All ({completedJobsCount})
                </Button>
            )}
            <Button onClick={onClear} variant="secondary" className="px-3 py-1.5 text-sm">
               <TrashIcon className="w-5 h-5 mr-2" />
               Clear All
            </Button>
        </div>
      </div>
      <div className="flex-grow space-y-4 overflow-y-auto pr-2 -mr-2">
        {[...jobs].reverse().map(job => (
          <ImageJobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
};
