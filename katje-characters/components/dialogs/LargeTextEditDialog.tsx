
import React, { useState, useEffect } from 'react';
import SaveIcon from '../icons/SaveIcon';
import CancelIcon from '../icons/CancelIcon';

interface LargeTextEditDialogProps {
  title: string;
  initialValue: string;
  onSave: (newValue: string) => void;
  onClose: () => void;
}

const LargeTextEditDialog: React.FC<LargeTextEditDialogProps> = ({ title, initialValue, onSave, onClose }) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation(); // Prevent underlying dialog from closing
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown, { capture: true }); // Use capture to catch event early
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [onClose]);

  const handleSave = () => {
    onSave(value);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-md">
      <div
        className="w-[80vw] h-[80vh] bg-surface-light dark:bg-surface-dark rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-border-light dark:border-border-dark"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-6 border-b border-border-light dark:border-border-dark flex-shrink-0">
          <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">Edit: {title}</h2>
        </header>
        <div className="p-6 flex-grow">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full h-full p-3 bg-slate-100 dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark resize-none"
            autoFocus
          />
        </div>
        <footer className="flex justify-end gap-4 p-4 border-t border-border-light dark:border-border-dark flex-shrink-0 bg-surface-light dark:bg-surface-dark">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-6 py-2 text-sm font-semibold rounded-md transition-colors text-text-primary-light dark:text-text-primary-dark bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500"
          >
            <CancelIcon className="w-5 h-5" />
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 text-sm font-semibold rounded-md transition-colors text-white bg-primary-light dark:bg-indigo-500 hover:bg-primary-light/90 dark:hover:bg-indigo-500/90"
          >
            <SaveIcon className="w-5 h-5" />
            Save
          </button>
        </footer>
      </div>
    </div>
  );
};

export default LargeTextEditDialog;
