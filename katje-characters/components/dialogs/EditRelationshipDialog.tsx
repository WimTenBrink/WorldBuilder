
import React, { useState, useEffect, useCallback } from 'react';
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

const EditRelationshipDialog: React.FC = () => {
    const { openDialog, showDialog, editTarget, characters, updateCharacter, setEditTarget } = useAppContext();
    const [relation, setRelation] = useState({ Relation: '', FirstName: '', Names: [] as string[], LastName: '', MaidenName: null as string | null, Race: '', Gender: '' });

    const isNew = editTarget?.index === -1;

    useEffect(() => {
        if (openDialog === DialogType.EDIT_RELATIONSHIP && editTarget) {
            const character = characters[editTarget.characterId];
            if (isNew || !character) {
                setRelation({ Relation: 'Friend', FirstName: '', Names: [], LastName: '', MaidenName: null, Race: 'Human', Gender: 'Not specified' });
            } else {
                 const existingRelation = character.Relations[editTarget.index];
                 setRelation({
                    Relation: '', FirstName: '', Names: [], LastName: '', MaidenName: null, Race: '', Gender: '', // Default structure
                    ...existingRelation // Overlay existing data
                });
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
        const newRelations = [...(character.Relations || [])];
        if (isNew) {
            newRelations.push(relation);
        } else {
            newRelations[editTarget.index] = relation;
        }
        updateCharacter(editTarget.characterId, { Relations: newRelations });
        handleClose();
    };

    const handleChange = (field: keyof typeof relation) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setRelation(prev => ({ ...prev, [field]: field === 'MaidenName' && value === '' ? null : value }));
    };

    if (openDialog !== DialogType.EDIT_RELATIONSHIP) return null;

    return (
        <Dialog
            isOpen={true}
            onClose={handleClose}
            title={isNew ? "Add Relationship" : "Edit Relationship"}
        >
            <div className="space-y-4">
                <Input label="Relation Type" value={relation.Relation} onChange={handleChange('Relation')} />
                <div className="grid grid-cols-2 gap-4">
                    <Input label="First Name" value={relation.FirstName} onChange={handleChange('FirstName')} />
                    <Input label="Last Name" value={relation.LastName} onChange={handleChange('LastName')} />
                </div>
                <Input label="Maiden Name" value={relation.MaidenName || ''} onChange={handleChange('MaidenName')} />
                <EditableTextArray title="Other Names" value={relation.Names || []} onChange={(v) => setRelation(p => ({...p, Names: v}))} />
                <div className="grid grid-cols-2 gap-4">
                    <Input label="Race" value={relation.Race} onChange={handleChange('Race')} />
                    <Input label="Gender" value={relation.Gender} onChange={handleChange('Gender')} />
                </div>
            </div>
            <footer className="flex justify-end gap-4 pt-6 mt-6 border-t border-border-light dark:border-border-dark">
                <button onClick={handleClose} className="flex items-center gap-2 px-6 py-2 text-sm font-semibold rounded-md transition-colors bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500"><CancelIcon className="w-5 h-5" />Cancel</button>
                <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 text-sm font-semibold rounded-md transition-colors text-white bg-primary-light dark:bg-indigo-500 hover:bg-primary-light/90 dark:hover:bg-indigo-500/90"><SaveIcon className="w-5 h-5" />Save</button>
            </footer>
        </Dialog>
    );
};

export default EditRelationshipDialog;
