import React from 'react';
import { useAppContext } from '../context/AppContext';
import { AppMode } from '../types';
import FeatureSelector from './vision/FeatureSelector';
import AnalyzeIcon from './icons/AnalyzeIcon';
import ImagenOptions from './imagen/ImagenOptions';
import SaveIcon from './icons/SaveIcon';
import TrashIcon from './icons/TrashIcon';
import StopIcon from './icons/StopIcon';
import ContinueIcon from './icons/ContinueIcon';
import CharacterList from './characters/CharacterList';
import WorldTableOfContents from './characters/WorldTableOfContents';


const LeftSidebar: React.FC = () => {
  const { 
    appMode, 
    apiKey,
    selectedImage, 
    selectedFeatures,
    isLoading,
    handleFeatureChange,
    handleAnalyzeClick,
    chatHistory,
    isGeminiLoading,
    startNewChat,
    saveChatHistory,
    stopGeminiResponse,
    continueGeminiConversation,
  } = useAppContext();

  const renderVisionSidebar = () => (
    <div className="flex flex-col h-full gap-6">
      <h2 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">Vision AI Features</h2>
      <div className="flex-grow overflow-y-auto pr-2">
        <FeatureSelector
          selectedFeatures={selectedFeatures}
          onFeatureChange={handleFeatureChange}
        />
      </div>
      <div className="flex flex-col gap-4 pt-4 border-t border-border-light dark:border-border-dark">
        {!apiKey && <p className="text-center text-sm text-red-500 bg-red-500/10 p-2 rounded-md">API Key is not configured.</p>}
        <button
          onClick={handleAnalyzeClick}
          disabled={!apiKey || isLoading || !selectedImage || selectedFeatures.length === 0}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-base font-semibold rounded-md transition-colors text-white bg-primary-light dark:bg-indigo-500 hover:bg-primary-light/90 dark:hover:bg-indigo-500/90 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
        >
          <AnalyzeIcon className="w-6 h-6" />
          {isLoading ? 'Analyzing...' : 'Analyze Image'}
        </button>
      </div>
    </div>
  );
  
  const renderGeminiSidebar = () => (
    <div className="flex flex-col h-full gap-4">
      <div>
        <h2 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark mb-4">Chat Controls</h2>
        <div className="flex items-center justify-around">
            <button
                onClick={startNewChat}
                disabled={chatHistory.length === 0}
                className="p-3 rounded-full transition-colors text-text-primary-light dark:text-text-primary-dark bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                title="New Chat"
            >
                <TrashIcon className="w-5 h-5" />
            </button>
            <button
                onClick={saveChatHistory}
                disabled={chatHistory.length === 0}
                className="p-3 rounded-full transition-colors text-text-primary-light dark:text-text-primary-dark bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Save Chat"
            >
                <SaveIcon className="w-5 h-5" />
            </button>
            {isGeminiLoading ? (
                <button
                    onClick={stopGeminiResponse}
                    className="p-3 rounded-full transition-colors text-white bg-red-600 hover:bg-red-700"
                    title="Stop Generating"
                >
                    <StopIcon className="w-5 h-5" />
                </button>
            ) : (
                <button
                    onClick={() => continueGeminiConversation()}
                    disabled={chatHistory.length === 0}
                    className="p-3 rounded-full transition-colors text-white bg-primary-light dark:bg-indigo-500 hover:bg-primary-light/90 dark:hover:bg-indigo-500/90 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
                    title="Continue Conversation"
                >
                    <ContinueIcon className="w-5 h-5" />
                </button>
            )}
        </div>
      </div>
      <div className="flex-grow flex flex-col gap-4 border-t border-border-light dark:border-border-dark pt-4 overflow-y-auto">
        <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">AI Character Workshop</h3>
        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
          The AI team is ready to assist you. Ask them to create, modify, or discuss characters. For example:
        </p>
        <ul className="text-sm list-disc list-inside space-y-2 pl-2 text-text-secondary-light dark:text-text-secondary-dark">
            <li>"Create a family of five for a fantasy story."</li>
            <li>"Tell me more about Bianca Delmonde's personality."</li>
            <li>"Change Katja Bergman's hair color to red."</li>
            <li>"Generate an image for a new character, a male dwarf warrior."</li>
        </ul>
      </div>
       <div className="flex-shrink-0 flex flex-col gap-4 pt-4 border-t border-border-light dark:border-border-dark">
        {!apiKey && <p className="text-center text-sm text-red-500 bg-red-500/10 p-2 rounded-md">API Key is not configured.</p>}
        <p className="text-xs text-center text-text-secondary-light dark:text-text-secondary-dark">
          All 9 AI employees are active and working together to help you.
        </p>
      </div>
    </div>
  );

  const renderImagenSidebar = () => (
    <div className="flex flex-col h-full gap-6">
      <h2 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">Imagen Settings</h2>
      <div className="flex-grow">
        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-4">
            Configure the options for your image generation. The final image will be generated using the Imagen model.
        </p>
        <ImagenOptions />
      </div>
      <div className="flex flex-col gap-4 pt-4 border-t border-border-light dark:border-border-dark">
          {!apiKey && <p className="text-center text-sm text-red-500 bg-red-500/10 p-2 rounded-md">API Key is not configured.</p>}
          <p className="text-xs text-center text-text-secondary-light dark:text-text-secondary-dark">
            Image generation is handled by the main panel. Results and further analysis will appear in the other panels.
          </p>
      </div>
    </div>
  );

  const renderDefaultSidebar = () => (
    <div className="p-4">
      <h2 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">Menu</h2>
      <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-2">
          Select a mode from the header to begin.
      </p>
    </div>
  );

  const renderContent = () => {
    switch(appMode) {
      case AppMode.WORLD:
        return <WorldTableOfContents />;
      case AppMode.CHARACTERS:
        return <CharacterList />;
      case AppMode.VISION:
        return renderVisionSidebar();
      case AppMode.GEMINI:
        return renderGeminiSidebar();
      case AppMode.IMAGEN:
        return renderImagenSidebar();
      default:
        return renderDefaultSidebar();
    }
  }

  return (
    <aside className="hidden md:flex w-full h-full bg-surface-light dark:bg-surface-dark overflow-y-auto overflow-x-hidden p-4 border-r border-border-light dark:border-border-dark flex-col">
      {renderContent()}
    </aside>
  );
};

export default LeftSidebar;