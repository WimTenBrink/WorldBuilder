

import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Character, BodyPart } from '../../types';
import CharacterImage from './CharacterImage';

// --- Helper Functions & Components ---

const cmToFtIn = (cm: number): string => {
    if (!cm || typeof cm !== 'number') return 'N/A';
    const inchesTotal = cm / 2.54;
    const feet = Math.floor(inchesTotal / 12);
    const inches = Math.round(inchesTotal % 12);
    return `${feet}' ${inches}"`;
};

const kgToLbs = (kg: number): string => {
    if (!kg || typeof kg !== 'number') return 'N/A';
    return `${Math.round(kg * 2.20462)} lbs`;
};

const Section: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className = '' }) => (
    <div className={`bg-surface-light dark:bg-surface-dark p-4 rounded-lg border border-border-light dark:border-border-dark shadow-sm break-inside-avoid-column ${className}`}>
        <h3 className="text-lg font-bold text-primary-light dark:text-primary-dark mb-3 pb-2 border-b border-border-light dark:border-border-dark">{title}</h3>
        {children}
    </div>
);

// This is the single, robust component for rendering any piece of data safely.
const Detail: React.FC<{ label?: string; value: any; className?: string, inline?: boolean, isExportingPdf?: boolean }> = ({ label, value, className, inline = false, isExportingPdf = false }) => {
    
    const renderValue = (val: any): React.ReactNode => {
        if (val === null || val === undefined) {
            return <span className="italic text-text-secondary-light dark:text-text-secondary-dark">Not specified</span>;
        }
        if (React.isValidElement(val)) {
            return val;
        }
        if (Array.isArray(val)) {
            if (val.length === 0) return <span className="italic text-text-secondary-light dark:text-text-secondary-dark">None</span>;
            
            const firstItem = val[0];
            if (typeof firstItem === 'object' && firstItem !== null) {
                // BodyParts array: [{ Name: 'Eyes', Details: [...] }]
                if ('Name' in firstItem && 'Details' in firstItem) {
                    return (
                        <div className="space-y-3">
                            {(val as BodyPart[]).map(part => (
                                <Detail key={part.Name} label={part.Name} value={part.Details} isExportingPdf={isExportingPdf} />
                            ))}
                        </div>
                    );
                }
                // BodyParts' Details array: [{ Name: 'Color', Descriptions: ['Blue'] }]
                if ('Name' in firstItem && 'Descriptions' in firstItem) {
                    return (
                        <ul className="list-none p-0 m-0 space-y-1 text-sm text-text-primary-light dark:text-text-primary-dark">
                            {val.map((item: any, index: number) => (
                                <li key={index}>
                                    <span className="font-semibold">{item.Name}:</span> {item.Descriptions.join(' ')}
                                </li>
                            ))}
                        </ul>
                    );
                }
                // Possessions array: [{ ItemType: '...', Description: ['...'] }]
                if ('ItemType' in firstItem && 'Description' in firstItem) {
                    return (
                        <ul className="list-disc list-inside text-sm text-text-primary-light dark:text-text-primary-dark space-y-1 mt-1">
                            {val.map((item: any, index: number) => (
                                <li key={index}>
                                    <span className="font-semibold">{item.ItemType}:</span> {item.Description.join(' ')}
                                </li>
                            ))}
                        </ul>
                    );
                }
                // BodyMarks array: [{ Name: '...', Location: '...', ... }]
                if ('Name' in firstItem && 'Location' in firstItem && 'Description' in firstItem) {
                    return (
                        <ul className="list-disc list-inside text-sm text-text-primary-light dark:text-text-primary-dark space-y-1 mt-1">
                            {val.map((item: any, index: number) => (
                                <li key={index}>
                                    <span className="font-semibold">{item.Name}</span> on {item.Location}: {item.Description}
                                    {item.Details && item.Details.length > 0 && ` (${item.Details.join(', ')})`}
                                </li>
                            ))}
                        </ul>
                    );
                }
                // Dresses array: [{ Usage: ['...'], Items: [...] }]
                if ('Usage' in firstItem && 'Items' in firstItem) {
                    return (
                       <div className="space-y-3">
                           {val.map((dress: any, index: number) => (
                               <div key={index}>
                                   <h4 className="font-semibold text-text-secondary-light dark:text-text-secondary-dark text-xs uppercase tracking-wider">{dress.Usage.join(', ')}</h4>
                                   <ul className="list-disc list-inside pl-1 text-sm text-text-primary-light dark:text-text-primary-dark space-y-1 mt-1">
                                       {dress.Items.map((item: any, itemIndex: number) => {
                                           const details = [
                                               [item.Color, item.Type].filter(Boolean).join(' '),
                                               item.Fabric,
                                               item.Style,
                                               item.Size ? `size ${item.Size}` : '',
                                               item.Fit ? `${item.Fit} fit` : ''
                                           ].filter(Boolean).join(', ');
                                           return <li key={itemIndex}>{details || 'Unspecified item'}</li>
                                       })}
                                   </ul>
                               </div>
                           ))}
                       </div>
                    );
                }
            }

            // Handle simple string arrays as tags
            if (typeof firstItem === 'string') {
                 if (['Story', 'Notes', 'Naked'].includes(label || '')) {
                     return val.map((p, i) => <p key={i} className="my-1 last:my-0 text-sm text-text-primary-light dark:text-text-primary-dark">{p}</p>);
                 }
                 const tagClass = isExportingPdf
                    ? 'bg-slate-200 text-slate-800' // Force light theme for PDF
                    : 'bg-slate-200 dark:bg-slate-700 text-text-secondary-light dark:text-text-secondary-dark';

                return (
                    <div className="flex flex-wrap gap-1 mt-1">
                        {val.map((item, index) => (
                            <span key={index} className={`${tagClass} text-xs font-medium px-2 py-0.5 rounded-full`}>
                                {item}
                            </span>
                        ))}
                    </div>
                );
            }
            
            // Fallback for arrays with other primitives (e.g., numbers)
            return val.join(', ');
        }
        if (typeof val === 'object') {
            // Favorites object: { FavoriteAnimal: '...', ... }
            if ('FavoriteAnimal' in val || 'FavoriteColor' in val) {
                const entries = Object.entries(val).filter(([_, value]) => value !== null && value !== undefined && value !== '');
                if (entries.length === 0) {
                    return <span className="italic text-text-secondary-light dark:text-text-secondary-dark">Not specified</span>;
                }
                return (
                     <ul className="list-disc list-inside text-sm text-text-primary-light dark:text-text-primary-dark space-y-1 mt-1">
                        {entries.map(([key, value]) => (
                            <li key={key}>
                                <span className="font-semibold">{key.replace('Favorite', '')}:</span> {String(value)}
                            </li>
                        ))}
                    </ul>
                );
            }
            
            const entries = Object.entries(val);
            if (entries.length === 0) {
                return <span className="italic text-text-secondary-light dark:text-text-secondary-dark">Not specified</span>;
            }
            // Generic object rendering
            return (
                <dl className="space-y-1 mt-1">
                    {entries.map(([key, value]) => (
                        <div key={key}>
                            <dt className="inline text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</dt>
                            <dd className="inline pl-2 text-sm text-text-primary-light dark:text-text-primary-dark">{renderValue(value)}</dd>
                        </div>
                    ))}
                </dl>
            );
        }
        
        return String(val);
    };

    const renderedValue = renderValue(value);

    if (!label) {
        return <div className={`text-sm text-text-primary-light dark:text-text-primary-dark ${className}`}>{renderedValue}</div>;
    }

    if (inline) {
        return (
            <div className={className}>
                <dt className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider inline-block mr-2">{label}:</dt>
                <dd className="inline text-sm text-text-primary-light dark:text-text-primary-dark">{renderedValue}</dd>
            </div>
        );
    }
    
    return (
        <div className={className}>
            <dt className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">{label}</dt>
            <dd className="mt-1 text-sm text-text-primary-light dark:text-text-primary-dark">{renderedValue}</dd>
        </div>
    );
};


