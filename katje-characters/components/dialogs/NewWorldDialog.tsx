
import React, { useState } from 'react';
import Dialog from '../ui/Dialog';
import { useAppContext } from '../../context/AppContext';
import { DialogType } from '../../types';
import GenerateIcon from '../icons/GenerateIcon';
import CancelIcon from '../icons/CancelIcon';

const NewWorldDialog: React.FC = () => {
    const { openDialog, showDialog, generateNewWorld } = useAppContext();
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Please provide a description for the world you want to create.');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            await generateNewWorld(prompt);
            setPrompt('');
            showDialog(null);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred during world generation.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (isLoading) return;
        setPrompt('');
        setError(null);
        showDialog(null);
    };

    return (
        <Dialog
            isOpen={openDialog === DialogType.NEW_WORLD}
            onClose={handleClose}
            title="Generate a New World"
        >
            <div className="flex flex-col h-full gap-4 text-text-primary-light dark:text-text-primary-dark">
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                    Describe the world you want the AI to create. Be as detailed as you like. The current world will be replaced with the newly generated one.
                </p>
                <div className="flex-grow">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., A high-fantasy world with floating islands, magical creatures, and two warring factions..."
                        className="w-full h-full p-3 bg-slate-100 dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark resize-none"
                        autoFocus
                    />
                </div>
                {error && (
                    <div className="bg-red-500/10 text-red-700 dark:text-red-400 p-3 rounded-md text-sm border border-red-500/20">
                        <strong>Error:</strong> {error}
                    </div>
                )}
                <footer className="flex justify-end gap-4 pt-4 border-t border-border-light dark:border-border-dark flex-shrink-0">
                    <button onClick={handleClose} disabled={isLoading} className="flex items-center gap-2 px-6 py-2 text-sm font-semibold rounded-md transition-colors text-text-primary-light dark:text-text-primary-dark bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 disabled:opacity-50">
                        <CancelIcon className="w-5 h-5" />
                        Cancel
                    </button>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !prompt.trim()}
                        className="flex items-center justify-center gap-2 w-48 px-6 py-2 text-md font-semibold rounded-md transition-colors text-white bg-green-600 hover:bg-green-700 disabled:bg-slate-400 dark:disabled:bg-slate-600"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Generating...</span>
                            </>
                        ) : (
                            <>
                                <GenerateIcon className="w-5 h-5" />
                                <span>Generate World</span>
                            </>
                        )}
                    </button>
                </footer>
            </div>
        </Dialog>
    );
};

export default NewWorldDialog;
