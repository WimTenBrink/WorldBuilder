

import React, { useState } from 'react';
import { LogEntry, LogLevel } from '../../types';
import CopyIcon from '../icons/CopyIcon';

interface LogItemProps {
    log: LogEntry;
}

const getLevelStyles = (level: LogLevel) => {
    switch (level) {
        case LogLevel.ERROR:
            return 'border-red-500 bg-red-500/10 dark:bg-red-500/20 text-red-700 dark:text-red-400';
        case LogLevel.WARN:
            return 'border-yellow-500 bg-yellow-500/10 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
        case LogLevel.INFO:
            return 'border-blue-500 bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400';
        case LogLevel.DEBUG:
            return 'border-slate-500 bg-slate-500/10 dark:bg-slate-500/20 text-slate-600 dark:text-slate-400';
        default:
            return 'border-slate-300 dark:border-slate-700';
    }
};

const LogItem: React.FC<LogItemProps> = ({ log }) => {
    const [isOpen, setIsOpen] = useState(false);
    const levelClasses = getLevelStyles(log.level);

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (log.details) {
            navigator.clipboard.writeText(JSON.stringify(log.details, null, 2))
                .catch(err => console.error('Failed to copy log details:', err));
        }
    };

    return (
        <div className={`border-l-4 ${levelClasses} rounded-r-md bg-surface-light dark:bg-surface-dark overflow-hidden transition-all duration-300`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-start p-3 text-left hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
            >
                <div className="flex-grow min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1">
                        <span className="font-mono text-xs text-text-secondary-light dark:text-text-secondary-dark">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        <div className="flex items-center gap-2">
                             <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${levelClasses}`}>
                                {log.level}
                            </span>
                             <span className="font-mono text-xs bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">{log.source}</span>
                        </div>
                    </div>
                    <p className="text-sm text-text-primary-light dark:text-text-primary-dark whitespace-normal break-words">{log.message}</p>
                </div>

                <div className="flex-shrink-0 flex items-center gap-2 pl-4 pt-0.5">
                    {log.details && (
                        <button
                            onClick={handleCopy}
                            className="p-1.5 rounded-full text-text-secondary-light dark:text-text-secondary-dark hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            aria-label="Copy details"
                            title="Copy details to clipboard"
                        >
                            <CopyIcon className="w-4 h-4" />
                        </button>
                    )}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-5 w-5 transform transition-transform duration-300 text-text-secondary-light dark:text-text-secondary-dark ${isOpen ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>
            {isOpen && (
                <div className="px-4 pb-4">
                    <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-md">
                        {log.details ? (
                            <pre className="text-xs text-text-secondary-light dark:text-text-secondary-dark whitespace-pre-wrap break-all">
                                {JSON.stringify(log.details, null, 2)}
                            </pre>
                        ) : (
                            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">No additional details for this log entry.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LogItem;