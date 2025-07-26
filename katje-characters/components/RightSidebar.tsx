import React from 'react';
import { useAppContext } from '../context/AppContext';
import { AppMode } from '../types';
import ResultDisplay from './vision/ResultDisplay';
import EmotionalStateDisplay from './gemini/EmotionalStateDisplay';
import CharacterOptions from './characters/CharacterOptions';
import WorldOptions from './characters/WorldOptions';

const RightSidebar: React.FC = () => {
  const { 
    appMode, 
    isLoading, 
    error, 
    resultMarkdown, 
    selectedImage,
    kijkwijzerResult,
    generatedImage,
    isVisionForImagenLoading,
    visionForImagenError,
    visionForImagenResult,
    kijkwijzerForImagen,
  } = useAppContext();

  const renderVisionSidebar = () => (
     <ResultDisplay
        loading={isLoading}
        error={error}
        markdown={resultMarkdown}
        hasImage={!!selectedImage}
        kijkwijzerResult={kijkwijzerResult}
      />
  );

  const renderImagenSidebar = () => (
    <ResultDisplay
        loading={isVisionForImagenLoading}
        error={visionForImagenError}
        markdown={visionForImagenResult}
        hasImage={!!generatedImage}
        kijkwijzerResult={kijkwijzerForImagen}
      />
  );

  const renderGeminiSidebar = () => (
    <EmotionalStateDisplay />
  );

  const renderDefaultSidebar = () => (
    <div className="p-4">
      <h2 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">Details</h2>
      <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-2">
          Results and other details will be displayed here.
      </p>
    </div>
  );

  const renderContent = () => {
    switch(appMode) {
      case AppMode.WORLD:
        return <WorldOptions />;
      case AppMode.CHARACTERS:
        return <CharacterOptions />;
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
    <aside className="hidden lg:flex w-full h-full bg-surface-light dark:bg-surface-dark border-l border-border-light dark:border-border-dark flex-col overflow-y-auto overflow-x-hidden">
      {renderContent()}
    </aside>
  );
};

export default RightSidebar;