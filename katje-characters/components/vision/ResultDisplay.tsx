
import React from 'react';
import MarkdownRenderer from '../../utils/markdownRenderer';
import DownloadIcon from '../icons/DownloadIcon';
import { KijkwijzerResult } from '../../types';
import KijkwijzerDisplay from '../kijkwijzer/KijkwijzerDisplay';
import SendIcon from '../icons/SendIcon';
import { useAppContext } from '../../context/AppContext';

interface ResultDisplayProps {
  loading: boolean;
  error: string | null;
  markdown: string | null;
  hasImage: boolean;
  kijkwijzerResult: KijkwijzerResult | null;
}

const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full gap-4">
    <svg className="animate-spin h-12 w-12 text-primary-light dark:text-primary-dark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <p className="text-lg font-semibold text-text-secondary-light dark:text-text-secondary-dark">Analyzing...</p>
  </div>
);

const InitialState: React.FC<{ hasImage: boolean }> = ({ hasImage }) => (
    <div className="flex items-center justify-center h-full text-center">
        <div>
            <h3 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark">Analysis Panel</h3>
            <p className="mt-2 text-text-secondary-light dark:text-text-secondary-dark">
                {hasImage ? "Analysis results will appear here." : "Waiting for content to analyze."}
            </p>
        </div>
    </div>
);


const ResultDisplay: React.FC<ResultDisplayProps> = ({ loading, error, markdown, hasImage, kijkwijzerResult }) => {
  const { sendImageToChat, selectedImage, resultJson } = useAppContext();
  
  const handleDownload = () => {
    if (!markdown) return;

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vision-ai-report-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSendToChat = () => {
    if (!selectedImage || !resultJson) return;
    sendImageToChat({
      imageBase64: selectedImage,
      analysis: resultJson,
    });
  };

  const renderBody = () => {
    if (loading) {
      return <LoadingSpinner />;
    }
    if (error) {
      return (
        <div className="text-center text-red-500 bg-red-500/10 p-4 rounded-lg">
            <h3 className="font-bold text-lg">Analysis Error</h3>
            <p className="whitespace-pre-line">{error}</p>
        </div>
      );
    }
    if (markdown) {
      return (
         <div className="prose prose-slate dark:prose-invert max-w-none">
            <MarkdownRenderer content={markdown} />
        </div>
      );
    }
    return <InitialState hasImage={hasImage} />;
  }

  return (
    <div className="h-full w-full flex flex-col">
      <header className="flex justify-between items-center p-4 border-b border-border-light dark:border-border-dark flex-shrink-0 flex-wrap gap-4">
          <h3 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">Analysis Report</h3>
          <div className="flex items-center gap-2">
            {kijkwijzerResult && <KijkwijzerDisplay result={kijkwijzerResult} />}
             <button
              onClick={handleSendToChat}
              disabled={!markdown || loading || !selectedImage || !resultJson}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-md transition-colors text-white bg-green-600 hover:bg-green-700 disabled:bg-slate-400 dark:disabled:bg-slate-600"
              aria-label="Send to chat"
              title="Send image and analysis to chat"
            >
              <SendIcon className="w-5 h-5" />
            </button>
            <button
              onClick={handleDownload}
              disabled={!markdown || loading}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-md transition-colors text-white bg-primary-light dark:bg-indigo-500 hover:bg-primary-light/90 dark:hover:bg-indigo-500/90 disabled:bg-slate-400 dark:disabled:bg-slate-600"
              aria-label="Download report"
            >
              <DownloadIcon className="w-5 h-5" />
            </button>
          </div>
      </header>
      <div className="flex-grow overflow-y-auto p-4">
        {renderBody()}
      </div>
    </div>
  );
};

export default ResultDisplay;
