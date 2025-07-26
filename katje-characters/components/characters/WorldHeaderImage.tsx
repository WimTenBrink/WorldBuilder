
import React from 'react';
import { useAppContext } from '../../context/AppContext';
import GenerateIcon from '../icons/GenerateIcon';
import UploadIcon from '../icons/UploadIcon';
import TrashIcon from '../icons/TrashIcon';
import DownloadIcon from '../icons/DownloadIcon';
import { LogLevel, LogSource } from '../../types';

const WorldHeaderImage: React.FC = () => {
    const { world, generateWorldHeaderImage, uploadWorldImage, removeWorldImage, isExportingWorldPdf, addLog } = useAppContext();
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleUploadClick = () => fileInputRef.current?.click();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                uploadWorldImage(base64String);
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    const handleDownload = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!world.headerImage) return;
        addLog({ level: LogLevel.INFO, source: LogSource.GENERAL, message: `User downloading world header image.` });

        try {
            const response = await fetch(world.headerImage);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${world.name}_header.png`.toLowerCase().replace(/\s/g, '_');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to download image:', error);
            addLog({ level: LogLevel.ERROR, source: LogSource.GENERAL, message: 'Failed to download world header image.', details: error });
            const link = document.createElement('a');
            link.href = world.headerImage;
            link.download = `${world.name}_header.png`.toLowerCase().replace(/\s/g, '_');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };
    
    if (!world.headerImage && isExportingWorldPdf) {
        return null; // Hide empty header from exports
    }

    return (
        <div className="group relative w-full aspect-[16/9] bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden mb-6 border border-border-light dark:border-border-dark">
            {world.headerImage ? (
                 <img src={world.headerImage} alt={`A depiction of ${world.name}`} className="w-full h-full object-cover" />
            ) : (
                <div className="text-center p-4">
                    <p className="mb-4 text-text-secondary-light dark:text-text-secondary-dark">No header image for this world.</p>
                </div>
            )}
            {!isExportingWorldPdf && (
                 <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-4 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                    <button onClick={() => generateWorldHeaderImage()} className="flex flex-col items-center gap-2 p-4 rounded-lg bg-black/60 text-white hover:bg-black/80" title="Generate Image with AI">
                        <GenerateIcon className="w-8 h-8"/>
                        <span>Generate</span>
                    </button>
                    <button onClick={handleUploadClick} className="flex flex-col items-center gap-2 p-4 rounded-lg bg-black/60 text-white hover:bg-black/80" title="Upload Image">
                        <UploadIcon className="w-8 h-8"/>
                        <span>Upload</span>
                    </button>
                    {world.headerImage && (
                        <>
                            <button onClick={handleDownload} className="flex flex-col items-center gap-2 p-4 rounded-lg bg-black/60 text-white hover:bg-black/80" title="Download Image">
                                <DownloadIcon className="w-8 h-8"/>
                                <span>Download</span>
                            </button>
                            <button onClick={removeWorldImage} className="flex flex-col items-center gap-2 p-4 rounded-lg bg-red-800/80 text-white hover:bg-red-700" title="Remove Image">
                                <TrashIcon className="w-8 h-8"/>
                                <span>Remove</span>
                            </button>
                        </>
                    )}
                </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        </div>
    );
};

export default WorldHeaderImage;
