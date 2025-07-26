
import React from 'react';
import { useAppContext } from '../../context/AppContext';

const EmployeeSelector: React.FC = () => {
    const { allCompanies, allEmployees, selectedEmployees, toggleEmployeeSelection, addMultipleEmployeesToSelection } = useAppContext();

    if (allCompanies.length === 0) {
        return <p className="p-4 text-text-secondary-light dark:text-text-secondary-dark">Loading employee data...</p>;
    }
    
    const anyInactive = allCompanies.some(c => c.employees.some(id => !selectedEmployees.includes(id)));

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">Available Participants</h2>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Click an employee to add them, or a company name to add all employees from that company.</p>
            
            {!anyInactive && (
                 <p className="p-4 text-text-secondary-light dark:text-text-secondary-dark">All employees are active in the chat.</p>
            )}

            {allCompanies.map(company => {
                const inactiveEmployees = company.employees.filter(id => !selectedEmployees.includes(id));
                if (inactiveEmployees.length === 0) {
                    return null;
                }
                
                return (
                    <div key={company.name}>
                        <button
                            onClick={() => addMultipleEmployeesToSelection(company.employees)}
                            className="w-full text-left"
                            title={`Add all employees from ${company.name}`}
                        >
                            <h3 className="inline-block text-lg font-semibold mt-4 mb-2 pb-2 border-b border-border-light dark:border-border-dark text-text-primary-light dark:text-text-primary-dark hover:text-primary-light dark:hover:text-primary-dark hover:border-primary-dark/50 transition-colors">
                                {company.name}
                            </h3>
                        </button>
                        <div className="flex flex-row flex-wrap gap-4 mt-2">
                            {inactiveEmployees.map(employeeId => {
                                const employee = allEmployees[employeeId];
                                if (!employee) return null;

                                const initials = employee.name.split(' ').map(n => n[0]).join('').substring(0, 2);

                                return (
                                    <button
                                        key={employee.id}
                                        onClick={() => toggleEmployeeSelection(employee.id)}
                                        className="w-14 h-14 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:focus:ring-offset-surface-dark flex items-center justify-center ring-2 ring-transparent"
                                        title={`Add ${employee.name} to chat`}
                                        aria-pressed={false}
                                    >
                                        <div className="w-full h-full rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity">
                                            <span className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">{initials}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default EmployeeSelector;