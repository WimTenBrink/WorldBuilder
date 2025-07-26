import React, { useState } from 'react';
import Dialog from '../ui/Dialog';
import { useAppContext } from '../../context/AppContext';
import { DialogType } from '../../types';
import SendIcon from '../icons/SendIcon';

const PREDEFINED_EVENTS = [
    "A sudden power outage plunges the office into darkness.",
    "The coffee machine breaks down, sparking a mini-crisis.",
    "A mysterious package arrives addressed to 'The Funniest Person in the Office'.",
    "The fire alarm goes off, but it's just a drill.",
    "Someone brings in a box of donuts, but they're all plain.",
    "The internet goes down for an hour.",
    "A famous celebrity is spotted walking past the office window.",
    "The CEO announces a surprise team-building trip to a tropical island.",
    "A pigeon flies into the office through an open window.",
    "The office plants are suddenly replaced with cacti.",
    "A memo is distributed announcing 'Mandatory Fun Friday'.",
    "Someone starts playing loud polka music from their computer.",
    "The heating system breaks and the office becomes freezing cold.",
    "A professional-looking film crew shows up and starts filming without explanation.",
    "Everyone receives an anonymous, cryptic note on their desk.",
];

const RandomEventDialog: React.FC = () => {
    const { openDialog, showDialog, sendEventMessage } = useAppContext();
    const [customEvent, setCustomEvent] = useState('');

    const handleSubmit = (eventText: string) => {
        if (!eventText.trim()) return;
        sendEventMessage(eventText.trim());
        showDialog(null);
        setCustomEvent('');
    };

    return (
        <Dialog
            isOpen={openDialog === DialogType.RANDOM_EVENT}
            onClose={() => showDialog(null)}
            title="Trigger a Random Event"
        >
            <div className="flex flex-col h-full gap-6 text-text-primary-light dark:text-text-primary-dark">
                <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold mb-2 text-primary-light dark:text-primary-dark">Predefined Events</h3>
                        <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2">
                            {PREDEFINED_EVENTS.map((event, index) => (
                                <button 
                                    key={index} 
                                    onClick={() => handleSubmit(event)} 
                                    className="w-full text-left p-3 rounded-lg bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                >
                                    {event}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex-shrink-0 pt-6 border-t border-border-light dark:border-border-dark">
                    <h3 className="text-lg font-semibold mb-2 text-primary-light dark:text-primary-dark">Or Create a Custom Event</h3>
                    <div className="relative">
                        <textarea 
                            value={customEvent} 
                            onChange={(e) => setCustomEvent(e.target.value)}
                            rows={3}
                            className="w-full p-3 pr-28 resize-none border rounded-lg bg-slate-100 dark:bg-slate-700/60 border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:outline-none"
                            placeholder="e.g., The CEO's cat walks into the office wearing a tiny suit."
                        />
                         <button 
                            onClick={() => handleSubmit(customEvent)} 
                            disabled={!customEvent.trim()}
                            className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors text-white bg-primary-light dark:bg-indigo-500 hover:bg-primary-light/90 dark:hover:bg-indigo-500/90 disabled:bg-slate-400 dark:disabled:bg-slate-600"
                        >
                            <SendIcon className="w-5 h-5" />
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </Dialog>
    );
};

export default RandomEventDialog;
