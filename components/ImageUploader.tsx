
import React, { useState, useCallback } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface ImageUploaderProps {
  onImagesSelect: (files: File[]) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImagesSelect }) => {
  const [dragging, setDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const imageFiles = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));
      if (imageFiles.length > 0) {
        onImagesSelect(imageFiles);
      } else if (e.target.files.length > 0) {
        alert('Please select valid image files.');
      }
      // Reset the input value to allow selecting the same file(s) again
      e.target.value = '';
    }
  };

  const handleDragEvent = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    handleDragEvent(e);
    setDragging(true);
  }, [handleDragEvent]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    handleDragEvent(e);
    setDragging(false);
  }, [handleDragEvent]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    handleDragEvent(e);
    setDragging(false);
    if (e.dataTransfer.files) {
       const imageFiles = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
       if (imageFiles.length > 0) {
        onImagesSelect(imageFiles);
      } else if (e.dataTransfer.files.length > 0) {
        alert('Please drag and drop valid image files.');
      }
    }
  }, [handleDragEvent, onImagesSelect]);

  const uploaderClasses = `flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300 ${dragging ? 'border-sky-400 bg-sky-900/50' : 'border-slate-600 bg-slate-800 hover:bg-slate-700'}`;

  return (
    <div>
      <label
        htmlFor="dropzone-file"
        className={uploaderClasses}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragEvent}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-400">
          <UploadIcon className="w-10 h-10 mb-3" />
          <p className="mb-2 text-sm"><span className="font-semibold">Click to upload</span> or drag and drop</p>
          <p className="text-xs">PNG, JPG, WEBP, etc.</p>
        </div>
        <input id="dropzone-file" type="file" className="hidden" accept="image/*" onChange={handleFileChange} multiple />
      </label>
    </div>
  );
};
