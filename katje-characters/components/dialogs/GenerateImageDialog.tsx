
import React, { useState, useEffect } from 'react';
import Dialog from '../ui/Dialog';
import { useAppContext } from '../../context/AppContext';
import { DialogType, IMAGE_STYLES, ImageStyle } from '../../types';
import GenerateIcon from '../icons/GenerateIcon';

const GenerateImageDialog: React.FC = () => {
    const { 
        openDialog, 
        showDialog, 
        selectedCharacterId, 
        characters,
        imagenConfig,
        setImagenConfig,
        generateCharacterImage
    } = useAppContext();
    
    const [basePrompt, setBasePrompt] = useState('');
    const [additionalPrompt, setAdditionalPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const character = selectedCharacterId ? characters[selectedCharacterId] : null;

    useEffect(() => {
        if (openDialog !== DialogType.GENERATE_IMAGE) {
            // Reset state on close
            setIsLoading(false);
            setError(null);
            setAdditionalPrompt('');
        } else if (character) {
            // Build base prompt when dialog opens for a character
            const hair = character.BodyParts?.find(p => p.Name === 'Hair')?.Details.map((d:any) => `${d.Name} ${d.Descriptions.join(', ')}`).join(', ') || 'hair';
            const eyes = character.BodyParts?.find(p => p.Name === 'Eyes')?.Details.map((d:any) => `${d.Name} ${d.Descriptions.join(', ')}`).join(', ') || 'eyes';
            const skin = character.BodyParts?.find(p => p.Name === 'Skin')?.Details.map((d: any) => `${d.Name} ${d.Descriptions.join(', ')}`).join(', ') || character.Name.Race;
            const clothing = character.Dresses?.[0]?.Items.map((item: any) => item.Type).join(', ') || 'simple clothes';

            const prompt = `portrait from the abdomen up of ${character.Name.FirstName} ${character.Name.LastName}, a ${character.Age}-year-old ${character.Name.Race} ${character.Name.Gender}. Physical details: ${hair}, ${eyes}, ${skin}. They are wearing ${clothing}.`;
            setBasePrompt(prompt);
            setError(null); // Clear previous errors when opening
        }
    }, [openDialog, character]);
    
    const handleClose = () => {
        if (!isLoading) {
            showDialog(null);
        }
    }

    const handleStyleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setImagenConfig({ ...imagenConfig, style: e.target.value as ImageStyle });
    };

    const handleGenerate = async () => {
        if (!character) return;
        
        setIsLoading(true);
        setError(null);
        
        const finalPrompt = `A ${imagenConfig.style} ${basePrompt} ${additionalPrompt}`.trim();

        try {
            await generateCharacterImage(character.id, finalPrompt);
            handleClose();
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    if (!character) return null;

    return (
        <Dialog
            isOpen={openDialog === DialogType.GENERATE_IMAGE}
            onClose={handleClose}
            title={`Generate Image for ${character.Name.FirstName}`}
        >
            <div className="space-y-4 text-text-primary-light dark:text-text-primary-dark">
                <div>
                    <label className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">Base Prompt (from character sheet)</label>
                    <textarea
                        readOnly
                        value={basePrompt}
                        rows={5}
                        className="w-full p-2 bg-slate-100 dark:bg-slate-900/50 border border-border-light dark:border-border-dark rounded-md text-sm cursor-default"
                    />
                </div>
                
                <div>
                    <label htmlFor="imageStyle" className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">Image Style</label>
                    <select
                        id="imageStyle"
                        value={imagenConfig.style}
                        onChange={handleStyleChange}
                        className="w-full px-3 py-2 bg-slate-200 dark:bg-slate-700 border border-border-light dark:border-border-dark rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light dark:focus:ring-primary-dark"
                    >
                        {IMAGE_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                <div>
                    <label htmlFor="additionalPrompt" className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">Additional Details (optional)</label>
                    <textarea
                        id="additionalPrompt"
                        value={additionalPrompt}
                        onChange={e => setAdditionalPrompt(e.target.value)}
                        rows={3}
                        placeholder="e.g., smiling, holding a sword, in a dark forest at night, cinematic lighting"
                        className="w-full p-2 bg-slate-200 dark:bg-slate-700 border border-border-light dark:border-border-dark rounded-md focus:outline-none focus:ring-1 focus:ring-primary-light dark:focus:ring-primary-dark"
                    />
                </div>
                
                {error && (
                    <div className="bg-red-500/10 text-red-700 dark:text-red-400 p-3 rounded-md text-sm border border-red-500/20">
                        <strong>Error:</strong> {error}
                    </div>
                )}
                
                <div className="flex justify-end pt-4 gap-4">
                    <button onClick={handleClose} disabled={isLoading} className="px-6 py-2 text-sm font-semibold rounded-md transition-colors bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 disabled:opacity-50">
                        Cancel
                    </button>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 w-40 px-6 py-2 text-md font-semibold rounded-md transition-colors text-white bg-primary-light dark:bg-indigo-500 hover:bg-primary-light/90 dark:hover:bg-indigo-500/90 disabled:bg-slate-400 dark:disabled:bg-slate-600"
                    >
                         {isLoading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w.3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Generating...</span>
                            </>
                        ) : (
                            <>
                                <GenerateIcon className="w-5 h-5"/>
                                <span>Generate</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </Dialog>
    );
};
export default GenerateImageDialog;
