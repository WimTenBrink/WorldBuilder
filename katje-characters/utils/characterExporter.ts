

import { Character } from '../types';

const cmToFtIn = (cm: number) => {
    if (!cm) return 'N/A';
    const inchesTotal = cm / 2.54;
    const feet = Math.floor(inchesTotal / 12);
    const inches = Math.round(inchesTotal % 12);
    return `${feet}' ${inches}"`;
};

const kgToLbs = (kg: number) => {
    if (!kg) return 'N/A';
    return `${Math.round(kg * 2.20462)} lbs`;
};

const section = (title: string, content: string | null | undefined): string => {
    if (!content || !content.trim() || content.trim() === 'Not specified.') return '';
    return `\n## ${title}\n\n${content.trim()}\n`;
};

const list = (items: string[] | undefined): string => {
    if (!items || items.length === 0) return 'Not specified.';
    return items.map(item => `- ${item}`).join('\n');
};

export const exportToMarkdown = (char: Character): string => {
    let md = `# ${char.Name.FirstName} ${char.Name.LastName}\n`;
    md += `A ${char.Age}-year-old ${char.Name.Race} ${char.Name.Gender}\n\n`;

    if (char.image) {
        md += `![Portrait of ${char.Name.FirstName}](${char.image})\n\n`;
    }

    // --- Core & Birth ---
    md += section('Core Details', `
- **World(s):** ${char.Worlds?.join(', ')}
- **Residence:** ${char.Residence || 'N/A'}
- **Pronouns:** ${char.Pronouns?.join(', ')}
- **Sexuality:** ${char.Sexuality}
- **IQ:** ${char.IQ || 'N/A'}
    `);

    md += section('Birth Information', `
- **Date of Birth:** ${new Date(char.Birth.BirthDateTime).toLocaleDateString()}
- **Birthplace:** ${char.Birth.BornCity}, ${char.Birth.BornCountry}
- **Nationality:** ${char.Birth.Nationality?.join(', ')}
    `);
    
    // --- Physical ---
    const bodyPartsContent = char.BodyParts?.map(p => ` - **${p.Name}:** ${p.Details.map((d: any) => `${d.Name} - ${d.Descriptions.join(', ')}`).join('; ')}`).join('\n') || 'Not specified.';
    const bodyMarksContent = char.BodyMarks?.map(m => `- **${m.Name} on ${m.Location}:** ${m.Description}`).join('\n') || 'None specified.';
    
    let physicalDetailsContent = `
- **Height:** ${char.Size.Height} cm (${cmToFtIn(char.Size.Height)})
- **Weight:** ${char.Size.Weight} kg (${kgToLbs(char.Size.Weight)})
- **BMI:** ${char.Size.BMI.toFixed(1)}

### Body Details
${bodyPartsContent}
    `;

    if (bodyMarksContent.trim() !== 'None specified.') {
        physicalDetailsContent += `\n### Body Marks\n${bodyMarksContent}`;
    }
    
    md += section('Physical Details', physicalDetailsContent);


    // --- Traits ---
    md += section('Personality', list(char.Personality));
    md += section('Advantages', list(char.Advantages));
    md += section('Disadvantages', list(char.Disadvantages));
    md += section('Skills', list(char.Skills));
    md += section('Talents', list(char.Talents));
    md += section('Languages', list(char.Languages));
    
    // --- Social & Possessions ---
    const favoritesContent = char.Favorites ? Object.entries(char.Favorites).map(([key, value]) => `- **${key.replace('Favorite', '')}:** ${value}`).join('\n') : 'Not specified.';
    md += section('Favorites', favoritesContent);
    
    const relationsContent = char.Relations?.map(r => `- **${r.Relation}:** ${r.FirstName} ${r.LastName} (${r.Race} ${r.Gender})`).join('\n') || 'None specified.';
    md += section('Relationships', relationsContent);

    const occupationContent = char.Employer?.map(e => `- **${e.JobTitles.join(', ')}** at ${e.Company}`).join('\n') || 'Not specified.';
    md += section('Occupation', occupationContent);

    const possessionsContent = char.Possessions?.map(p => `- **${p.ItemType}:** ${p.Description.join(', ')}`).join('\n') || 'None specified.';
    md += section('Key Possessions', possessionsContent);

    const wardrobeContent = char.Dresses?.map(d => `### ${d.Usage.join(', ')}\n${d.Items.map((i: any) => `- ${i.Type} (${[i.Color, i.Style, i.Fabric].filter(Boolean).join(', ')})`).join('\n')}`).join('\n\n') || 'Not specified.';
    md += section('Wardrobe', wardrobeContent);

    // --- Story ---
    md += section('Backstory', char.Story?.map(p => p.trim()).join('\n\n') || 'Not specified.');
    md += section('Naked Appearance & Comfort', char.Naked?.map(p => p.trim()).join('\n\n') || 'Not specified.');
    md += section('Notes', char.Notes?.map(p => p.trim()).join('\n\n') || 'Not specified.');

    return md.replace(/\n{3,}/g, '\n\n'); // Clean up excessive newlines
};


