


import React, { ReactNode, useState, useEffect, useCallback, useRef } from 'react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const ConfirmationModal: React.FC<{ onConfirm: () => void; onCancel: () => void }> = ({ onConfirm, onCancel }) => {
    const confirmBtnRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                onConfirm();
            }
            // The main dialog's Escape listener will handle closing the confirmation
        };
        window.addEventListener('keydown', handleKeyDown);
        confirmBtnRef.current?.focus();
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onConfirm]);

    return (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
            <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-xl border border-border-light dark:border-border-dark w-full max-w-sm m-4">
                <h3 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">Confirm Close</h3>
                <p className="my-4 text-text-secondary-light dark:text-text-secondary-dark">Are you sure you want to close this dialog? Any unsaved changes may be lost.</p>
                <div className="flex justify-end gap-4">
                    <button 
                        onClick={onCancel} 
                        className="px-6 py-2 text-sm font-semibold rounded-md transition-colors text-text-primary-light dark:text-text-primary-dark bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500"
                    >
                        Cancel
                    </button>
                    <button 
                        ref={confirmBtnRef} 
                        onClick={onConfirm} 
                        className="px-6 py-2 text-sm font-semibold rounded-md transition-colors text-white bg-primary-light dark:bg-indigo-500 hover:bg-primary-light/90 dark:hover:bg-indigo-500/90"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};


const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, title, children }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  
  const handleAttemptClose = useCallback(() => {
      setShowConfirm(true);
  }, []);

  const handleConfirmClose = useCallback(() => {
      setShowConfirm(false);
      onClose();
  }, [onClose]);

  const handleCancelClose = useCallback(() => {
      setShowConfirm(false);
  }, []);

  useEffect(() => {
      if (!isOpen) {
          setShowConfirm(false); // Reset on open
          return;
      }
      const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'Escape') {
              e.preventDefault();
              if (showConfirm) {
                handleCancelClose();
              } else {
                handleAttemptClose();
              }
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
          window.removeEventListener('keydown', handleKeyDown);
      };
  }, [isOpen, showConfirm, handleAttemptClose, handleCancelClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
      onClick={handleAttemptClose}
    >
      <div
        className="relative w-[90vw] h-[90vh] bg-surface-light dark:bg-surface-dark rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-border-light dark:border-border-dark"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-6 border-b border-border-light dark:border-border-dark flex-shrink-0">
          <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">{title}</h2>
          <button
            onClick={handleAttemptClose}
            className="p-2 rounded-full text-text-secondary-light dark:text-text-secondary-dark hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="Close dialog"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        <div className="p-6 overflow-y-auto flex-grow">
          {children}
        </div>
        {showConfirm && <ConfirmationModal onConfirm={handleConfirmClose} onCancel={handleCancelClose} />}
      </div>
    </div>
  );
};

export default Dialog;