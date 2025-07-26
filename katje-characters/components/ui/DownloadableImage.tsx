
import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { LogLevel, LogSource } from '../../types';
import DownloadIcon from '../icons/DownloadIcon';

interface DownloadableImageProps {
    src: string;
    alt: string;
    filename: string;
    className?: string;
}

const DownloadableImage: React.FC<DownloadableImageProps> = ({ src, alt, filename, className }) => {
    const { addLog } = useAppContext();

    const handleDownload = async (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        addLog({ level: LogLevel.INFO, source: LogSource.GENERAL, message: `User downloading image: ${filename}` });

        try {
            const response = await fetch(src);
            if (!response.ok) {
                throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
            }
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to download image:', error);
            addLog({ level: LogLevel.ERROR, source: LogSource.GENERAL, message: 'Failed to download image via fetch.', details: { error, src, filename } });
            // Fallback for simple data URLs if fetch fails (e.g., due to CORS on external images)
            const link = document.createElement('a');
            link.href = src;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="relative group w-full h-full">
            <img src={src} alt={alt} className={className} />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={handleDownload}
                    className="p-2 rounded-full bg-black/60 text-white hover:bg-black/80"
                    title="Download Image"
                >
                    <DownloadIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default DownloadableImage;