export const exportToHtml = (char: Character): string => {
    const renderList = (items?: string[]) => {
        if (!items || items.length === 0) return '<ul><li class="italic">Not specified.</li></ul>';
        return `<ul class="list-disc list-inside space-y-1">${items.map(item => `<li>${item}</li>`).join('')}</ul>`;
    };
    
    const renderBodyDetails = () => {
        const bodyDetails = char.BodyParts.map(p => ({
            name: p.Name,
            details: p.Details.map((d: any) => `${d.Name}: ${d.Descriptions.join(', ')}`).join('; ')
        }));
        
        return `
            <div class="space-y-3">
                ${bodyDetails.map(p => `
                    <div>
                        <dt class="label">${p.name}</dt>
                        <dd class="value">${p.details}</dd>
                    </div>
                `).join('')}
            </div>
        `;
    };
    
    const renderFavorites = () => {
        if (!char.Favorites) return '';
        return Object.entries(char.Favorites).map(([key, value]) => `
             <div>
                <dt class="label inline-block mr-2">${key.replace('Favorite', '')}:</dt>
                <dd class="inline value">${value as string || 'N/A'}</dd>
            </div>
        `).join('');
    };
    
    const renderRelations = () => {
        if (!char.Relations || char.Relations.length === 0) return '';
        return `
            <div class="section">
                <h3>Relationships</h3>
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    ${char.Relations.map(r => `
                        <div style="background-color: #f8fafc; padding: 0.75rem; border-radius: 0.375rem; display: flex; justify-content: space-between; align-items: flex-start;">
                            <div>
                                <p style="font-weight: 600; color: #1e293b; margin: 0;">${r.FirstName} ${r.LastName}</p>
                                <p style="font-size: 0.75rem; color: #475569; margin: 0.25rem 0 0 0;">${r.Race} / ${r.Gender}</p>
                            </div>
                            <span style="font-size: 0.875rem; font-weight: 500; color: #4f46e5; flex-shrink: 0; margin-left: 0.5rem; text-align: right;">${r.Relation}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    };
    
    const renderBodyMarks = () => {
        if (!char.BodyMarks || char.BodyMarks.length === 0) return '';
        return `
            <div class="section">
                <h3>Body Marks</h3>
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                ${char.BodyMarks.map(mark => `
                    <div>
                        <h4 class="font-semibold" style="font-size: 0.875rem;">${mark.Name} on ${mark.Location}</h4>
                        <p style="font-size: 0.75rem; color: #475569;">${mark.Description}</p>
                    </div>
                `).join('')}
                </div>
            </div>
        `;
    };
    
    const renderWardrobe = () => {
        if (!char.Dresses || char.Dresses.length === 0) return '';
        return `
            <div class="section">
                <h3>Wardrobe</h3>
                ${char.Dresses.map((dress, i) => `
                    <div style="${i > 0 ? 'margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid #e2e8f0;' : ''}">
                         <h4 class="font-semibold" style="font-size: 0.875rem;">${dress.Usage.join(', ')}</h4>
                         <ul class="list-disc list-inside" style="margin-top: 0.25rem; font-size: 0.75rem;">
                            ${dress.Items.map((item: any) => `<li>${item.Type} (${[item.Color, item.Style, item.Fabric].filter(Boolean).join(', ')})</li>`).join('')}
                         </ul>
                    </div>
                `).join('')}
            </div>
        `;
    };

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Character Sheet: ${char.Name.FirstName} ${char.Name.LastName}</title>
    <style>
        body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; background-color: #f1f5f9; color: #1e293b; padding: 1.5rem; }
        .sheet-container { max-width: 1280px; margin-left: auto; margin-right: auto; }
        .header { display: flex; flex-direction: column; align-items: center; gap: 1.5rem; margin-bottom: 1.5rem; }
        @media (min-width: 768px) { .header { flex-direction: row; align-items: stretch; } }
        .image-container { flex-shrink: 0; width: 100%; border-radius: 0.5rem; overflow: hidden; border: 1px solid #cbd5e1; aspect-ratio: 3 / 4; background-color: #e2e8f0; }
        @media (min-width: 768px) { .image-container { width: 33.333333%; } }
        @media (min-width: 1024px) { .image-container { width: 25%; } }
        .image-container img { width: 100%; height: 100%; object-fit: cover; }
        .header-info { flex-grow: 1; width: 100%; background-color: #ffffff; padding: 1.5rem; border-radius: 0.5rem; border: 1px solid #cbd5e1; }
        h1 { font-size: 2.25rem; line-height: 2.5rem; font-weight: 700; letter-spacing: -0.025em; color: #1e293b; margin: 0; }
        h1 + p { font-size: 1.125rem; line-height: 1.75rem; margin-top: 0.25rem; color: #4f46e5; }
        main { column-count: 1; column-gap: 1.5rem; }
        @media (min-width: 768px) { main { column-count: 2; } }
        @media (min-width: 1024px) { main { column-count: 3; } }
        .section { background-color: #ffffff; padding: 1rem; border-radius: 0.5rem; border: 1px solid #cbd5e1; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); break-inside: avoid; margin-bottom: 1.5rem; }
        .section h3 { font-size: 1.125rem; line-height: 1.75rem; font-weight: 700; color: #4f46e5; margin-top: 0; margin-bottom: 0.75rem; padding-bottom: 0.5rem; border-bottom: 1px solid #cbd5e1; }
        .detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.75rem 1.5rem; }
        .label { font-size: 0.75rem; line-height: 1rem; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; }
        .value { margin-top: 0.25rem; font-size: 0.875rem; line-height: 1.25rem; color: #1e293b; }
        ul { list-style: disc; list-style-position: inside; font-size: 0.875rem; line-height: 1.25rem; color: #1e293b; padding-left: 0; margin: 0; }
        ul li { margin-bottom: 0.25rem; }
        .prose { font-size: 0.875rem; line-height: 1.5; }
        .prose p { margin-bottom: 1rem; }
        .prose h4 { font-size: 1rem; font-weight: 600; margin-bottom: 0.5rem; }
        table { width: 100%; text-align: left; font-size: 0.875rem; line-height: 1.25rem; border-collapse: collapse; }
        th { padding: 0.5rem; font-weight: 600; font-size: 0.75rem; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; }
        td { padding: 0.5rem; border-bottom: 1px solid #e2e8f0; }
        tr:last-child td { border-bottom: 0; }
        .font-semibold { font-weight: 600; }
        .space-y-1 > * + * { margin-top: 0.25rem; }
        .space-y-2 > * + * { margin-top: 0.5rem; }
        .space-y-3 > * + * { margin-top: 0.75rem; }
        .inline { display: inline; }
        .inline-block { display: inline-block; }
        .mr-2 { margin-right: 0.5rem; }
        .italic { font-style: italic; }
    </style>
</head>
<body>
    <div class="sheet-container">
        <header class="header">
            <div class="image-container">
                ${char.image ? `<img src="${char.image}" alt="Portrait of ${char.Name.FirstName}">` : ''}
            </div>
            <div class="header-info">
                <h1>${char.Name.FirstName} ${char.Name.LastName}</h1>
                <p>${char.Name.Race}</p>
                <dl class="detail-grid" style="grid-template-columns: repeat(3, minmax(0, 1fr)); margin-top: 1rem; gap: 1rem;">
                    <div><dt class="label">Age</dt><dd class="value">${char.Age}</dd></div>
                    <div><dt class="label">Gender</dt><dd class="value">${char.Name.Gender}</dd></div>
                    <div><dt class="label">Height</dt><dd class="value">${char.Size.Height} cm <span style="font-size:0.75rem; color: #475569;">(${cmToFtIn(char.Size.Height)})</span></dd></div>
                    <div><dt class="label">Pronouns</dt><dd class="value">${char.Pronouns.join(', ')}</dd></div>
                    <div><dt class="label">Sexuality</dt><dd class="value">${char.Sexuality}</dd></div>
                     <div><dt class="label">Weight</dt><dd class="value">${char.Size.Weight} kg <span style="font-size:0.75rem; color: #475569;">(${kgToLbs(char.Size.Weight)})</span></dd></div>
                </dl>
            </div>
        </header>
        <main>
            <div class="section">
                <h3>General Information</h3>
                <dl class="space-y-3">
                    <div><dt class="label">World(s)</dt><dd class="value">${char.Worlds.join(', ')}</dd></div>
                    <div><dt class="label">Residence</dt><dd class="value">${char.Residence}</dd></div>
                    <div><dt class="label">Date of Birth</dt><dd class="value">${new Date(char.Birth.BirthDateTime).toLocaleDateString()}</dd></div>
                    <div><dt class="label">Birthplace</dt><dd class="value">${char.Birth.BornCity}, ${char.Birth.BornCountry}</dd></div>
                    <div><dt class="label">Nationality</dt><dd class="value">${char.Birth.Nationality.join(', ')}</dd></div>
                    <div><dt class="label">IQ</dt><dd class="value">${char.IQ}</dd></div>
                </dl>
            </div>
            <div class="section">
                <h3>Physical Details</h3>
                <dl class="space-y-3">
                   ${renderBodyDetails()}
                </dl>
            </div>
            ${renderBodyMarks()}
             <div class="section">
                <h3>Backstory</h3>
                <div class="prose">
                    ${char.Story.map(p => `<p>${p}</p>`).join('')}
                </div>
            </div>
             <div class="section">
                <h3>Notes</h3>
                <div class="prose">
                    ${char.Notes.map(p => `<p>${p}</p>`).join('')}
                </div>
            </div>
            <div class="section">
                <h3>Personality</h3>
                ${renderList(char.Personality)}
            </div>
            <div class="section">
                <h3>Advantages</h3>
                ${renderList(char.Advantages)}
            </div>
             <div class="section">
                <h3>Disadvantages</h3>
                ${renderList(char.Disadvantages)}
            </div>
            <div class="section">
                <h3>Skills</h3>
                ${renderList(char.Skills)}
            </div>
             <div class="section">
                <h3>Talents</h3>
                ${renderList(char.Talents)}
            </div>
             <div class="section">
                <h3>Languages</h3>
                ${renderList(char.Languages)}
            </div>
            
            <div class="section">
                <h3>Favorites</h3>
                <dl class="space-y-2">
                    ${renderFavorites()}
                </dl>
            </div>

            <div class="section">
                <h3>Occupation</h3>
                ${char.Employer?.map(e => `<p class="value" style="margin: 0;">${e.JobTitles.join(', ')} at ${e.Company}</p>`).join('') || '<p class="value italic">Not specified.</p>'}
            </div>
             <div class="section">
                <h3>Key Possessions</h3>
                ${char.Possessions?.map(p => `<p class="value" style="margin: 0;"><strong>${p.ItemType}:</strong> ${p.Description.join(', ')}</p>`).join('') || '<p class="value italic">Not specified.</p>'}
            </div>
            
            ${renderWardrobe()}
            ${renderRelations()}
            <div class="section">
                <h3>Naked Appearance & Comfort</h3>
                <div class="prose">
                    ${char.Naked.map(p => `<p>${p}</p>`).join('')}
                </div>
            </div>
        </main>
    </div>
</body>
</html>
    `;
};