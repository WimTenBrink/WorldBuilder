import React from 'react';
import { useAppContext } from '../../context/AppContext';
import Accordion from '../ui/Accordion';

const WorldTableOfContents: React.FC = () => {
    const { world } = useAppContext();

    if (!world) {
        return (
            <div className="p-4 text-text-secondary-light dark:text-text-secondary-dark">
                Loading world data...
            </div>
        );
    }
    
    const scrollToId = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div className="flex flex-col h-full gap-4">
            <h2 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">World Overview</h2>
            <div className="flex-grow overflow-y-auto space-y-1 pr-1">
                <button onClick={() => scrollToId('core')} className="w-full text-left p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700/70 text-text-primary-light dark:text-text-primary-dark font-semibold">
                    Core Information
                </button>
                <button onClick={() => scrollToId('celestial')} className="w-full text-left p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700/70 text-text-primary-light dark:text-text-primary-dark font-semibold">
                    Celestial Objects
                </button>
                <button onClick={() => scrollToId('geography')} className="w-full text-left p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700/70 text-text-primary-light dark:text-text-primary-dark font-semibold">
                    Geography
                </button>
                <div className="pt-2">
                    <Accordion title="Countries" startOpen={true}>
                        <div className="flex flex-col items-start pl-2 pt-2 space-y-1">
                            {world.countries.map(country => (
                                <button key={country.name} onClick={() => scrollToId(`country-${country.name.replace(/\s/g, '-')}`)} className="w-full text-left p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700/70 text-text-primary-light dark:text-text-primary-dark">
                                    {country.name}
                                </button>
                            ))}
                        </div>
                    </Accordion>
                </div>
            </div>
            <p className="text-xs text-center text-text-secondary-light dark:text-text-secondary-dark pt-2 border-t border-border-light dark:border-border-dark">
                This is a navigable overview of the world. Click an item to scroll to it.
            </p>
        </div>
    );
};

export default WorldTableOfContents;
