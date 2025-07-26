

import React, { useState, useRef, useEffect } from 'react';
import SendIcon from '../icons/SendIcon';
import DiceIcon from '../icons/DiceIcon';
import { useAppContext } from '../../context/AppContext';
import { DialogType } from '../../types';

interface PromptInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({ onSendMessage, isLoading, disabled = false }) => {
  const [prompt, setPrompt] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { showDialog } = useAppContext();

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      // A minimum height can be enforced via `rows` or min-height.
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${scrollHeight}px`;
    }
  }, [prompt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !disabled) {
      onSendMessage(prompt.trim());
      setPrompt('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as any);
    }
  };
  
  const getPlaceholder = () => {
    if(disabled) return "API Key not configured in Settings.";
    return "Ask the AI team to create or modify a character...";
  }

  return (
    <div className="bg-surface-light dark:bg-surface-dark p-4 border-t border-border-light dark:border-border-dark">
        <form onSubmit={handleSubmit} className="flex items-start gap-2">
            <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={getPlaceholder()}
                rows={2}
                className="w-full resize-none p-3 text-md bg-slate-100 dark:bg-slate-900/50 border border-border-light dark:border-border-dark rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark transition-all text-text-primary-light dark:text-text-primary-dark"
                disabled={disabled}
                style={{ maxHeight: '200px' }}
            />
             <button
                type="button"
                onClick={() => showDialog(DialogType.RANDOM_EVENT)}
                disabled={disabled}
                className="flex-shrink-0 p-3 rounded-xl transition-colors text-white bg-slate-500 hover:bg-slate-600 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
                aria-label="Trigger random event"
                title="Trigger random event"
            >
                <DiceIcon className="w-6 h-6" />
            </button>
            <button
                type="submit"
                disabled={!prompt.trim() || disabled}
                className="flex-shrink-0 p-3 rounded-xl transition-colors text-white bg-primary-light dark:bg-indigo-500 hover:bg-primary-light/90 dark:hover:bg-indigo-500/90 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
                aria-label="Send message"
            >
                {isLoading ? (
                <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                ) : (
                <SendIcon className="w-6 h-6" />
                )}
            </button>
        </form>
    </div>
  );
};

export default PromptInput;
