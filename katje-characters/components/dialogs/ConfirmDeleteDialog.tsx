

import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { DialogType } from '../../types';
import TrashIcon from '../icons/TrashIcon';
import CancelIcon from '../icons/CancelIcon';

const ConfirmDeleteDialog: React.FC = () => {
    const { openDialog, showDialog, deletionTarget, confirmDeletion, characters } = useAppContext();

    if (openDialog !== DialogType.CONFIRM_DELETE) {
        return null;
    }

    const isDeletingAll = deletionTarget === 'all';
    const characterName = !isDeletingAll && deletionTarget && characters[deletionTarget]
        ? `${characters[deletionTarget].Name.FirstName} ${characters[deletionTarget].Name.LastName}`
        : 'this character';

    const title = isDeletingAll ? 'Delete All Characters?' : `Delete ${characterName}?`;
    const message = isDeletingAll
        ? 'Are you absolutely sure you want to delete ALL characters? This action cannot be undone.'
        : `Are you sure you want to permanently delete ${characterName}? This action cannot be undone.`;

    return (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
          onClick={() => showDialog(null)}
        >
          <div
            className="relative w-full max-w-md bg-surface-light dark:bg-surface-dark rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-border-light dark:border-border-dark"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex items-center gap-4 p-6 border-b border-border-light dark:border-border-dark">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                    <TrashIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">{title}</h2>
                </div>
            </header>
            <div className="p-6">
                <p className="text-text-secondary-light dark:text-text-secondary-dark">{message}</p>
            </div>
            <footer className="flex justify-end gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-border-light dark:border-border-dark">
                <button
                    onClick={() => showDialog(null)}
                    className="flex items-center gap-2 px-6 py-2 text-sm font-semibold rounded-md transition-colors text-text-primary-light dark:text-text-primary-dark bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500"
                >
                    <CancelIcon className="w-4 h-4" />
                    Cancel
                </button>
                <button
                    onClick={confirmDeletion}
                    className="flex items-center gap-2 px-6 py-2 text-sm font-semibold rounded-md transition-colors text-white bg-red-600 hover:bg-red-700"
                >
                    <TrashIcon className="w-4 h-4" />
                    Confirm Deletion
                </button>
            </footer>
          </div>
        </div>
    );
};

export default ConfirmDeleteDialog;