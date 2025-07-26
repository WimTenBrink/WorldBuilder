import React from 'react';
import Dialog from '../ui/Dialog';
import Accordion from '../ui/Accordion';
import EmployeeCard from './about/EmployeeCard';
import { useAppContext } from '../../context/AppContext';
import { DialogType } from '../../types';

const AboutDialog: React.FC = () => {
    const { openDialog, showDialog, allCompanies, allEmployees } = useAppContext();
    
    const loading = allCompanies.length === 0;

    return (
        <Dialog
            isOpen={openDialog === DialogType.About}
            onClose={() => showDialog(null)}
            title="About the Companies & Team"
        >
            {loading && <p className="text-text-primary-light dark:text-text-primary-dark">Loading team information...</p>}
            {!loading && (
                <div className="space-y-8">
                    {allCompanies.map((company) => (
                        <div key={company.name} className="p-4 rounded-lg bg-slate-100 dark:bg-slate-900/50 border border-border-light dark:border-border-dark">
                            <h2 className="text-2xl font-bold text-primary-light dark:text-primary-dark">{company.name}</h2>
                            {company.kvk && <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">KVK: {company.kvk} | VAT ID: {company.vatId}</p>}
                            <p className="mt-2 text-text-primary-light dark:text-text-primary-dark whitespace-pre-line">
                                {company.description}
                            </p>

                            <div className="mt-4">
                                <Accordion title={`Employees (${company.employees.length})`} startOpen={company.name === 'Katje B.V.'}>
                                    <div className="grid grid-cols-1 gap-6 pt-4">
                                        {company.employees.map(employeeId => {
                                            const employee = allEmployees[employeeId];
                                            return employee ? <EmployeeCard key={employee.id} employee={employee} /> : null;
                                        })}
                                    </div>
                                </Accordion>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Dialog>
    );
};

export default AboutDialog;