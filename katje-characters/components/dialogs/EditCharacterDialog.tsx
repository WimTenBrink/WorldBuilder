



import React, { useState, useEffect, useCallback } from 'react';
import Dialog from '../ui/Dialog';
import { useAppContext } from '../../context/AppContext';
import { DialogType, Character, CharacterDetailType } from '../../types';
import SaveIcon from '../icons/SaveIcon';
import CancelIcon from '../icons/CancelIcon';
import SparklesIcon from '../icons/SparklesIcon';

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

const TextArrayInput = React.memo(function TextArrayInput({ title, field, value, onChange, small }: { title?: string, field: string; value: string[], onChange: (path: string, value: any) => void; small?: boolean }) {
    const handleItemChange = useCallback((index: number, newValue: string) => {
        const newArray = [...value];
        newArray[index] = newValue;
        onChange(field, newArray);
    }, [value, onChange, field]);

    const handleAddItem = useCallback(() => {
        onChange(field, [...value, ""]);
    }, [value, onChange, field]);

    const handleRemoveItem = useCallback((index: number) => {
        onChange(field, value.filter((_, i) => i !== index));
    }, [value, onChange, field]);

    return (
        <div>
            {title && <h4 className={`${small ? 'text-sm' : 'text-md'} font-semibold text-text-primary-light dark:text-text-primary-dark mb-2`}>{title}</h4>}
            <div className="space-y-2">
                {(value || []).map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <textarea
                            value={item}
                            onChange={e => handleItemChange(index, e.target.value)}
                            rows={small ? 1 : 2}
                            className="w-full px-2 py-1 bg-slate-200 dark:bg-slate-800 border border-border-light dark:border-border-dark rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light dark:focus:ring-primary-dark text-sm resize-y text-text-primary-light dark:text-text-primary-dark"
                        />
                        <button onClick={() => handleRemoveItem(index)} className="p-1.5 rounded-full text-red-500 hover:bg-red-500/10">✕</button>
                    </div>
                ))}
                <button onClick={handleAddItem} className="text-sm text-primary-light dark:text-primary-dark hover:underline">+ Add Item</button>
            </div>
        </div>
    );
});

const EnhancedTextArrayInput = React.memo(function EnhancedTextArrayInput({ title, field, value, onChange, charId }: { title: string, field: CharacterDetailType, value: string[], onChange: (path: string, value: any) => void, charId: string }) {
    const { enhanceCharacterDetail, isEnhancingDetail } = useAppContext();
    return (
        <div className="mt-4 first:mt-0">
            <div className="flex justify-between items-center mb-2">
                <h4 className="text-md font-semibold text-text-primary-light dark:text-text-primary-dark">{title}</h4>
                <button onClick={() => enhanceCharacterDetail(charId, field)} disabled={isEnhancingDetail} className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-secondary-light/20 dark:bg-secondary-dark/20 hover:bg-secondary-light/40 dark:hover:bg-secondary-dark/40 disabled:opacity-50">
                    <SparklesIcon className="w-3 h-3"/> {isEnhancingDetail ? 'Working...' : 'Enhance with AI'}
                </button>
            </div>
            <TextArrayInput field={field} value={value} onChange={onChange} />
        </div>
    );
});

const ComplexListEditor = React.memo(function ComplexListEditor({items, field, onChange, onAddItem, onRemoveItem, renderItem}: {items: any[], field: string, onChange: Function, onAddItem: Function, onRemoveItem: Function, renderItem: Function, hideTitle?: boolean}) {
    return (
        <div className="space-y-3">
            {(items || []).map((item, index) => (
                <div key={index} className="flex items-start gap-2 p-3 rounded-md bg-slate-200 dark:bg-slate-800/70 border border-border-light dark:border-border-dark">
                    <div className="flex-grow">{renderItem(item, index)}</div>
                    <button onClick={() => onRemoveItem(field, index)} className="p-1.5 rounded-full text-red-500 hover:bg-red-500/10 mt-1">✕</button>
                </div>
            ))}
            <button onClick={() => onAddItem(field)} className="text-sm text-primary-light dark:text-primary-dark hover:underline">+ Add Item</button>
        </div>
    );
});

