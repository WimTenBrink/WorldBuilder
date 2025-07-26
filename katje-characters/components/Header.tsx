

import React, { useState, useRef, useEffect } from 'react';
import KatjeLogo from './icons/KatjeLogo';
import ThemeToggle from './ui/ThemeToggle';
import HamburgerMenu from './ui/HamburgerMenu';
import { useAppContext } from '../context/AppContext';
import { DialogType, AppMode, AUTO_REPLY_CHANCES, AUTO_REPLY_INTERVALS, AutoReplyChanceValue, AutoReplyIntervalValue } from '../types';
import ConsoleIcon from './icons/ConsoleIcon';
import SettingsIcon from './icons/SettingsIcon';
import TermsIcon from './icons/TermsIcon';
import AboutIcon from './icons/AboutIcon';
import AppSwitcherIcon from './icons/AppSwitcherIcon';

const HeaderButton: React.FC<{ onClick: () => void; children: React.ReactNode; icon: React.ReactNode; }> = ({ onClick, children, icon }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors text-text-primary-light dark:text-text-primary-dark bg-surface-light dark:bg-surface-dark hover:bg-slate-200 dark:hover:bg-slate-700 border border-border-light dark:border-border-dark"
  >
    {icon}
    {children}
  </button>
);


const Header: React.FC = () => {
  const { 
    showDialog, 
    appMode, 
    setAppMode,
    isAutoReplyEnabled,
    setIsAutoReplyEnabled,
    autoReplyInterval,
    setAutoReplyInterval,
    autoReplyChance,
    setAutoReplyChance,
    isNsfwMode,
    toggleNsfwMode
  } = useAppContext();
  const [isModeSelectorOpen, setIsModeSelectorOpen] = useState(false);
  const modeSelectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modeSelectorRef.current && !modeSelectorRef.current.contains(event.target as Node)) {
        setIsModeSelectorOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [modeSelectorRef]);

  return (
    <header className="h-[10vh] bg-surface-light dark:bg-surface-dark flex items-center justify-between px-6 shadow-md border-b border-border-light dark:border-border-dark z-20">
      <div className="flex items-center gap-4">
        <KatjeLogo className="h-10 w-auto" />
         <div className="relative" ref={modeSelectorRef}>
          <button
            onClick={() => setIsModeSelectorOpen(!isModeSelectorOpen)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors text-text-primary-light dark:text-text-primary-dark bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 border border-border-light dark:border-border-dark"
          >
            <AppSwitcherIcon className="w-5 h-5" />
            <span className="hidden sm:inline font-semibold">{appMode}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isModeSelectorOpen && (
            <div className="absolute top-full mt-2 w-48 bg-surface-light dark:bg-surface-dark rounded-md shadow-lg border border-border-light dark:border-border-dark overflow-hidden">
              {Object.values(AppMode).map(mode => (
                <button
                  key={mode}
                  onClick={() => { setAppMode(mode); setIsModeSelectorOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    appMode === mode
                      ? 'bg-primary-light text-white dark:bg-primary-dark dark:text-slate-900'
                      : 'text-text-primary-light dark:text-text-primary-dark hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          )}
        </div>
         {appMode === AppMode.GEMINI && (
            <div className="hidden lg:flex items-center gap-4 border-l border-border-light dark:border-border-dark ml-2 pl-4">
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="header-auto-reply-enabled"
                        checked={isAutoReplyEnabled}
                        onChange={(e) => setIsAutoReplyEnabled(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary-light focus:ring-primary-light"
                    />
                    <label htmlFor="header-auto-reply-enabled" className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark cursor-pointer">
                        Auto-replies
                    </label>
                </div>
                {isAutoReplyEnabled && (
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <label htmlFor="header-auto-reply-interval" className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
                                Interval:
                            </label>
                            <select
                                id="header-auto-reply-interval"
                                value={autoReplyInterval}
                                onChange={(e) => setAutoReplyInterval(Number(e.target.value) as AutoReplyIntervalValue)}
                                className="px-2 py-1 text-sm bg-slate-100 dark:bg-slate-700 border border-border-light dark:border-border-dark rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light dark:focus:ring-primary-dark"
                                title="Auto-Reply Interval"
                            >
                                {AUTO_REPLY_INTERVALS.map(item => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                         <div className="flex items-center gap-2">
                            <label htmlFor="header-auto-reply-chance" className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
                                Chance:
                            </label>
                            <select
                                id="header-auto-reply-chance"
                                value={autoReplyChance}
                                onChange={(e) => setAutoReplyChance(Number(e.target.value) as AutoReplyChanceValue)}
                                className="px-2 py-1 text-sm bg-slate-100 dark:bg-slate-700 border border-border-light dark:border-border-dark rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light dark:focus:ring-primary-dark"
                                title="Auto-Reply Chance"
                            >
                                {AUTO_REPLY_CHANCES.map(item => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}
            </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2">
           <HeaderButton onClick={() => showDialog(DialogType.Settings)} icon={<SettingsIcon className="w-4 h-4" />}>Settings</HeaderButton>
           <HeaderButton onClick={() => showDialog(DialogType.Terms)} icon={<TermsIcon className="w-4 h-4" />}>Terms of Service</HeaderButton>
           <HeaderButton onClick={() => showDialog(DialogType.About)} icon={<AboutIcon className="w-4 h-4" />}>About</HeaderButton>
        </div>
         <button
          onClick={() => showDialog(DialogType.Console)}
          className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-text-primary-light dark:text-text-primary-dark hover:bg-slate-300 dark:hover:bg-slate-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:focus:ring-primary-dark focus:ring-offset-surface-light dark:focus:ring-offset-surface-dark"
          aria-label="Toggle Console"
        >
          <ConsoleIcon className="w-6 h-6" />
        </button>
        <button
            onClick={toggleNsfwMode}
            className={`px-3 py-1.5 rounded-full font-bold text-xs transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-light dark:focus:ring-offset-surface-dark ${
                isNsfwMode 
                ? 'bg-red-500 text-white focus:ring-red-400' 
                : 'bg-slate-200 dark:bg-slate-700 text-text-primary-light dark:text-text-primary-dark hover:bg-slate-300 dark:hover:bg-slate-600 focus:ring-primary-light dark:focus:ring-primary-dark'
            }`}
            aria-label="Toggle NSFW content"
            title={isNsfwMode ? "Hide NSFW Content" : "Show NSFW Content"}
        >
            NSFW
        </button>
        <ThemeToggle />
        <HamburgerMenu />
      </div>
    </header>
  );
};

export default Header;