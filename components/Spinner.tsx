import React from 'react';

interface SpinnerProps {
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ className = '' }) => {
  return (
    <div
      className={`w-5 h-5 border-2 border-dashed rounded-full animate-spin border-sky-400 ${className}`}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};
