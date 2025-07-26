
import { Company, Employee } from '../types';

type EmployeeProperty = 'jobDescription' | 'appearance' | 'personality' | 'relationships';

export const parseEmployeesMd = (markdown: string): { companies: Company[], employees: Record<string, Employee> } => {
    const companies: Company[] = [];
    const employees: Record<string, Employee> = {};

    let currentCompany: Company | null = null;
    let currentEmployee: Employee | null = null;
    let currentProperty: EmployeeProperty | null = null;

    const lines = markdown.split('\n');

    for (let line of lines) {
        if (line.startsWith('## ')) {
            currentCompany = {
                name: line.substring(3).trim(),
                description: '',
                employees: [],
            };
            companies.push(currentCompany);
            currentEmployee = null;
            continue;
        }

        if (!currentCompany) continue;

        if (line.startsWith('**KVK:**')) {
            const parts = line.split('|');
            currentCompany.kvk = parts[0].replace('**KVK:**', '').trim();
            currentCompany.vatId = parts[1].replace('**VAT ID:**', '').trim();
            continue;
        }

        if (line.startsWith('### Employees')) continue;

        if (line.startsWith('#### ')) {
            const name = line.substring(5).trim();
            const id = name.toLowerCase().replace(/ /g, '_');
            currentEmployee = {
                id,
                name,
                image: `https://katje.biz/members/${id}.png`,
                email: '',
                domain: '',
                function: '',
                jobDescription: '',
                relationships: { residence: '' },
                appearance: '',
                personality: '',
            };
            employees[id] = currentEmployee;
            currentCompany.employees.push(id);
            currentProperty = null;
            continue;
        }

        if (currentEmployee) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('- **Function:**')) {
                currentEmployee.function = trimmedLine.substring(15).trim();
                currentProperty = null;
            } else if (trimmedLine.startsWith('- **Contact:**')) {
                const contactString = trimmedLine.substring(14).trim();
                const [email, domain] = contactString.split('|').map(s => s.replace(/`/g, '').trim());
                currentEmployee.email = email;
                currentEmployee.domain = domain;
                currentProperty = null;
            } else if (trimmedLine.startsWith('- **Job Description:**')) {
                currentProperty = 'jobDescription';
                currentEmployee.jobDescription = trimmedLine.substring(22).trim();
            } else if (trimmedLine.startsWith('- **Relationships:**')) {
                currentProperty = 'relationships';
            } else if (trimmedLine.startsWith('- **Appearance:**')) {
                currentProperty = 'appearance';
                currentEmployee.appearance = trimmedLine.substring(17).trim();
            } else if (trimmedLine.startsWith('- **Personality:**')) {
                currentProperty = 'personality';
                currentEmployee.personality = trimmedLine.substring(18).trim();
            } else if (currentProperty === 'relationships' && trimmedLine.startsWith('- **')) {
                const relLine = trimmedLine.substring(4);
                const [key, value] = relLine.split(':**');
                const relKey = key.trim();
                const relValue = value.trim();
                
                if (relKey === 'Residence') currentEmployee.relationships.residence = relValue;
                else if (relKey === 'Romantic') currentEmployee.relationships.romantic = [relValue];
                else if (relKey === 'Family') currentEmployee.relationships.family = [relValue];
                else if (relKey === 'Professional') currentEmployee.relationships.professional = [relValue];
                else if (relKey === 'Friendships') currentEmployee.relationships.friendships = [relValue];
            } else if (currentProperty && currentProperty !== 'relationships') {
                currentEmployee[currentProperty] += '\n' + line;
            }
        } else {
            if (line.trim() && !line.startsWith('---') && !line.startsWith('#')) {
                currentCompany.description = (currentCompany.description ? currentCompany.description + '\n' : '') + line;
            }
        }
    }
    
    // Sort companies according to instructions
    const companyOrder = ['Katje B.V.', 'Yilmaz B.V.', 'Foxboom B.V.'];
    companies.sort((a, b) => companyOrder.indexOf(a.name) - companyOrder.indexOf(b.name));

    return { companies, employees };
};