

import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { World, Country, City } from '../../types';
import WorldHeaderImage from './WorldHeaderImage';

const Section: React.FC<{ title: string; children: React.ReactNode; className?: string, id?: string }> = ({ title, children, className = '', id }) => (
    <div id={id} className={`bg-surface-light dark:bg-surface-dark p-4 rounded-lg border border-border-light dark:border-border-dark shadow-sm break-inside-avoid-column ${className}`}>
        <h3 className="text-lg font-bold text-primary-light dark:text-primary-dark mb-3 pb-2 border-b border-border-light dark:border-border-dark">{title}</h3>
        {children}
    </div>
);

const Detail: React.FC<{ label?: string; value: any; className?: string, isList?: boolean }> = ({ label, value, className, isList }) => {
    const renderValue = (val: any): React.ReactNode => {
        if (val === null || val === undefined) {
            return <span className="italic text-text-secondary-light dark:text-text-secondary-dark">Not specified</span>;
        }
        if (Array.isArray(val)) {
            if (val.length === 0) return <span className="italic text-text-secondary-light dark:text-text-secondary-dark">None</span>;
            return (
                <ul className="list-disc list-inside space-y-1 mt-1">
                    {val.map((item, index) => <li key={index}>{typeof item === 'object' ? JSON.stringify(item) : item}</li>)}
                </ul>
            );
        }
        return String(val);
    };

    if (!label) {
        return <div className={`text-sm text-text-primary-light dark:text-text-primary-dark ${className}`}>{renderValue(value)}</div>;
    }

    return (
        <div className={className}>
            <dt className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">{label}</dt>
            <dd className={`mt-1 text-sm text-text-primary-light dark:text-text-primary-dark ${isList ? 'pl-2' : ''}`}>{renderValue(value)}</dd>
        </div>
    );
};


const WorldSheet: React.FC = () => {
    const { world } = useAppContext();

    if (!world) {
        return <div className="p-8 text-center">No world data available.</div>;
    }

    return (
        <div id="world-sheet" className="p-4 md:p-6 h-full overflow-y-auto bg-background-light dark:bg-background-dark font-sans">
            <div className="max-w-7xl mx-auto">
                <WorldHeaderImage />
                <header className="mb-6 pb-4 border-b-2 border-border-light dark:border-border-dark">
                    <h1 className="text-4xl font-bold text-text-primary-light dark:text-text-primary-dark">{world.name}</h1>
                    <p className="text-lg text-primary-light dark:text-primary-dark mt-1">{world.style}</p>
                </header>
                
                <main className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                    <Section title="Core Information" id="core">
                        <dl className="space-y-3">
                            <Detail label="Technology Level" value={world.technologyLevel} />
                            <Detail label="Calendar" value={`${world.calendar?.name}: ${world.calendar?.details}`} />
                        </dl>
                    </Section>
                    
                    <Section title="Celestial Objects" id="celestial">
                        <dl className="space-y-3">
                            <Detail label="Stars" value={world.celestialObjects?.stars?.map(s => `${s.name}: ${s.description}`)} isList />
                            <Detail label="Planets" value={world.celestialObjects?.planets?.map(p => `${p.name}: ${p.description}`)} isList />
                            <Detail label="Moons" value={world.celestialObjects?.moons?.map(m => `${m.name}: ${m.description}`)} isList />
                            <Detail label="Constellations" value={world.celestialObjects?.constellations?.map(c => `${c.name}: ${c.description}`)} isList />
                        </dl>
                    </Section>

                    <Section title="Geography" id="geography">
                        <dl className="space-y-3">
                            <Detail label="Oceans" value={world.geography?.oceans?.map(o => `${o.name}: ${o.description}`)} isList />
                            <Detail label="Seas" value={world.geography?.seas?.map(s => `${s.name}: ${s.description}`)} isList />
                            <Detail label="Rivers" value={world.geography?.rivers?.map(r => `${r.name}: ${r.description}`)} isList />
                            <Detail label="Major Landmarks" value={world.geography?.landmarks?.map(l => `${l.name} (${l.type}) at ${l.location}: ${l.description}`)} isList />
                        </dl>
                    </Section>

                    {world.countries?.map(country => (
                        <Section key={country.name} title={country.name} id={`country-${country.name.replace(/\s/g, '-')}`}>
                            <dl className="space-y-3">
                                <Detail label="Political System" value={country.politicalSystem} />
                                <Detail label="Diplomatic Relations" value={country.diplomaticRelations?.map(r => `${r.with} (${r.status})`)} isList />
                            </dl>
                             {(country.cities?.length ?? 0) > 0 && (
                                <div className="mt-4 pt-3 border-t border-border-light dark:border-border-dark">
                                    <h4 className="text-md font-semibold text-text-secondary-light dark:text-text-secondary-dark mb-2">Cities</h4>
                                    {country.cities?.map(city => (
                                        <div key={city.name} className="p-2 rounded-md bg-slate-100 dark:bg-slate-900/50 mb-2">
                                            <p className="font-semibold text-text-primary-light dark:text-text-primary-dark">{city.name} {city.isCapital && '(Capital)'}</p>
                                            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">{city.politicalSystem}</p>
                                            {(city.villages?.length ?? 0) > 0 && (
                                                <ul className="text-xs list-disc list-inside pl-2 mt-1 text-text-secondary-light dark:text-text-secondary-dark">
                                                    {city.villages?.map(village => <li key={village.name}>{village.name}</li>)}
                                                </ul>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Section>
                    ))}
                </main>
            </div>
        </div>
    );
};

export default WorldSheet;