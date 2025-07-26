



import React from 'react';
import { useAppContext } from '../context/AppContext';
import { AppMode } from '../types';
import ImageUploader from './vision/ImageUploader';
import KatjeLogo from './icons/KatjeLogo';
import ChatWindow from './gemini/ChatWindow';
import PromptInput from './gemini/PromptInput';
import ImagenGenerator from './imagen/ImagenGenerator';
import CharacterSheet from './characters/CharacterSheet';
import WorldSheet from './characters/WorldSheet';

const CharacterWelcome: React.FC = () => (
    <div className="w-full h-full flex flex-col items-center justify-center text-center p-6">
        <KatjeLogo className="w-48 h-auto" />
        <h1 className="mt-6 text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">Character Generator</h1>
        <p className="mt-2 text-lg text-text-secondary-light dark:text-text-secondary-dark">Create, manage, and visualize your story characters.</p>
        <p className="mt-8 max-w-md text-text-secondary-light dark:text-text-secondary-dark">
            Select a character from the list on the left, or create a new one to get started.
        </p>
    </div>
);

const MainContent: React.FC = () => {
    const { appMode, apiKey, handleImageUpload, chatHistory, isGeminiLoading, sendGeminiMessage, selectedCharacterId } = useAppContext();

    const renderContent = () => {
        switch (appMode) {
            case AppMode.WORLD:
                return <WorldSheet />;
            case AppMode.CHARACTERS:
                return selectedCharacterId ? <CharacterSheet /> : <CharacterWelcome />;
            case AppMode.VISION:
                return (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-8 p-6">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">Vision AI Panel</h2>
                             <p className="mt-2 text-text-secondary-light dark:text-text-secondary-dark">Upload an image to begin your analysis.</p>
                        </div>
                        <div className="w-full max-w-2xl">
                           <ImageUploader onImageUpload={handleImageUpload} />
                        </div>
                    </div>
                );
            case AppMode.GEMINI:
                return (
                    <div className="w-full h-full flex flex-col">
                        <div className="flex-grow overflow-y-auto p-4">
                           <ChatWindow messages={chatHistory} />
                        </div>
                        <div className="flex-shrink-0">
                           <PromptInput 
                                onSendMessage={sendGeminiMessage}
                                isLoading={isGeminiLoading}
                                disabled={!apiKey}
                            />
                        </div>
                    </div>
                );
            case AppMode.IMAGEN:
                return <ImagenGenerator />;
            default:
                return <CharacterWelcome />;
        }
    };

    return (
        <main className="w-full h-full bg-background-light dark:bg-background-dark overflow-y-auto">
            {renderContent()}
        </main>
    );
};

export default MainContent;