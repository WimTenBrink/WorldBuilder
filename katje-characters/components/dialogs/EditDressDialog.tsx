
import React, { useState, useEffect } from 'react';
import Dialog from '../ui/Dialog';
import { useAppContext } from '../../context/AppContext';
import { DialogType } from '../../types';
import SaveIcon from '../icons/SaveIcon';
import CancelIcon from '../icons/CancelIcon';
import EditableTextArray from '../ui/EditableTextArray';
import TrashIcon from '../icons/TrashIcon';

const ItemInput: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ label, value, onChange }) => (
    <div>
        <label className="block text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">{label}</label>
        <input
            type="text"
            value={value || ''}
            onChange={onChange}
            className="w-full px-2 py-1 bg-slate-200 dark:bg-slate-800 border border-border-light dark:border-border-dark rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light dark:focus:ring-primary-dark text-sm"
        />
    </div>
);

const EditDressDialog: React.FC = () => {
    const { openDialog, showDialog, editTarget, characters, updateCharacter, setEditTarget } = useAppContext();
    const [dress, setDress] = useState({ Usage: [''], Items: [{ Type: '', Color: '', Style: '', Fabric: '', Size: '', Fit: '' }] });

    const isNew = editTarget?.index === -1;

    useEffect(() => {
        if (openDialog === DialogType.EDIT_WARDROBE && editTarget) {
            const character = characters[editTarget.characterId];
            if (isNew || !character) {
                setDress({ Usage: [''], Items: [{ Type: '', Color: '', Style: '', Fabric: '', Size: '', Fit: '' }] });
            } else {
                setDress(character.Dresses[editTarget.index]);
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
        const newDresses = [...(character.Dresses || [])];
        if (isNew) {
            newDresses.push(dress);
        } else {
            newDresses[editTarget.index] = dress;
        }
        updateCharacter(editTarget.characterId, { Dresses: newDresses });
        handleClose();
    };

    const handleItemChange = (itemIndex: number, field: keyof typeof dress.Items[0]) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const newItems = [...dress.Items];
        newItems[itemIndex] = { ...newItems[itemIndex], [field]: e.target.value };
        setDress(prev => ({ ...prev, Items: newItems }));
    };

    const handleAddItem = () => {
        setDress(prev => ({ ...prev, Items: [...prev.Items, { Type: '', Color: '', Style: '', Fabric: '', Size: '', Fit: '' }] }));
    };
    
    const handleRemoveItem = (itemIndex: number) => {
        setDress(prev => ({ ...prev, Items: prev.Items.filter((_, i) => i !== itemIndex) }));
    };


    if (openDialog !== DialogType.EDIT_WARDROBE) return null;

    return (
        <Dialog
            isOpen={true}
            onClose={handleClose}
            title={isNew ? "Add Outfit" : "Edit Outfit"}
        >
            <div className="space-y-4">
                <EditableTextArray title="Outfit Usage (e.g., Casual, Formal, Winter)" value={dress.Usage} onChange={(v) => setDress(p => ({...p, Usage: v}))} />
                
                <div className="mt-4 pt-4 border-t border-border-light dark:border-border-dark">
                    <h4 className="text-md font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">Clothing Items</h4>
                    <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
                        {dress.Items.map((item, index) => (
                             <div key={index} className="flex items-start gap-2 p-3 rounded-md bg-slate-200 dark:bg-slate-800/70 border border-border-light dark:border-border-dark">
                                <div className="flex-grow grid grid-cols-2 md:grid-cols-3 gap-2">
                                    <ItemInput label="Type" value={item.Type} onChange={handleItemChange(index, 'Type')} />
                                    <ItemInput label="Color" value={item.Color!} onChange={handleItemChange(index, 'Color')} />
                                    <ItemInput label="Style" value={item.Style!} onChange={handleItemChange(index, 'Style')} />
                                    <ItemInput label="Fabric" value={item.Fabric!} onChange={handleItemChange(index, 'Fabric')} />
                                    <ItemInput label="Size" value={item.Size!} onChange={handleItemChange(index, 'Size')} />
                                    <ItemInput label="Fit" value={item.Fit!} onChange={handleItemChange(index, 'Fit')} />
                                </div>
                                <button onClick={() => handleRemoveItem(index)} className="p-1.5 rounded-full text-red-500 hover:bg-red-500/10 mt-6">
                                    <TrashIcon className="w-4 h-4"/>
                                </button>
                            </div>
                        ))}
                    </div>
                     <button onClick={handleAddItem} className="mt-2 text-sm text-primary-light dark:text-primary-dark hover:underline">+ Add Item</button>
                </div>
            </div>
            <footer className="flex justify-end gap-4 pt-6 mt-6 border-t border-border-light dark:border-border-dark">
                <button onClick={handleClose} className="flex items-center gap-2 px-6 py-2 text-sm font-semibold rounded-md transition-colors bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500"><CancelIcon className="w-5 h-5" />Cancel</button>
                <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 text-sm font-semibold rounded-md transition-colors text-white bg-primary-light dark:bg-indigo-500 hover:bg-primary-light/90 dark:hover:bg-indigo-500/90"><SaveIcon className="w-5 h-5" />Save</button>
            </footer>
        </Dialog>
    );
};

export default EditDressDialog;