const EnhancedComplexListEditor = React.memo(function EnhancedComplexListEditor({ title, items, field, charId, onChange, onAddItem, onRemoveItem, renderItem }: {title: string, items: any[], field: 'Possessions' | 'Dresses', charId: string, onChange: Function, onAddItem: Function, onRemoveItem: Function, renderItem: Function}) {
    const { enhanceCharacterDetail, isEnhancingDetail } = useAppContext();
     return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <h4 className="text-md font-semibold text-text-primary-light dark:text-text-primary-dark">{title}</h4>
                <button onClick={() => enhanceCharacterDetail(charId, field)} disabled={isEnhancingDetail} className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-secondary-light/20 dark:bg-secondary-dark/20 hover:bg-secondary-light/40 dark:hover:bg-secondary-dark/40 disabled:opacity-50">
                    <SparklesIcon className="w-3 h-3"/> {isEnhancingDetail ? 'Working...' : 'Enhance with AI'}
                </button>
            </div>
            <ComplexListEditor
                items={items}
                field={field}
                onChange={onChange}
                onAddItem={onAddItem}
                onRemoveItem={onRemoveItem}
                renderItem={renderItem}
            />
        </div>
     );
});

const EditCharacterDialog: React.FC = () => {
    const { openDialog, showDialog, selectedCharacterId, characters, updateCharacter } = useAppContext();
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
                    const arrayMatch = key.match(/(\w+)\[(\d+)\]/);
                    if (arrayMatch) {
                        const arrayKey = arrayMatch[1];
                        const arrayIndex = parseInt(arrayMatch[2], 10);
                        if (!current[arrayKey]) current[arrayKey] = [];
                        current = current[arrayKey][arrayIndex];
                    } else {
                        if (!current[key]) current[key] = {};
                        current = current[key];
                    }
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
    
    const handleAddItem = useCallback((field: keyof Character) => {
        setCharacter(prev => {
            if (!prev) return null;
            const currentItems = (prev[field] as any[]) || [];
            let newItem: any;
            switch(field) {
                case 'BodyMarks': newItem = { Name: "", Location: "", Description: "", Details: [] }; break;
                case 'BodyParts': newItem = { Name: "", Details: [{Name: "", Descriptions: [""]}] }; break;
                case 'Relations': newItem = { Relation: "", FirstName: "", LastName: "", Race: "", Gender: "" }; break;
                case 'Employer': newItem = { Company: "", JobTitles: [""] }; break;
                case 'Possessions': newItem = { ItemType: "", Description: [""] }; break;
                case 'Dresses': newItem = { Usage: [""], Items: [{Type: "", Color: null, Style: null, Fabric: null, Size: null, Fit: null}]}; break;
                default: newItem = "";
            }
            const newChar = { ...prev, [field]: [...currentItems, newItem] };
            return newChar;
        });
    }, []);
    
    const handleRemoveItem = useCallback((field: keyof Character, index: number) => {
        setCharacter(prev => {
             if (!prev) return null;
            const currentItems = (prev[field] as any[]) || [];
            const newItems = currentItems.filter((_, i) => i !== index);
            return { ...prev, [field]: newItems };
        });
    }, []);

    if (!character) return null;

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
                    
                    <Panel title="Physical & Birth Details">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <Input label="Height (cm)" path="Size.Height" type="number" value={character.Size?.Height || 0} onChange={handleChange} />
                            <Input label="Weight (kg)" path="Size.Weight" type="number" value={character.Size?.Weight || 0} onChange={handleChange} />
                            <Input label="IQ" path="IQ" type="number" value={character.IQ || 100} onChange={handleChange} />
                            <Input label="Birth Date" path="Birth.BirthDateTime" type="date" value={(character.Birth?.BirthDateTime || '').split('T')[0]} onChange={handleChange} />
                            <Input label="Birth City" path="Birth.BornCity" value={character.Birth?.BornCity || ''} onChange={handleChange} />
                            <Input label="Birth Country" path="Birth.BornCountry" value={character.Birth?.BornCountry || ''} onChange={handleChange} />
                        </div>
                    </Panel>

                    <Panel title="Traits">
                        <EnhancedTextArrayInput title="Personality" field="Personality" value={character.Personality || []} onChange={handleChange} charId={character.id!} />
                        <EnhancedTextArrayInput title="Advantages" field="Advantages" value={character.Advantages || []} onChange={handleChange} charId={character.id!} />
                        <EnhancedTextArrayInput title="Disadvantages" field="Disadvantages" value={character.Disadvantages || []} onChange={handleChange} charId={character.id!} />
                    </Panel>

                     <Panel title="Abilities">
                        <EnhancedTextArrayInput title="Skills" field="Skills" value={character.Skills || []} onChange={handleChange} charId={character.id!} />
                        <EnhancedTextArrayInput title="Talents" field="Talents" value={character.Talents || []} onChange={handleChange} charId={character.id!} />
                        <TextArrayInput title="Languages" field="Languages" value={character.Languages || []} onChange={handleChange} />
                    </Panel>
                    
                    <Panel title="Backstory & Notes">
                        <TextArrayInput title="Backstory" field="Story" value={character.Story || []} onChange={handleChange} />
                         <div className="mt-4 pt-4 border-t border-border-light dark:border-border-dark">
                           <TextArrayInput title="Notes" field="Notes" value={character.Notes || []} onChange={handleChange} />
                        </div>
                    </Panel>

                    <Panel title="Appearance">
                        <TextArrayInput title="Naked Appearance & Comfort" field="Naked" value={character.Naked || []} onChange={handleChange} />
                    </Panel>

                    <Panel title="Relationships">
                        <ComplexListEditor
                            items={character.Relations || []}
                            field="Relations"
                            onAddItem={handleAddItem}
                            onRemoveItem={handleRemoveItem}
                            onChange={handleChange}
                            renderItem={(item: any, index: number) => (
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                    <Input label="Relation" path={`Relations[${index}].Relation`} value={item.Relation} onChange={handleChange} />
                                    <Input label="First Name" path={`Relations[${index}].FirstName`} value={item.FirstName} onChange={handleChange} />
                                    <Input label="Last Name" path={`Relations[${index}].LastName`} value={item.LastName} onChange={handleChange} />
                                    <Input label="Race" path={`Relations[${index}].Race`} value={item.Race} onChange={handleChange} />
                                    <Input label="Gender" path={`Relations[${index}].Gender`} value={item.Gender} onChange={handleChange} />
                                </div>
                            )}
                        />
                    </Panel>
                    
                     <Panel title="Possessions & Wardrobe">
                        <EnhancedComplexListEditor
                            title="Possessions"
                            items={character.Possessions || []}
                            field="Possessions"
                            charId={character.id!}
                            onAddItem={handleAddItem}
                            onRemoveItem={handleRemoveItem}
                            onChange={handleChange}
                            renderItem={(item: any, index: number) => (
                                <>
                                    <Input label="Item Type" path={`Possessions[${index}].ItemType`} value={item.ItemType} onChange={handleChange} />
                                    <TextArrayInput title="Description" field={`Possessions[${index}].Description`} value={item.Description} onChange={handleChange} small />
                                </>
                            )}
                        />
                        <div className="mt-4 pt-4 border-t border-border-light dark:border-border-dark">
                            <EnhancedComplexListEditor
                                title="Wardrobe"
                                items={character.Dresses || []}
                                field="Dresses"
                                charId={character.id!}
                                onAddItem={handleAddItem}
                                onRemoveItem={handleRemoveItem}
                                onChange={handleChange}
                                renderItem={(item: any, index: number) => (
                                    <>
                                        <Input label="Usage (e.g., Casual, Formal)" path={`Dresses[${index}].Usage.0`} value={item.Usage?.[0]} onChange={handleChange} />
                                        <ComplexListEditor
                                            items={item.Items || []}
                                            field={`Dresses[${index}].Items`}
                                            hideTitle
                                            onAddItem={(_field: any) => {
                                                const currentDresses = character?.Dresses || [];
                                                const newDresses = [...currentDresses];
                                                newDresses[index].Items = [...(newDresses[index].Items || []), {Type: "", Color: null, Style: null, Fabric: null, Size: null, Fit: null}];
                                                handleChange('Dresses', newDresses);
                                            }}
                                            onRemoveItem={(_field: any, subIndex: number) => {
                                                const currentDresses = character?.Dresses || [];
                                                const newDresses = [...currentDresses];
                                                newDresses[index].Items = newDresses[index].Items.filter((_: any, i: number) => i !== subIndex);
                                                handleChange('Dresses', newDresses);
                                            }}
                                            onChange={handleChange}
                                            renderItem={(subItem: any, subIndex: number) => (
                                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                                                    <Input label="Type" path={`Dresses[${index}].Items[${subIndex}].Type`} value={subItem.Type || ''} onChange={handleChange} />
                                                    <Input label="Color" path={`Dresses[${index}].Items[${subIndex}].Color`} value={subItem.Color || ''} onChange={handleChange} />
                                                    <Input label="Style" path={`Dresses[${index}].Items[${subIndex}].Style`} value={subItem.Style || ''} onChange={handleChange} />
                                                    <Input label="Fabric" path={`Dresses[${index}].Items[${subIndex}].Fabric`} value={subItem.Fabric || ''} onChange={handleChange} />
                                                    <Input label="Size" path={`Dresses[${index}].Items[${subIndex}].Size`} value={subItem.Size || ''} onChange={handleChange} />
                                                    <Input label="Fit" path={`Dresses[${index}].Items[${subIndex}].Fit`} value={subItem.Fit || ''} onChange={handleChange} />
                                                </div>
                                            )}
                                        />
                                    </>
                                )}
                            />
                        </div>
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