
import React, { useState, useEffect, useCallback } from 'react';
import Dialog from '../ui/Dialog';
import { useAppContext } from '../../context/AppContext';
import { DialogType, WorldTheme } from '../../types';
import SaveIcon from '../icons/SaveIcon';
import CancelIcon from '../icons/CancelIcon';
import EditableTextarea from '../ui/EditableTextarea';

const ThemeDialog: React.FC = () => {
    const { openDialog, showDialog, world, updateWorld } = useAppContext();
    const [theme, setTheme] = useState<WorldTheme | null>(null);

    useEffect(() => {
        if (openDialog === DialogType.THEME && world) {
            setTheme(JSON.parse(JSON.stringify(world.theme)));
        } else {
            setTheme(null);
        }
    }, [openDialog, world]);

    const handleChange = useCallback((field: keyof WorldTheme, value: string) => {
        setTheme(prev => {
            if (!prev) return null;
            return { ...prev, [field]: value };
        });
    }, []);

    const handleSave = () => {
        if (theme) {
            updateWorld({ theme });
        }
        showDialog(null);
    };

    if (!theme) return null;

    return (
        <Dialog
            isOpen={openDialog === DialogType.THEME}
            onClose={() => showDialog(null)}
            title="World Theme for AI Generation"
        >
            <div className="flex flex-col h-full">
                <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark pb-2 border-b border-border-light dark:border-border-dark">
                        Use this section to provide the AI with a consistent theme and set of rules for generating new characters in this world. This information will be included in the instructions given to the AI.
                    </p>
                    <EditableTextarea
                        label="Technology Level"
                        value={theme.technologyLevel}
                        onChange={(value) => handleChange('technologyLevel', value)}
                    />
                    <EditableTextarea
                        label="Generic Background"
                        value={theme.genericBackground}
                        onChange={(value) => handleChange('genericBackground', value)}
                    />
                    <EditableTextarea
                        label="Character Relationships"
                        value={theme.relationships}
                        onChange={(value) => handleChange('relationships', value)}
                    />
                    <EditableTextarea
                        label="Rules (Gender, Species, Sexuality, etc.)"
                        value={theme.rules}
                        onChange={(value) => handleChange('rules', value)}
                    />
                    <EditableTextarea
                        label="Other Specifics"
                        value={theme.specifics}
                        onChange={(value) => handleChange('specifics', value)}
                    />
                </div>
                <footer className="flex justify-end gap-4 pt-4 border-t border-border-light dark:border-border-dark flex-shrink-0">
                    <button onClick={() => showDialog(null)} className="flex items-center gap-2 px-6 py-2 text-sm font-semibold rounded-md transition-colors text-text-primary-light dark:text-text-primary-dark bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500">
                        <CancelIcon className="w-5 h-5" />
                        Cancel
                    </button>
                    <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 text-sm font-semibold rounded-md transition-colors text-white bg-primary-light dark:bg-indigo-500 hover:bg-primary-light/90 dark:hover:bg-indigo-500/90">
                        <SaveIcon className="w-5 h-5" />
                        Save Theme
                    </button>
                </footer>
            </div>
        </Dialog>
    );
};

export default ThemeDialog;
