



import React, { useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import RefreshIcon from '../icons/RefreshIcon';
import UploadIcon from '../icons/UploadIcon';
import DownloadIcon from '../icons/DownloadIcon';
import { DialogType, LogLevel, LogSource } from '../../types';
import GenerateIcon from '../icons/GenerateIcon';

const CharacterImage: React.FC = () => {
    const { 
        selectedCharacterId, 
        characters, 
        isCharacterImageLoading, 
        updateCharacter,
        showDialog,
        isExportingPdf,
        addLog,
    } = useAppContext();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const character = selectedCharacterId && characters ? characters[selectedCharacterId] : null;
    const isLoading = selectedCharacterId && isCharacterImageLoading ? isCharacterImageLoading[selectedCharacterId] : false;

    if (!character) return null;

    const handleUploadClick = () => {
        addLog({ level: LogLevel.INFO, source: LogSource.GENERAL, message: `User clicked 'Upload Image' for character ${character.id}` });
        fileInputRef.current?.click();
    };
    
    const handleGenerateClick = () => {
        addLog({ level: LogLevel.INFO, source: LogSource.GENERAL, message: `User clicked 'Generate Image' for character ${character.id}` });
        showDialog(DialogType.GENERATE_IMAGE);
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
             addLog({ level: LogLevel.INFO, source: LogSource.GENERAL, message: `User uploaded new portrait for character ${character.id}`, details: { name: file.name, size: file.size } });
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                updateCharacter(character.id, { image: base64String });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDownload = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!character.image) return;
        addLog({ level: LogLevel.INFO, source: LogSource.GENERAL, message: `User downloaded portrait for character ${character.id}` });

        try {
            const response = await fetch(character.image);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${character.Name.FirstName}_${character.Name.LastName}_portrait.png`.toLowerCase();
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to download image:', error);
            addLog({ level: LogLevel.ERROR, source: LogSource.GENERAL, message: `Failed to download image for character ${character.id}`, details: error });
            // Fallback for simple data URLs
            const link = document.createElement('a');
            link.href = character.image;
            link.download = `${character.Name.FirstName}_${character.Name.LastName}_portrait.png`.toLowerCase();
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="group aspect-[3/4] w-full bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center relative overflow-hidden border border-border-light dark:border-border-dark">
            {isLoading ? (
                <div className="flex flex-col items-center justify-center gap-4 text-text-secondary-light dark:text-text-secondary-dark">
                    <svg className="animate-spin h-10 w-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Generating...</span>
                </div>
            ) : character.image ? (
                <>
                    <img src={character.image} alt={`Portrait of ${character.Name.FirstName}`} className="w-full h-full object-cover" />
                    {!isExportingPdf && (
                        <div className="absolute top-2 right-2 flex items-center gap-2 p-1 rounded-full bg-black/50 backdrop-blur-sm transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                            <button
                                onClick={handleDownload}
                                className="p-2 rounded-full bg-black/60 text-white hover:bg-black/80"
                                title="Download Image"
                            >
                                <DownloadIcon className="w-4 h-4"/>
                            </button>
                            <button
                                onClick={handleGenerateClick}
                                className="p-2 rounded-full bg-black/60 text-white hover:bg-black/80"
                                title="Regenerate Image"
                            >
                                <RefreshIcon className="w-4 h-4"/>
                            </button>
                            <button
                                onClick={handleUploadClick}
                                className="p-2 rounded-full bg-black/60 text-white hover:bg-black/80"
                                title="Upload new image"
                            >
                               <UploadIcon className="w-4 h-4"/>
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center p-4">
                    {!isExportingPdf ? (
                        <>
                            <p className="mb-4 text-text-secondary-light dark:text-text-secondary-dark">No image available.</p>
                            <div className="flex flex-col items-center gap-3">
                                <button onClick={handleGenerateClick} className="flex items-center justify-center gap-2 w-full max-w-[200px] px-4 py-2 rounded-md bg-primary-light text-white font-semibold">
                                    <GenerateIcon className="w-5 h-5" />
                                    Generate Image
                                </button>
                                <button onClick={handleUploadClick} className="flex items-center justify-center gap-2 w-full max-w-[200px] px-4 py-2 rounded-md bg-slate-600 text-white font-semibold">
                                    <UploadIcon className="w-5 h-5" />
                                    Upload Image
                                </button>
                            </div>
                        </>
                    ) : (
                         <p className="text-text-secondary-light dark:text-text-secondary-dark">No image available.</p>
                    )}
                </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        </div>
    );
};

export default CharacterImage;