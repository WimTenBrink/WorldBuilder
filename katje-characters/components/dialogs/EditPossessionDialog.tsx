
import React, { useState, useEffect } from 'react';
import Dialog from '../ui/Dialog';
import { useAppContext } from '../../context/AppContext';
import { DialogType } from '../../types';
import SaveIcon from '../icons/SaveIcon';
import CancelIcon from '../icons/CancelIcon';
import EditableTextArray from '../ui/EditableTextArray';

const Input: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ label, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">{label}</label>
        <input
            type="text"
            value={value}
            onChange={onChange}
            className="w-full px-3 py-2 bg-slate-200 dark:bg-slate-700 border border-border-light dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
        />
    </div>
);

const EditPossessionDialog: React.FC = () => {
    const { openDialog, showDialog, editTarget, characters, updateCharacter, setEditTarget } = useAppContext();
    const [possession, setPossession] = useState({ ItemType: '', Description: [''] });

    const isNew = editTarget?.index === -1;

    useEffect(() => {
        if (openDialog === DialogType.EDIT_POSSESSION && editTarget) {
            const character = characters[editTarget.characterId];
            if (isNew || !character) {
                setPossession({ ItemType: 'New Item', Description: [''] });
            } else {
                setPossession(character.Possessions[editTarget.index]);
            }
        }
    }, [openDialog, editTarget, characters, isNew]);

    const handleClose = () => {
        showDialog(null);
        setEditTarget(null);
    };

    const handleSave = () => {
        if (!editTarget) return;
        const character = characters[editTarget.characterId];
        const newPossessions = [...(character.Possessions || [])];
        if (isNew) {
            newPossessions.push(possession);
        } else {
            newPossessions[editTarget.index] = possession;
        }
        updateCharacter(editTarget.characterId, { Possessions: newPossessions });
        handleClose();
    };

    const handleChange = (field: keyof typeof possession, value: any) => {
        setPossession(prev => ({ ...prev, [field]: value }));
    };

    if (openDialog !== DialogType.EDIT_POSSESSION) return null;

    return (
        <Dialog
            isOpen={true}
            onClose={handleClose}
            title={isNew ? "Add Possession" : "Edit Possession"}
        >
            <div className="space-y-4">
                <Input label="Item Type" value={possession.ItemType} onChange={(e) => handleChange('ItemType', e.target.value)} />
                <EditableTextArray title="Description" value={possession.Description} onChange={(v) => handleChange('Description', v)} />
            </div>
            <footer className="flex justify-end gap-4 pt-6 mt-6 border-t border-border-light dark:border-border-dark">
                <button onClick={handleClose} className="flex items-center gap-2 px-6 py-2 text-sm font-semibold rounded-md transition-colors bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500"><CancelIcon className="w-5 h-5" />Cancel</button>
                <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 text-sm font-semibold rounded-md transition-colors text-white bg-primary-light dark:bg-indigo-500 hover:bg-primary-light/90 dark:hover:bg-indigo-500/90"><SaveIcon className="w-5 h-5" />Save</button>
            </footer>
        </Dialog>
    );
};

export default EditPossessionDialog;
