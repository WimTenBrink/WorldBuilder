

import React from 'react';
import { useAppContext } from '../../context/AppContext';
import StopIcon from '../icons/StopIcon';

const EmotionalStateDisplay: React.FC = () => {
    const { 
        selectedEmployees, 
        allEmployees, 
        employeeStates, 
        thinkingEmployeeId,
        chatHistory,
    } = useAppContext();

    const sortedEmployeeIds = React.useMemo(() => {
        if (selectedEmployees.length === 0) return [];

        const thinking = thinkingEmployeeId.filter(id => selectedEmployees.includes(id));
        const thinkingSet = new Set(thinking);

        const respondedOrder: string[] = [];
        const respondedSet = new Set<string>();

        [...chatHistory].reverse().forEach(msg => {
            if (msg.role === 'employee' && msg.employeeId && selectedEmployees.includes(msg.employeeId) && !respondedSet.has(msg.employeeId) && !thinkingSet.has(msg.employeeId)) {
                respondedSet.add(msg.employeeId);
                respondedOrder.push(msg.employeeId);
            }
        });

        const allSortedRespondedIds = new Set([...thinking, ...respondedOrder]);

        const unresponded = selectedEmployees
            .filter(id => !allSortedRespondedIds.has(id))
            .sort((aId, bId) => allEmployees[aId].name.localeCompare(allEmployees[bId].name));

        return [...thinking, ...respondedOrder, ...unresponded];
    }, [selectedEmployees, chatHistory, allEmployees, thinkingEmployeeId]);

    if (selectedEmployees.length === 0) {
        return (
             <div className="flex items-center justify-center h-full text-center p-4">
                <div>
                    <h3 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark">Active Participants</h3>
                    <p className="mt-2 text-text-secondary-light dark:text-text-secondary-dark">
                       No employees are active. Start a new chat to include all employees.
                    </p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="h-full w-full flex flex-col">
            <header className="p-4 border-b border-border-light dark:border-border-dark flex-shrink-0 flex items-center justify-between gap-2">
                <h3 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">Active Participants ({selectedEmployees.length})</h3>
            </header>
            <div className="flex-grow overflow-y-auto p-4 space-y-3">
                {sortedEmployeeIds.map(employeeId => {
                    const employee = allEmployees[employeeId];
                    const state = employeeStates[employeeId]?.emotionalState || 'Neutral';
                    const isThinking = thinkingEmployeeId.includes(employeeId);
                    if (!employee) return null;

                    return (
                        <div
                            key={employeeId}
                            className={`w-full flex items-center gap-4 p-3 bg-surface-light dark:bg-surface-dark rounded-lg border shadow-sm transition-all ${isThinking ? 'border-primary-light dark:border-primary-dark ring-2 ring-primary-light/50 dark:ring-primary-dark/50' : 'border-border-light dark:border-border-dark'}`}
                        >
                            <img src={employee.image} alt={employee.name} className="w-12 h-12 rounded-full object-cover border-2 border-primary-light/50 dark:border-primary-dark/50"/>
                            <div className="flex-grow">
                                <p className="font-bold text-text-primary-light dark:text-text-primary-dark">{employee.name}</p>
                                <div className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                    {isThinking ? (
                                        <span className="italic text-primary-light dark:text-primary-dark flex items-center gap-2">
                                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Thinking...
                                        </span>
                                    ) : (
                                        <>
                                            State: <span className="font-semibold">{state}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default EmotionalStateDisplay;
