
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="text-center">
      <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-sky-400 to-indigo-500 text-transparent bg-clip-text">
        AI Image Upscaler
      </h1>
      <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
        Breathe new life into your images. Enhance details and increase resolution with the power of Gemini.
      </p>
    </header>
  );
};
