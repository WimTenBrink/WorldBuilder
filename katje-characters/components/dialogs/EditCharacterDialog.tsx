
import React, { useState, useEffect, useCallback } from 'react';
import Dialog from '../ui/Dialog';
import { useAppContext } from '../../context/AppContext';
import { DialogType, Character } from '../../types';
import SaveIcon from '../icons/SaveIcon';
import CancelIcon from '../icons/CancelIcon';
import EditableTextArray from '../ui/EditableTextArray';
import EditIcon from '../icons/EditIcon';

const Input = React.memo(function Input({ label, path, value, onChange, type = "text", placeholder }: { label?: string; path: string; value: string | number; onChange: (path: string, value: any) => void; type?: string; placeholder?: string }) {
    return (
        <div>
            {label && <label htmlFor={path} className="block text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">{label}</label>}
            <input
                id={path}
                type={type}
                value={value}
                placeholder={placeholder}
                onChange={e => onChange(path, type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                className="w-full px-2 py-1 bg-slate-200 dark:bg-slate-800 border border-border-light dark:border-border-dark rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light dark:focus:ring-primary-dark text-sm text-text-primary-light dark:text-text-primary-dark"
            />
        </div>
    );
});

const EditCharacterDialog: React.FC = () => {
    const { openDialog, showDialog, selectedCharacterId, characters, updateCharacter, setEditTarget } = useAppContext();
    const [character, setCharacter] = useState<Partial<Character> | null>(null);

    useEffect(() => {
        if (openDialog === DialogType.EDIT_CHARACTER && selectedCharacterId && characters) {
            const charToEdit = characters[selectedCharacterId];
            if (charToEdit) {
                 setCharacter(JSON.parse(JSON.stringify(charToEdit)));
            }
        } else {
            setCharacter(null);
        }
    }, [openDialog, selectedCharacterId, characters]);

    const handleChange = useCallback((path: string, value: any) => {
        setCharacter(prev => {
            if (!prev) return null;
            const newChar = JSON.parse(JSON.stringify(prev));
            let current: any = newChar;
            const keys = path.split('.');
            keys.forEach((key, index) => {
                if (index === keys.length - 1) {
                    current[key] = value;
                } else {
                    current[key] = current[key] || {};
                    current = current[key];
                }
            });
            return newChar;
        });
    }, []);

    const handleSave = () => {
        if (character && character.id) {
            updateCharacter(character.id, character);
        }
        showDialog(null);
    };

    if (!character || !character.id) return null;

    const Panel: React.FC<{title: string, children: React.ReactNode, className?: string}> = ({title, children, className}) => (
        <div className={`bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg border border-border-light dark:border-border-dark shadow-sm break-inside-avoid ${className}`}>
             <h3 className="text-lg font-bold text-primary-light dark:text-primary-dark mb-3 pb-2 border-b border-border-light dark:border-border-dark">{title}</h3>
             <div className="space-y-4">
                {children}
             </div>
        </div>
    );

    return (
        <Dialog
          isOpen={openDialog === DialogType.EDIT_CHARACTER}
          onClose={() => showDialog(null)}
          title={`Edit Character: ${character.Name?.FirstName}`}
        >
            <main className="p-1 overflow-y-auto flex-grow bg-background-light dark:bg-background-dark">
                <div className="columns-1 lg:columns-2 xl:columns-3 gap-4 space-y-4">
                    <Panel title="Core Details">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <Input label="First Name" path="Name.FirstName" value={character.Name?.FirstName || ''} onChange={handleChange} />
                            <Input label="Last Name" path="Name.LastName" value={character.Name?.LastName || ''} onChange={handleChange} />
                            <Input label="Race" path="Name.Race" value={character.Name?.Race || ''} onChange={handleChange} />
                            <Input label="Gender" path="Name.Gender" value={character.Name?.Gender || ''} onChange={handleChange} />
                            <Input label="Age" path="Age" type="number" value={character.Age || 0} onChange={handleChange} />
                            <Input label="Sexuality" path="Sexuality" value={character.Sexuality || ''} onChange={handleChange} />
                            <Input label="World(s)" path="Worlds.0" value={character.Worlds?.[0] || ''} onChange={handleChange} />
                            <Input label="Residence" path="Residence" value={character.Residence || ''} onChange={handleChange} />
                        </div>
                    </Panel>
                    
                    <Panel title="Backstory & Notes">
                        <EditableTextArray title="Backstory" value={character.Story || []} onChange={(v) => handleChange('Story', v)} />
                        <EditableTextArray title="Notes" value={character.Notes || []} onChange={(v) => handleChange('Notes', v)} />
                        <EditableTextArray title="Naked Appearance & Comfort" value={character.Naked || []} onChange={(v) => handleChange('Naked', v)} />
                    </Panel>

                    <Panel title="Relationships">
                        <div className="space-y-2">
                            {(character.Relations || []).map((rel, index) => (
                                <div key={index} className="flex items-center justify-between p-2 rounded-md bg-slate-200 dark:bg-slate-800/70 border border-border-light dark:border-border-dark">
                                    <p className="text-sm truncate">{rel.Relation}: {rel.FirstName} {rel.LastName}</p>
                                    <button onClick={() => { setEditTarget({ characterId: character.id!, index }); showDialog(DialogType.EDIT_RELATIONSHIP); }} className="p-1.5 rounded-full text-text-secondary-light dark:text-text-secondary-dark hover:bg-slate-300 dark:hover:bg-slate-700">
                                        <EditIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => { setEditTarget({ characterId: character.id!, index: -1 }); showDialog(DialogType.EDIT_RELATIONSHIP); }} className="mt-2 text-sm text-primary-light dark:text-primary-dark hover:underline">+ Add Relationship</button>
                    </Panel>

                     <Panel title="Possessions">
                        <div className="space-y-2">
                            {(character.Possessions || []).map((pos, index) => (
                                <div key={index} className="flex items-center justify-between p-2 rounded-md bg-slate-200 dark:bg-slate-800/70 border border-border-light dark:border-border-dark">
                                    <p className="text-sm truncate">{pos.ItemType}</p>
                                    <button onClick={() => { setEditTarget({ characterId: character.id!, index }); showDialog(DialogType.EDIT_POSSESSION); }} className="p-1.5 rounded-full text-text-secondary-light dark:text-text-secondary-dark hover:bg-slate-300 dark:hover:bg-slate-700">
                                        <EditIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => { setEditTarget({ characterId: character.id!, index: -1 }); showDialog(DialogType.EDIT_POSSESSION); }} className="mt-2 text-sm text-primary-light dark:text-primary-dark hover:underline">+ Add Possession</button>
                    </Panel>
                    
                    <Panel title="Wardrobe">
                        <div className="space-y-2">
                            {(character.Dresses || []).map((dress, index) => (
                                <div key={index} className="flex items-center justify-between p-2 rounded-md bg-slate-200 dark:bg-slate-800/70 border border-border-light dark:border-border-dark">
                                    <p className="text-sm truncate">{dress.Usage.join(', ')} ({dress.Items.length} items)</p>
                                    <button onClick={() => { setEditTarget({ characterId: character.id!, index }); showDialog(DialogType.EDIT_WARDROBE); }} className="p-1.5 rounded-full text-text-secondary-light dark:text-text-secondary-dark hover:bg-slate-300 dark:hover:bg-slate-700">
                                        <EditIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => { setEditTarget({ characterId: character.id!, index: -1 }); showDialog(DialogType.EDIT_WARDROBE); }} className="mt-2 text-sm text-primary-light dark:text-primary-dark hover:underline">+ Add Outfit</button>
                    </Panel>

                </div>
            </main>
            <footer className="flex justify-end gap-4 p-4 border-t border-border-light dark:border-border-dark flex-shrink-0 bg-surface-light dark:bg-surface-dark">
                <button onClick={() => showDialog(null)} className="flex items-center gap-2 px-6 py-2 text-sm font-semibold rounded-md transition-colors text-text-primary-light dark:text-text-primary-dark bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500"><CancelIcon className="w-5 h-5" />Cancel</button>
                <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 text-sm font-semibold rounded-md transition-colors text-white bg-primary-light dark:bg-indigo-500 hover:bg-primary-light/90 dark:hover:bg-indigo-500/90"><SaveIcon className="w-5 h-5" />Save Changes</button>
            </footer>
        </Dialog>
    );
};

export default EditCharacterDialog;