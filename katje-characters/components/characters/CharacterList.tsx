

import React, { useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import TrashIcon from '../icons/TrashIcon';
import DownloadIcon from '../icons/DownloadIcon';
import UploadIcon from '../icons/UploadIcon';
import { LogLevel, LogSource } from '../../types';

const CharacterList: React.FC = () => {
    const { 
        characters, 
        selectedCharacterId, 
        selectCharacter,
        deleteCharacter,
        exportCharacter,
        deleteAllCharacters,
        saveAllCharacters,
        loadCharacters,
        addLog,
    } = useAppContext();
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const sortedCharacters = React.useMemo(() => {
        return Object.values(characters).sort((a, b) => {
            const nameA = `${a.Name?.LastName || ''}, ${a.Name?.FirstName || ''}`.toLowerCase();
            const nameB = `${b.Name?.LastName || ''}, ${b.Name?.FirstName || ''}`.toLowerCase();
            return nameA.localeCompare(nameB);
        });
    }, [characters]);

    const handleLoadClick = () => {
        addLog({ level: LogLevel.INFO, source: LogSource.GENERAL, message: `User clicked 'Load Characters'` });
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            addLog({ level: LogLevel.INFO, source: LogSource.GENERAL, message: `User selected file to load characters.`, details: { name: file.name, size: file.size } });
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target?.result as string;
                loadCharacters(content);
            };
            reader.readAsText(file);
        }
        e.target.value = ''; // Reset file input to allow loading the same file again
    };

    return (
        <div className="flex flex-col h-full gap-4">
            <div className="flex-shrink-0 flex items-center justify-around gap-2 p-1 bg-slate-100 dark:bg-slate-900/50 rounded-lg">
                <button
                    onClick={deleteAllCharacters}
                    className="p-2 rounded-md transition-colors text-text-secondary-light dark:text-text-secondary-dark hover:bg-red-500/10 hover:text-red-500"
                    title="New (Delete All Characters)"
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
                 <button
                    onClick={saveAllCharacters}
                    className="p-2 rounded-md transition-colors text-text-secondary-light dark:text-text-secondary-dark hover:bg-blue-500/10 hover:text-blue-500"
                    title="Save All Characters to JSON"
                >
                    <DownloadIcon className="w-5 h-5" />
                </button>
                <button
                    onClick={handleLoadClick}
                    className="p-2 rounded-md transition-colors text-text-secondary-light dark:text-text-secondary-dark hover:bg-green-500/10 hover:text-green-500"
                    title="Load Characters from JSON File"
                >
                    <UploadIcon className="w-5 h-5" />
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".json"
                    className="hidden"
                />
            </div>
            <div className="flex-grow overflow-y-auto space-y-1 pr-1">
                {sortedCharacters.length === 0 ? (
                    <p className="text-center text-text-secondary-light dark:text-text-secondary-dark mt-8 px-4">
                        No characters. Use the buttons above to load from a file or use the Gemini chat to create new ones.
                    </p>
                ) : (
                    sortedCharacters.map(char => (
                         <div
                            key={char.id}
                            className={`group flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                                selectedCharacterId === char.id
                                    ? 'bg-primary-light/20 dark:bg-primary-dark/20'
                                    : 'hover:bg-slate-200 dark:hover:bg-slate-700/70'
                            }`}
                            onClick={() => selectCharacter(char.id)}
                        >
                            <div className="flex items-center gap-2 flex-grow min-w-0">
                                <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                                    {selectedCharacterId === char.id && (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-light dark:text-primary-dark" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex-grow text-left min-w-0">
                                    <p className="font-semibold text-text-primary-light dark:text-text-primary-dark truncate">{char.Name.FirstName} {char.Name.LastName}</p>
                                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">{char.Name.Race}</p>
                                </div>
                            </div>
                            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteCharacter(char.id);
                                    }}
                                    title="Delete Character"
                                    className="p-1.5 rounded-full text-text-secondary-light dark:text-text-secondary-dark hover:bg-red-500/10 hover:text-red-500"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); exportCharacter(char.id, 'json'); }} title="Download JSON" className="p-1.5 rounded-full text-text-secondary-light dark:text-text-secondary-dark hover:bg-slate-300 dark:hover:bg-slate-600">
                                    <DownloadIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CharacterList;