// --- Main Component ---

const CharacterSheet: React.FC = () => {
    const { selectedCharacterId, characters, isNsfwMode, isExportingPdf } = useAppContext();
    const c = selectedCharacterId ? characters[selectedCharacterId] : null;

    if (!c) {
        return <div className="p-8 text-center">Character not found or not selected.</div>;
    }
    
    const safeStr = (val: any) => val === null || val === undefined ? '' : String(val);

    // Define body part categories
    const headPartNames = ['hair', 'head', 'eyes', 'nose', 'ears', 'mouth', 'neck'];
    const torsoPartNames = ['shoulders', 'chest', 'abdomen', 'hip', 'breasts'];
    const limbPartNames = ['arms', 'hands', 'nails', 'legs', 'feet'];
    const privatePartNames = ['genitals', 'cupsize', 'pubichair', 'penis', 'vagina', 'clitoris', 'anus', 'nipples', 'areolae'];
    
    const allCategorized = new Set([...headPartNames, ...torsoPartNames, ...limbPartNames, ...privatePartNames]);
    
    // Filter body parts into their respective categories
    const bodyParts = c.BodyParts || [];
    const headParts = bodyParts.filter(p => headPartNames.includes(p.Name.toLowerCase()));
    let torsoParts = bodyParts.filter(p => torsoPartNames.includes(p.Name.toLowerCase()));
    const limbParts = bodyParts.filter(p => limbPartNames.includes(p.Name.toLowerCase()));
    const privateParts = bodyParts.filter(p => privatePartNames.includes(p.Name.toLowerCase()));
    const otherParts = bodyParts.filter(p => !allCategorized.has(p.Name.toLowerCase()));
    
    // In non-NSFW mode, filter sensitive parts out of the Torso section
    if (!isNsfwMode) {
        const nsfwTorsoNames = ['breasts'];
        torsoParts = torsoParts.filter(p => !nsfwTorsoNames.includes(p.Name.toLowerCase()));
    }


    return (
        <div id={`character-sheet-${c.id}`} className="p-4 md:p-6 h-full overflow-y-auto bg-background-light dark:bg-background-dark font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row items-center md:items-stretch gap-6 mb-6">
                    <div className="flex-shrink-0 w-full md:w-1/3 lg:w-1/4">
                        <CharacterImage />
                    </div>
                    <div className="flex-grow bg-surface-light dark:bg-surface-dark p-6 rounded-lg border border-border-light dark:border-border-dark w-full">
                        <h1 className="text-3xl lg:text-4xl font-bold text-text-primary-light dark:text-text-primary-dark tracking-tight">{`${safeStr(c.Name?.FirstName)} ${safeStr(c.Name?.LastName)}`}</h1>
                        <p className="text-lg text-primary-light dark:text-primary-dark mt-1">{safeStr(c.Name?.Race)}</p>
                        <dl className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            <Detail label="Age" value={c.Age} isExportingPdf={isExportingPdf} />
                            <Detail label="Gender" value={c.Name?.Gender} isExportingPdf={isExportingPdf} />
                            <Detail label="Height" value={<>{c.Size?.Height} cm <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">({cmToFtIn(c.Size?.Height)})</span></>} isExportingPdf={isExportingPdf} />
                            <Detail label="Weight" value={<>{c.Size?.Weight} kg <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">({kgToLbs(c.Size?.Weight)})</span></>} isExportingPdf={isExportingPdf} />
                            <Detail label="Pronouns" value={c.Pronouns} isExportingPdf={isExportingPdf} />
                            <Detail label="Sexuality" value={c.Sexuality} isExportingPdf={isExportingPdf} />
                            <Detail label="Residence" value={c.Residence} isExportingPdf={isExportingPdf} />
                            <Detail label="Date of Birth" value={c.Birth?.BirthDateTime ? new Date(c.Birth.BirthDateTime).toLocaleDateString() : 'N/A'} isExportingPdf={isExportingPdf} />
                            <Detail label="Birthplace" value={c.Birth ? `${safeStr(c.Birth.BornCity)}, ${safeStr(c.Birth.BornCountry)}` : 'N/A'} isExportingPdf={isExportingPdf} />
                            <Detail label="Nationality" value={c.Birth?.Nationality} isExportingPdf={isExportingPdf} />
                            <Detail label="IQ" value={c.IQ} isExportingPdf={isExportingPdf} />
                        </dl>
                    </div>
                </header>

                <main className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                    <Section title="World & Meta">
                        <dl className="space-y-3">
                           <Detail label="World(s)" value={c.Worlds} isExportingPdf={isExportingPdf} />
                           <Detail label="Data Version" value={c.Version} isExportingPdf={isExportingPdf} />
                           <Detail label="Created" value={new Date(c.Created).toLocaleString()} isExportingPdf={isExportingPdf} />
                        </dl>
                    </Section>

                    <Section title="Backstory"><Detail label="Story" value={c.Story} isExportingPdf={isExportingPdf} /></Section>
                    <Section title="Notes"><Detail label="Notes" value={c.Notes} isExportingPdf={isExportingPdf} /></Section>
                    {isNsfwMode && <Section title="Naked Appearance"><Detail label="Naked" value={c.Naked} isExportingPdf={isExportingPdf} /></Section>}
                    <Section title="Personality"><Detail value={c.Personality} isExportingPdf={isExportingPdf} /></Section>
                    <Section title="Advantages"><Detail value={c.Advantages} isExportingPdf={isExportingPdf} /></Section>
                    <Section title="Disadvantages"><Detail value={c.Disadvantages} isExportingPdf={isExportingPdf} /></Section>
                    <Section title="Skills"><Detail value={c.Skills} isExportingPdf={isExportingPdf} /></Section>
                    <Section title="Talents"><Detail value={c.Talents} isExportingPdf={isExportingPdf} /></Section>
                    <Section title="Languages"><Detail value={c.Languages} isExportingPdf={isExportingPdf} /></Section>

                    {headParts.length > 0 && <Section title="Head & Neck"><Detail value={headParts} isExportingPdf={isExportingPdf} /></Section>}
                    {torsoParts.length > 0 && <Section title="Torso"><Detail value={torsoParts} isExportingPdf={isExportingPdf} /></Section>}
                    {limbParts.length > 0 && <Section title="Limbs"><Detail value={limbParts} isExportingPdf={isExportingPdf} /></Section>}
                    {otherParts.length > 0 && <Section title="General Physical Details"><Detail value={otherParts} isExportingPdf={isExportingPdf} /></Section>}
                    {isNsfwMode && privateParts.length > 0 && <Section title="Private Details"><Detail value={privateParts} isExportingPdf={isExportingPdf} /></Section>}

                    <Section title="Body Marks">
                         <Detail value={c.BodyMarks} isExportingPdf={isExportingPdf} />
                    </Section>

                    <Section title="Favorites">
                        <Detail value={c.Favorites} isExportingPdf={isExportingPdf} />
                    </Section>

                    <Section title="Occupation">
                       <Detail value={c.Employer} isExportingPdf={isExportingPdf} />
                    </Section>

                    <Section title="Key Possessions">
                        <Detail value={c.Possessions} isExportingPdf={isExportingPdf} />
                    </Section>
                    
                     <Section title="Wardrobe">
                        <Detail value={c.Dresses} isExportingPdf={isExportingPdf} />
                    </Section>

                    {c.Relations && c.Relations.length > 0 && (
                        <Section title="Relationships">
                            <div className="space-y-2">
                                {c.Relations.map((r: any, i: number) => (
                                    <div key={i} className="p-2 rounded-md bg-slate-100 dark:bg-slate-900/50">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold text-text-primary-light dark:text-text-primary-dark">{`${safeStr(r.FirstName)} ${safeStr(r.LastName)}`}</p>
                                                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">{`${safeStr(r.Race)} / ${safeStr(r.Gender)}`}</p>
                                            </div>
                                            <span className="text-sm font-medium text-primary-light dark:text-primary-dark flex-shrink-0 ml-2 text-right">{r.Relation}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    )}
                </main>
            </div>
        </div>
    );
};

export default CharacterSheet;