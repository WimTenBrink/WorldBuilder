
import React, { useState, useMemo } from 'react';
import Dialog from '../ui/Dialog';
import LogItem from '../console/LogItem';
import TrashIcon from '../icons/TrashIcon';
import { useAppContext } from '../../context/AppContext';
import { DialogType, LogLevel, LogSource } from '../../types';

const TABS = ['All', 'Debug', 'Info', 'Warn', 'Error', 'API', 'AI', 'Request/Response'];

const ConsoleDialog: React.FC = () => {
    const { openDialog, showDialog, logs, clearAndSaveLogs } = useAppContext();
    const [activeTab, setActiveTab] = useState('All');

    const filteredLogs = useMemo(() => {
        const reversedLogs = [...logs].reverse();
        if (activeTab === 'All') return reversedLogs;
        if (Object.values(LogLevel).includes(activeTab.toUpperCase() as LogLevel)) {
            return reversedLogs.filter(log => log.level === activeTab.toUpperCase());
        }
        if (activeTab === 'API') return reversedLogs.filter(log => log.source === LogSource.API);
        if (activeTab === 'AI') return reversedLogs.filter(log => log.source === LogSource.AI);
        if (activeTab === 'Request/Response') return reversedLogs.filter(log => log.source === LogSource.HTTP);
        return reversedLogs;
    }, [logs, activeTab]);

    if (openDialog !== DialogType.Console) return null;

    return (
        <Dialog
            isOpen={openDialog === DialogType.Console}
            onClose={() => showDialog(null)}
            title="Developer Console"
        >
            <div className="flex flex-col h-full text-text-primary-light dark:text-text-primary-dark">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-border-light dark:border-border-dark gap-4">
                    <div className="flex flex-wrap gap-2">
                        {TABS.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${
                                    activeTab === tab 
                                    ? 'bg-primary-light text-white dark:bg-primary-dark dark:text-slate-900' 
                                    : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                     <button
                        onClick={clearAndSaveLogs}
                        disabled={logs.length === 0}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors text-white bg-red-600 hover:bg-red-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
                    >
                        <TrashIcon className="w-4 h-4" />
                        Save & Clear Log
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto py-4 space-y-2">
                    {filteredLogs.length > 0 ? (
                        filteredLogs.map(log => <LogItem key={log.id} log={log} />)
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-text-secondary-light dark:text-text-secondary-dark">No logs to display for this filter.</p>
                        </div>
                    )}
                </div>

                 <div className="pt-2 border-t border-border-light dark:border-border-dark text-right">
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Showing {filteredLogs.length} of {logs.length} total entries.</p>
                 </div>
            </div>
        </Dialog>
    );
};

export default ConsoleDialog;
