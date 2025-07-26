
import React, { useState, useRef, useEffect } from 'react';
import GenerateIcon from '../icons/GenerateIcon';

interface ImagenPromptProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

const ImagenPrompt: React.FC<ImagenPromptProps> = ({ onSendMessage, isLoading, disabled = false }) => {
  const [prompt, setPrompt] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [prompt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading && !disabled) {
      onSendMessage(prompt.trim());
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as any);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center">
      <textarea
        ref={textareaRef}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={disabled ? "API Key not configured" : "e.g., A female elf with a flat chest at the beach."}
        rows={1}
        className="w-full resize-none p-4 pr-20 text-md bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark transition-all text-text-primary-light dark:text-text-primary-dark"
        disabled={isLoading || disabled}
        style={{maxHeight: '200px'}}
      />
      <button
        type="submit"
        disabled={!prompt.trim() || isLoading || disabled}
        className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-white bg-primary-light dark:bg-indigo-500 hover:bg-primary-light/90 dark:hover:bg-indigo-500/90 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
        aria-label="Generate image"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="hidden sm:inline">Generating</span>
          </>
        ) : (
          <>
            <GenerateIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Generate</span>
          </>
        )}
      </button>
    </form>
  );
};

export default ImagenPrompt;
