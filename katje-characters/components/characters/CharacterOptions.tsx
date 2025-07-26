
import React, { useRef, useState, useCallback } from 'react';
import { useAppContext } from '../../context/AppContext';
import UserPlusIcon from '../icons/UserPlusIcon';
import EditIcon from '../icons/EditIcon';
import DownloadIcon from '../icons/DownloadIcon';
import { DialogType, LogLevel, LogSource } from '../../types';
import FileTextIcon from '../icons/FileTextIcon';
import CodeIcon from '../icons/CodeIcon';
import DocumentIcon from '../icons/DocumentIcon';
import MagicWandIcon from '../icons/MagicWandIcon';
import UploadIcon from '../icons/UploadIcon';

const CharacterOptions: React.FC = () => {
    const {
        selectedCharacterId,
        characters,
        importCharacter,
        importCharacterFromMarkdown,
        exportCharacter,
        showDialog,
        isExportingPdf,
        fixCharacterDetails,
        addLog,
    } = useAppContext();
    const character = selectedCharacterId ? characters[selectedCharacterId] : null;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const dragCounter = useRef(0);

    const handleFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            if (file.name.toLowerCase().endsWith('.md')) {
                importCharacterFromMarkdown(content);
            } else if (file.name.toLowerCase().endsWith('.json')) {
                importCharacter(content);
            } else {
                alert(`Unsupported file type: ${file.name}. Please use .json or .md files.`);
            }
        };
        reader.readAsText(file);
    };

    const handleImportClick = () => {
        addLog({ level: LogLevel.INFO, source: LogSource.GENERAL, message: 'User clicked "Select Files to Import".' });
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            Array.from(files).forEach(handleFile);
        }
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
        if (dragCounter.current === 0) {
            setIsDragging(false);
        }
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
            const files = Array.from(e.dataTransfer.files);
            addLog({ level: LogLevel.INFO, source: LogSource.GENERAL, message: 'User dropped files for import.', details: { count: files.length, names: files.map(f => f.name) } });
            files.forEach(handleFile);
        }
    }, [importCharacter, importCharacterFromMarkdown, addLog]);


    return (
        <div className="h-full w-full flex flex-col p-3 gap-4">
            <div
                className="relative flex-shrink-0"
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <div className={`flex flex-col items-center justify-center w-full py-6 border-2 border-dashed rounded-lg text-center transition-colors ${isDragging ? 'border-primary-light bg-indigo-50 dark:border-primary-dark dark:bg-indigo-900/20' : 'border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-800/50'}`}>
                    <UploadIcon className="w-8 h-8 mb-2 text-text-secondary-light dark:text-text-secondary-dark" />
                    <p className="font-semibold text-text-primary-light dark:text-text-primary-dark">Drop files here</p>
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">.json or .md files accepted</p>
                </div>
                <div className="text-center my-2 text-xs text-text-secondary-light dark:text-text-secondary-dark uppercase">OR</div>
                <button
                    onClick={handleImportClick}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2 text-md font-semibold rounded-md transition-colors text-white bg-green-600 hover:bg-green-700"
                >
                    <UserPlusIcon className="w-5 h-5" />
                    Select Files to Import
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".json,.md"
                    multiple
                    className="hidden"
                />
            </div>
            

            <div className={`flex-grow transition-opacity ${!character ? 'opacity-50 cursor-not-allowed' : ''}`}>
                 <div className="space-y-4 border-t border-border-light dark:border-border-dark pt-4">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => {
                                if (!character) return;
                                addLog({ level: LogLevel.INFO, source: LogSource.GENERAL, message: `User clicked 'Edit' for character: ${character.id}` });
                                showDialog(DialogType.EDIT_CHARACTER)
                            }}
                            disabled={!character}
                            className="flex items-center justify-center gap-2 flex-grow basis-0 min-w-[120px] px-4 py-2 text-md font-semibold rounded-md transition-colors text-white bg-primary-light dark:bg-indigo-500 hover:bg-primary-light/90 dark:hover:bg-indigo-500/90 disabled:bg-slate-400 dark:disabled:bg-slate-600"
                        >
                            <EditIcon className="w-5 h-5"/>
                            Edit
                        </button>
                         <button
                            onClick={() => character && fixCharacterDetails(character.id)}
                            disabled={!character}
                            className="flex items-center justify-center gap-2 flex-grow basis-0 min-w-[120px] px-4 py-2 text-md font-semibold rounded-md transition-colors text-white bg-secondary-light dark:bg-purple-500 hover:bg-secondary-light/90 dark:hover:bg-purple-500/90 disabled:bg-slate-400 dark:disabled:bg-slate-600"
                            title="Use AI to complete missing or default character details"
                        >
                            <MagicWandIcon className="w-5 h-5"/>
                            Fix
                        </button>
                    </div>
                    
                    <div className="space-y-2 pt-4">
                        <h4 className="text-sm font-semibold text-text-secondary-light dark:text-text-secondary-dark">Export to</h4>
                        <div className="flex flex-wrap gap-2">
                             <button onClick={() => character && exportCharacter(character.id, 'json')} disabled={!character} className="flex items-center justify-center gap-2 p-2 rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 transition-colors text-text-primary-light dark:text-text-primary-dark flex-grow basis-0 min-w-[80px]">
                                <DownloadIcon className="w-4 h-4"/> JSON
                            </button>
                            <button onClick={() => character && exportCharacter(character.id, 'md')} disabled={!character} className="flex items-center justify-center gap-2 p-2 rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 transition-colors text-text-primary-light dark:text-text-primary-dark flex-grow basis-0 min-w-[80px]">
                                <FileTextIcon className="w-4 h-4"/> MD
                            </button>
                             <button onClick={() => character && exportCharacter(character.id, 'html')} disabled={!character} className="flex items-center justify-center gap-2 p-2 rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 transition-colors text-text-primary-light dark:text-text-primary-dark flex-grow basis-0 min-w-[80px]">
                                <CodeIcon className="w-4 h-4"/> HTML
                            </button>
                             <button onClick={() => character && exportCharacter(character.id, 'pdf')} disabled={!character || isExportingPdf} className="flex items-center justify-center gap-2 p-2 rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 transition-colors text-text-primary-light dark:text-text-primary-dark flex-grow basis-0 min-w-[80px]">
                                {isExportingPdf ? (
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
                 </div>
            </div>
        </div>
    );
};

export default CharacterOptions;
