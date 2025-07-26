
import React from 'react';
import ImagenDisplay from './ImagenDisplay';
import ImagenPrompt from './ImagenPrompt';
import { useAppContext } from '../../context/AppContext';

const ImagenGenerator: React.FC = () => {
    const { apiKey, generateImage, isImagenLoading, imagenError } = useAppContext();
    return (
        <div className="w-full h-full flex flex-col p-4 gap-4">
             <div className="text-center">
                <h2 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">Imagen AI Generator</h2>
                <p className="mt-2 text-text-secondary-light dark:text-text-secondary-dark">Describe the image you want to create.</p>
            </div>
            <div className="flex-grow flex items-center justify-center overflow-hidden rounded-lg bg-black/10 dark:bg-black/20 p-2">
               <ImagenDisplay />
            </div>
             {imagenError && (
                <div className="flex-shrink-0 text-center text-red-500 bg-red-500/10 p-3 rounded-lg">
                    <p>{imagenError}</p>
                </div>
            )}
            <div className="flex-shrink-0">
               <ImagenPrompt 
                onSendMessage={generateImage}
                isLoading={isImagenLoading}
                disabled={!apiKey}
               />
            </div>
        </div>
    );
};
export default ImagenGenerator;