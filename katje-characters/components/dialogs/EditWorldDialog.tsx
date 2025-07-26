
import React, { useState, useEffect, useCallback } from 'react';
import Dialog from '../ui/Dialog';
import { useAppContext } from '../../context/AppContext';
import { DialogType, World } from '../../types';
import SaveIcon from '../icons/SaveIcon';
import CancelIcon from '../icons/CancelIcon';
import Accordion from '../ui/Accordion';
import EditableTextarea from '../ui/EditableTextarea';

// --- Type definitions for list items ---
type ListField = 'stars' | 'planets' | 'moons' | 'constellations' | 'oceans' | 'seas' | 'rivers' | 'landmarks' | 'countries' | 'diplomaticRelations' | 'cities' | 'villages';

const getNewListItem = (listField: ListField, path: string): any => {
    if (path.includes('celestialObjects')) {
        return { name: '', description: '' };
    }
    if (path.includes('geography')) {
        if (listField === 'landmarks') return { name: '', type: '', location: '', description: '' };
        return { name: '', description: '' };
    }
    if (listField === 'countries') return { name: '', politicalSystem: '', diplomaticRelations: [], cities: [] };
    if (listField === 'cities') return { name: '', isCapital: false, politicalSystem: '', villages: [] };
    if (listField === 'villages') return { name: '', nearestTown: '', politicalSystem: '' };
    if (listField === 'diplomaticRelations') return { with: '', status: '' };
    return {};
};

