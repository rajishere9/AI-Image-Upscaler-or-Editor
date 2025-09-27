import React from 'react';
import { Button } from './Button';
import { SparklesIcon } from './icons/SparklesIcon';
import { Spinner } from './Spinner';

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  disabled?: boolean;
}

export const PromptInput: React.FC<PromptInputProps> = ({ prompt, setPrompt, onGenerate, isGenerating, disabled }) => {
  return (
    <div className="flex flex-col space-y-4">
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="e.g., Upscale to 4k, enhance details..."
        className="w-full h-28 p-3 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors placeholder-slate-500"
        disabled={disabled}
      />
      <Button 
        onClick={onGenerate}
        disabled={isGenerating || disabled}
        variant="secondary"
      >
        {isGenerating ? <Spinner className="w-5 h-5 mr-2" /> : <SparklesIcon className="w-5 h-5 mr-2" />}
        {isGenerating ? 'Generating...' : 'Generate Creative Prompt'}
      </Button>
    </div>
  );
};