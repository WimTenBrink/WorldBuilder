import { World, Country, City, Village } from '../types';

const section = (title: string, content: string | null | undefined, level: number = 2): string => {
    if (!content || !content.trim()) return '';
    const header = '#'.repeat(level);
    return `\n${header} ${title}\n\n${content.trim()}\n`;
};

const list = (items: string[] | undefined): string => {
    if (!items || items.length === 0) return 'Not specified.';
    return items.map(item => `- ${item}`).join('\n');
};

export const exportWorldToMarkdown = (world: World): string => {
    let md = `# ${world.name}\n\n`;
    md += `**Style:** ${world.style}\n\n`;

    md += section('Core Information', `
- **Technology Level:** ${world.technologyLevel}
- **Calendar:** ${world.calendar.name} - ${world.calendar.details}
    `);

    const celestialContent = [
        `### Stars\n${list(world.celestialObjects.stars.map(s => `**${s.name}:** ${s.description}`))}`,
        `### Planets\n${list(world.celestialObjects.planets.map(p => `**${p.name}:** ${p.description}`))}`,
        `### Moons\n${list(world.celestialObjects.moons.map(m => `**${m.name}:** ${m.description}`))}`,
        `### Constellations\n${list(world.celestialObjects.constellations.map(c => `**${c.name}:** ${c.description}`))}`,
    ].join('\n\n');
    md += section('Celestial Objects', celestialContent);

    const geographyContent = [
        `### Oceans\n${list(world.geography.oceans.map(o => `**${o.name}:** ${o.description}`))}`,
        `### Seas\n${list(world.geography.seas.map(s => `**${s.name}:** ${s.description}`))}`,
        `### Rivers\n${list(world.geography.rivers.map(r => `**${r.name}:** ${r.description}`))}`,
        `### Major Landmarks\n${list(world.geography.landmarks.map(l => `**${l.name} (${l.type})** at ${l.location}: ${l.description}`))}`,
    ].join('\n\n');
    md += section('Geography', geographyContent);

    const countriesContent = world.countries.map(country => {
        let countryMd = `### ${country.name}\n\n`;
        countryMd += `- **Political System:** ${country.politicalSystem}\n`;
        countryMd += `- **Diplomatic Relations:**\n${list(country.diplomaticRelations.map(r => `${r.with} (${r.status})`))}\n`;

        const citiesContent = country.cities.map(city => {
            let cityMd = `#### ${city.name}${city.isCapital ? ' (Capital)' : ''}\n\n`;
            cityMd += `- **Political System:** ${city.politicalSystem}\n`;
            if (city.villages.length > 0) {
                cityMd += `- **Associated Villages:** ${city.villages.map(v => v.name).join(', ')}\n`;
            }
            return cityMd;
        }).join('\n');
        countryMd += citiesContent;
        return countryMd;
    }).join('\n---\n');
    md += section('Countries', countriesContent);


    return md.replace(/\n{3,}/g, '\n\n');
};

export const exportWorldToHtml = (world: World): string => {
    // Basic HTML structure for now. Can be styled up like character export.
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>World: ${world.name}</title>
    <style>body { font-family: sans-serif; line-height: 1.6; padding: 20px; } .section { margin-bottom: 20px; }</style>
</head>
<body>
    <h1>${world.name}</h1>
    <p><strong>Style:</strong> ${world.style}</p>
    <div class="section">
        <h2>Core Information</h2>
        <p><strong>Technology Level:</strong> ${world.technologyLevel}</p>
        <p><strong>Calendar:</strong> ${world.calendar.name} - ${world.calendar.details}</p>
    </div>
    <div class="section">
        <h2>Countries</h2>
        ${world.countries.map(c => `<p><strong>${c.name}</strong> - ${c.politicalSystem}</p>`).join('')}
    </div>
    <!-- Add more sections for geography, celestial objects etc. -->
</body>
</html>`;
};