const EditWorldDialog: React.FC = () => {
    const { openDialog, showDialog, world: initialWorld, updateWorld } = useAppContext();
    const [world, setWorld] = useState<Partial<World> | null>(null);

    useEffect(() => {
        if (openDialog === DialogType.EDIT_WORLD && initialWorld) {
            setWorld(JSON.parse(JSON.stringify(initialWorld)));
        } else {
            setWorld(null);
        }
    }, [openDialog, initialWorld]);

    const handleChange = useCallback((path: string, value: any) => {
        setWorld(prev => {
            if (!prev) return null;
            const newWorld = JSON.parse(JSON.stringify(prev));
            let current: any = newWorld;
            const keys = path.split('.');
            keys.forEach((key, index) => {
                const arrayMatch = key.match(/(\w+)\[(\d+)\]/);
                if (index === keys.length - 1) {
                    if (arrayMatch) {
                         current[arrayMatch[1]][parseInt(arrayMatch[2], 10)] = value;
                    } else {
                        current[key] = value;
                    }
                } else {
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
            return newWorld;
        });
    }, []);
    
    const handleListChange = (path: string, list: any[]) => {
        handleChange(path, list);
    };

    const handleSave = () => {
        if (world) {
            updateWorld(world);
        }
        showDialog(null);
    };

    if (!world) return null;

    return (
        <Dialog isOpen={openDialog === DialogType.EDIT_WORLD} onClose={() => showDialog(null)} title={`Edit World: ${world.name}`}>
            <div className="columns-1 lg:columns-2 xl:columns-3 gap-4 space-y-4">
                <Panel title="Core Details">
                    <Input label="World Name" path="name" value={world.name || ''} onChange={handleChange} />
                    <Input label="Style" path="style" value={world.style || ''} placeholder="e.g., Fantasy, Modern Earth" onChange={handleChange}/>
                    <Input label="Technology Level" path="technologyLevel" value={world.technologyLevel || ''} onChange={handleChange}/>
                    <Input label="Calendar Name" path="calendar.name" value={world.calendar?.name || ''} onChange={handleChange}/>
                    <EditableTextarea label="Calendar Details" value={world.calendar?.details || ''} onChange={(value) => handleChange('calendar.details', value)} />
                </Panel>

                <Panel title="Celestial Objects">
                    <ListEditor title="Stars" list={world.celestialObjects?.stars || []} path="celestialObjects.stars" field="stars" onListChange={handleListChange} renderItem={(item, index, path) => (<><Input label="Name" path={`${path}.name`} value={item.name} onChange={handleChange} /><EditableTextarea label="Description" value={item.description} onChange={(v) => handleChange(`${path}.description`, v)} /></>)} />
                    <ListEditor title="Planets" list={world.celestialObjects?.planets || []} path="celestialObjects.planets" field="planets" onListChange={handleListChange} renderItem={(item, index, path) => (<><Input label="Name" path={`${path}.name`} value={item.name} onChange={handleChange} /><EditableTextarea label="Description" value={item.description} onChange={(v) => handleChange(`${path}.description`, v)} /></>)} />
                    <ListEditor title="Moons" list={world.celestialObjects?.moons || []} path="celestialObjects.moons" field="moons" onListChange={handleListChange} renderItem={(item, index, path) => (<><Input label="Name" path={`${path}.name`} value={item.name} onChange={handleChange} /><EditableTextarea label="Description" value={item.description} onChange={(v) => handleChange(`${path}.description`, v)} /></>)} />
                    <ListEditor title="Constellations" list={world.celestialObjects?.constellations || []} path="celestialObjects.constellations" field="constellations" onListChange={handleListChange} renderItem={(item, index, path) => (<><Input label="Name" path={`${path}.name`} value={item.name} onChange={handleChange} /><EditableTextarea label="Description" value={item.description} onChange={(v) => handleChange(`${path}.description`, v)} /></>)} />
                </Panel>

                 <Panel title="Geography">
                    <ListEditor title="Oceans" list={world.geography?.oceans || []} path="geography.oceans" field="oceans" onListChange={handleListChange} renderItem={(item, index, path) => (<><Input label="Name" path={`${path}.name`} value={item.name} onChange={handleChange} /><EditableTextarea label="Description" value={item.description} onChange={(v) => handleChange(`${path}.description`, v)} /></>)} />
                    <ListEditor title="Seas" list={world.geography?.seas || []} path="geography.seas" field="seas" onListChange={handleListChange} renderItem={(item, index, path) => (<><Input label="Name" path={`${path}.name`} value={item.name} onChange={handleChange} /><EditableTextarea label="Description" value={item.description} onChange={(v) => handleChange(`${path}.description`, v)} /></>)} />
                    <ListEditor title="Rivers" list={world.geography?.rivers || []} path="geography.rivers" field="rivers" onListChange={handleListChange} renderItem={(item, index, path) => (<><Input label="Name" path={`${path}.name`} value={item.name} onChange={handleChange} /><EditableTextarea label="Description" value={item.description} onChange={(v) => handleChange(`${path}.description`, v)} /></>)} />
                    <ListEditor title="Landmarks" list={world.geography?.landmarks || []} path="geography.landmarks" field="landmarks" onListChange={handleListChange} renderItem={(item, index, path) => (<div className="grid grid-cols-2 gap-2"><Input label="Name" path={`${path}.name`} value={item.name} onChange={handleChange} /><Input label="Type" path={`${path}.type`} value={item.type} onChange={handleChange} /><div className="col-span-2"><Input label="Location" path={`${path}.location`} value={item.location} onChange={handleChange} /></div><div className="col-span-2"><EditableTextarea label="Description" value={item.description} onChange={(v) => handleChange(`${path}.description`, v)} /></div></div>)} />
                </Panel>

                <Panel title="Countries">
                    <ListEditor
                        title="Countries"
                        list={world.countries || []}
                        path="countries"
                        field="countries"
                        onListChange={handleListChange}
                        renderItem={(country, cIndex, cPath) => (
                            <Accordion title={country.name || `Country ${cIndex + 1}`}>
                                <div className="space-y-4 p-2">
                                    <Input label="Country Name" path={`${cPath}.name`} value={country.name} onChange={handleChange} />
                                    <Input label="Political System" path={`${cPath}.politicalSystem`} value={country.politicalSystem} onChange={handleChange} />
                                    <ListEditor title="Diplomatic Relations" list={country.diplomaticRelations} path={`${cPath}.diplomaticRelations`} field="diplomaticRelations" onListChange={(newList) => handleChange(`${cPath}.diplomaticRelations`, newList)} renderItem={(rel, rIndex, rPath) => (<div className="grid grid-cols-2 gap-2"><Input label="With" path={`${rPath}.with`} value={rel.with} onChange={handleChange} /><Input label="Status" path={`${rPath}.status`} value={rel.status} onChange={handleChange} /></div>)} />
                                    <ListEditor title="Cities" list={country.cities} path={`${cPath}.cities`} field="cities" onListChange={(newList) => handleChange(`${cPath}.cities`, newList)} renderItem={(city, cityIndex, cityPath) => (
                                         <Accordion title={city.name || `City ${cityIndex + 1}`} startOpen={false}>
                                             <div className="space-y-2 p-1">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <Input label="City Name" path={`${cityPath}.name`} value={city.name} onChange={handleChange} />
                                                    <Checkbox label="Is Capital?" path={`${cityPath}.isCapital`} value={city.isCapital} onChange={handleChange} />
                                                </div>
                                                <Input label="Political System" path={`${cityPath}.politicalSystem`} value={city.politicalSystem} onChange={handleChange} />
                                                <ListEditor title="Villages" list={city.villages} path={`${cityPath}.villages`} field="villages" onListChange={(newList) => handleChange(`${cityPath}.villages`, newList)} renderItem={(village, vIndex, vPath) => (<div className="grid grid-cols-2 gap-2"><Input label="Village Name" path={`${vPath}.name`} value={village.name} onChange={handleChange} /><Input label="Nearest Town" path={`${vPath}.nearestTown`} value={village.nearestTown} onChange={handleChange} /><div className="col-span-2"><Input label="Political System" path={`${vPath}.politicalSystem`} value={village.politicalSystem} onChange={handleChange} /></div></div>)} />
                                             </div>
                                         </Accordion>
                                    )} />
                                </div>
                            </Accordion>
                        )}
                    />
                </Panel>
            </div>
             <footer className="flex justify-end gap-4 p-4 mt-6 border-t border-border-light dark:border-border-dark flex-shrink-0 bg-surface-light dark:bg-surface-dark">
                <button onClick={() => showDialog(null)} className="flex items-center gap-2 px-6 py-2 text-sm font-semibold rounded-md transition-colors text-text-primary-light dark:text-text-primary-dark bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500"><CancelIcon className="w-5 h-5" />Cancel</button>
                <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 text-sm font-semibold rounded-md transition-colors text-white bg-primary-light dark:bg-indigo-500 hover:bg-primary-light/90 dark:hover:bg-indigo-500/90"><SaveIcon className="w-5 h-5" />Save Changes</button>
            </footer>
        </Dialog>
    );
};

// --- Sub-components for the Editor ---

const Panel = React.memo(function Panel({title, children}: {title: string, children: React.ReactNode}) {
    return (
        <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg border border-border-light dark:border-border-dark shadow-sm break-inside-avoid">
             <h3 className="text-lg font-bold text-primary-light dark:text-primary-dark mb-3 pb-2 border-b border-border-light dark:border-border-dark">{title}</h3>
             <div className="space-y-4">
                {children}
             </div>
        </div>
    );
});

const Input = React.memo(function Input({ label, path, value, onChange, type = "text", placeholder }: { label: string; path: string; value: string | number; onChange: (path: string, value: any) => void; type?: string; placeholder?: string }) {
    return (
        <div>
            <label htmlFor={path} className="block text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">{label}</label>
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

const Checkbox = React.memo(function Checkbox({ label, path, value, onChange }: { label: string; path: string; value: boolean; onChange: (path: string, value: any) => void;}) {
    return (
        <div className="flex items-center h-full pt-4">
            <input
                id={path}
                type="checkbox"
                checked={value}
                onChange={e => onChange(path, e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary-light focus:ring-primary-light"
            />
            <label htmlFor={path} className="ml-2 block text-sm text-text-secondary-light dark:text-text-secondary-dark">{label}</label>
        </div>
    );
});

interface ListEditorProps {
    title: string;
    list: any[];
    path: string;
    field: ListField;
    onListChange: (path: string, newList: any[]) => void;
    renderItem: (item: any, index: number, path: string) => React.ReactNode;
}

const ListEditor = React.memo(function ListEditor({ title, list, path, field, onListChange, renderItem }: ListEditorProps) {
    const handleAddItem = useCallback(() => {
        const newItem = getNewListItem(field, path);
        onListChange(path, [...(list || []), newItem]);
    }, [list, path, field, onListChange]);

    const handleRemoveItem = useCallback((index: number) => {
        onListChange(path, list.filter((_, i) => i !== index));
    }, [list, path, onListChange]);

    return (
        <div className="mt-4 pt-4 border-t border-dashed border-border-light dark:border-border-dark first:mt-0 first:pt-0 first:border-t-0">
            <h4 className="text-md font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">{title}</h4>
            <div className="space-y-3">
                {(list || []).map((item, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 rounded-md bg-slate-200 dark:bg-slate-800/70 border border-border-light dark:border-border-dark">
                        <div className="flex-grow">{renderItem(item, index, `${path}[${index}]`)}</div>
                        <button onClick={() => handleRemoveItem(index)} className="p-1.5 rounded-full text-red-500 hover:bg-red-500/10 mt-1">✕</button>
                    </div>
                ))}
                <button onClick={handleAddItem} className="text-sm text-primary-light dark:text-primary-dark hover:underline">+ Add {field}</button>
            </div>
        </div>
    );
});

export default EditWorldDialog;