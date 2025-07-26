
import React, { useRef, useState, useCallback } from 'react';
import { useAppContext } from '../../context/AppContext';
import { DialogType, LogLevel, LogSource } from '../../types';
import EditIcon from '../icons/EditIcon';
import DownloadIcon from '../icons/DownloadIcon';
import FileTextIcon from '../icons/FileTextIcon';
import CodeIcon from '../icons/CodeIcon';
import DocumentIcon from '../icons/DocumentIcon';
import UploadIcon from '../icons/UploadIcon';
import PencilIcon from '../icons/PencilIcon';
import NewWorldIcon from '../icons/NewWorldIcon';

const WorldOptions: React.FC = () => {
    const { showDialog, exportWorld, isExportingWorldPdf, importWorld, addLog } = useAppContext();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const dragCounter = useRef(0);

    const handleFile = (file: File) => {
        if (!file.name.toLowerCase().endsWith('.json')) {
            alert('Unsupported file type. Please use a .json file for world import.');
            addLog({ level: LogLevel.WARN, source: LogSource.GENERAL, message: 'User tried to import unsupported file type for world.', details: { name: file.name } });
            return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            importWorld(content);
        };
        reader.readAsText(file);
    };

    const handleImportClick = () => {
        addLog({ level: LogLevel.INFO, source: LogSource.GENERAL, message: 'User clicked "Import World from file".' });
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
        e.target.value = ''; // Reset file input
    };

    const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current++;
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDragging(true);
        }
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current--;
        if (dragCounter.current === 0) setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        dragCounter.current = 0;
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, [handleFile]);

    return (
        <div className="h-full w-full flex flex-col p-4 gap-4">
             <button
                onClick={() => showDialog(DialogType.NEW_WORLD)}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-base font-semibold rounded-md transition-colors text-white bg-green-600 hover:bg-green-700"
            >
                <NewWorldIcon className="w-6 h-6"/>
                Generate New World
            </button>
             
             <div
                className="relative flex-shrink-0"
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
             >
                <div className={`flex flex-col items-center justify-center w-full py-4 border-2 border-dashed rounded-lg text-center transition-colors ${isDragging ? 'border-primary-light bg-indigo-50 dark:border-primary-dark dark:bg-indigo-900/20' : 'border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-800/50'}`}>
                    <UploadIcon className="w-8 h-8 mb-2 text-text-secondary-light dark:text-text-secondary-dark" />
                    <p className="font-semibold text-text-primary-light dark:text-text-primary-dark text-sm">Drop .json file here</p>
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">or</p>
                    <button onClick={handleImportClick} className="text-sm font-semibold text-primary-light dark:text-primary-dark hover:underline">Select File to Import</button>
                </div>
                 <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".json"
                    className="hidden"
                />
             </div>
            
            <div className="flex flex-wrap gap-4">
                 <button
                    onClick={() => showDialog(DialogType.EDIT_WORLD)}
                    className="flex items-center justify-center gap-2 flex-grow basis-0 min-w-[120px] px-4 py-2.5 text-base font-semibold rounded-md transition-colors text-white bg-primary-light dark:bg-indigo-500 hover:bg-primary-light/90 dark:hover:bg-indigo-500/90"
                >
                    <EditIcon className="w-6 h-6"/>
                    Edit
                </button>
                <button
                    onClick={() => showDialog(DialogType.THEME)}
                    className="flex items-center justify-center gap-2 flex-grow basis-0 min-w-[120px] px-4 py-2.5 text-base font-semibold rounded-md transition-colors text-white bg-purple-600 hover:bg-purple-700"
                >
                    <PencilIcon className="w-6 h-6"/>
                    Theme
                </button>
            </div>
            
            <div className="space-y-2 pt-4 border-t border-border-light dark:border-border-dark">
                <h4 className="text-sm font-semibold text-text-secondary-light dark:text-text-secondary-dark">Export to</h4>
                <div className="flex flex-wrap gap-2">
                     <button onClick={() => exportWorld('json')} className="flex items-center justify-center gap-2 p-2 rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-text-primary-light dark:text-text-primary-dark flex-grow basis-0 min-w-[80px]">
                        <DownloadIcon className="w-4 h-4"/> JSON
                    </button>
                    <button onClick={() => exportWorld('md')} className="flex items-center justify-center gap-2 p-2 rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-text-primary-light dark:text-text-primary-dark flex-grow basis-0 min-w-[80px]">
                        <FileTextIcon className="w-4 h-4"/> MD
                    </button>
                     <button onClick={() => exportWorld('html')} className="flex items-center justify-center gap-2 p-2 rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-text-primary-light dark:text-text-primary-dark flex-grow basis-0 min-w-[80px]">
                        <CodeIcon className="w-4 h-4"/> HTML
                    </button>
                     <button onClick={() => exportWorld('pdf')} disabled={isExportingWorldPdf} className="flex items-center justify-center gap-2 p-2 rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 transition-colors text-text-primary-light dark:text-text-primary-dark flex-grow basis-0 min-w-[80px]">
                        {isExportingWorldPdf ? (
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <DocumentIcon className="w-4 h-4"/>
                        )}
                         PDF
                    </button>
                </div>
            </div>
            <div className="flex-grow flex items-end">
                <p className="text-xs text-center w-full text-text-secondary-light dark:text-text-secondary-dark">
                    The world you define here provides the context for all character generation and AI interactions.
                </p>
            </div>
        </div>
    );
};

export default WorldOptions;
