
import React from 'react';
import { Employee } from '../../../types';
import Accordion from '../../ui/Accordion';
import DownloadableImage from '../../ui/DownloadableImage';

interface EmployeeCardProps {
    employee: Employee;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee }) => {
    return (
        <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-lg shadow-md border border-border-light dark:border-border-dark">
            <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0 border-2 border-primary-light dark:border-primary-dark">
                    <DownloadableImage
                        src={employee.image}
                        alt={employee.name}
                        filename={`${employee.id}_portrait.png`}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="flex-grow">
                    <h4 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">{employee.name}</h4>
                    <p className="text-md font-semibold text-primary-light dark:text-primary-dark">{employee.function}</p>
                </div>
            </div>
            <div className="mt-4 space-y-2">
                <Accordion title="Contact Information">
                    <p className="text-text-secondary-light dark:text-text-secondary-dark"><strong>Email:</strong> <a href={`mailto:${employee.email}`} className="text-primary-light dark:text-primary-dark hover:underline">{employee.email}</a></p>
                    <p className="text-text-secondary-light dark:text-text-secondary-dark"><strong>Domain:</strong> <a href={`http://${employee.domain}`} target="_blank" rel="noopener noreferrer" className="text-primary-light dark:text-primary-dark hover:underline">{employee.domain}</a></p>
                </Accordion>
                 <Accordion title="Detailed Job Description">
                    <p className="text-text-secondary-light dark:text-text-secondary-dark whitespace-pre-line">{employee.jobDescription}</p>
                </Accordion>
                 <Accordion title="Relations, Family & Residence">
                    <div className="text-text-secondary-light dark:text-text-secondary-dark space-y-1">
                        <p><strong>Residence:</strong> {employee.relationships.residence}</p>
                        {employee.relationships.romantic && <p><strong>Romantic Partners:</strong> {employee.relationships.romantic.join(', ')}</p>}
                        {employee.relationships.family && <p><strong>Family:</strong> {employee.relationships.family.join(', ')}</p>}
                         {employee.relationships.professional && <p><strong>Professional:</strong> {employee.relationships.professional.join(', ')}</p>}
                        {employee.relationships.friendships && <p><strong>Friendships:</strong> {employee.relationships.friendships.join(', ')}</p>}
                    </div>
                </Accordion>
                <Accordion title="Physical Appearance">
                     <p className="text-text-secondary-light dark:text-text-secondary-dark whitespace-pre-line">{employee.appearance}</p>
                </Accordion>
                <Accordion title="Personality & Quirks">
                     <p className="text-text-secondary-light dark:text-text-secondary-dark whitespace-pre-line">{employee.personality}</p>
                </Accordion>
            </div>
        </div>
    );
};

export default EmployeeCard;