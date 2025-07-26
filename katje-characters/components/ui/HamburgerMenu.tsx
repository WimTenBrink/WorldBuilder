import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { DialogType } from '../../types';
import SettingsIcon from '../icons/SettingsIcon';
import TermsIcon from '../icons/TermsIcon';
import AboutIcon from '../icons/AboutIcon';

const HamburgerMenu: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { showDialog } = useAppContext();

    useEffect(() => {
        // Prevent scrolling when menu is open
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleLinkClick = (dialog: DialogType) => {
        showDialog(dialog);
        setIsOpen(false);
    };

    return (
        <div className="md:hidden">
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 rounded-md text-text-secondary-light dark:text-text-secondary-dark hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                aria-label="Open menu"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 bg-background-dark/95 backdrop-blur-sm flex flex-col items-center justify-center">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="absolute top-6 right-6 p-2 rounded-full text-text-primary-dark hover:bg-slate-700 transition-colors"
                        aria-label="Close menu"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <nav className="flex flex-col items-center gap-8">
                        <button onClick={() => handleLinkClick(DialogType.Settings)} className="flex items-center gap-4 text-3xl font-bold text-text-primary-dark">
                            <SettingsIcon className="w-8 h-8" />
                            Settings
                        </button>
                        <button onClick={() => handleLinkClick(DialogType.Terms)} className="flex items-center gap-4 text-3xl font-bold text-text-primary-dark">
                            <TermsIcon className="w-8 h-8" />
                            Terms of Service
                        </button>
                        <button onClick={() => handleLinkClick(DialogType.About)} className="flex items-center gap-4 text-3xl font-bold text-text-primary-dark">
                            <AboutIcon className="w-8 h-8" />
                            About
                        </button>
                    </nav>
                </div>
            )}
        </div>
    );
};

export default HamburgerMenu;
