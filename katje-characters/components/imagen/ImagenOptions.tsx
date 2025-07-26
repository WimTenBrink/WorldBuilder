
import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { ASPECT_RATIOS, AspectRatio, IMAGE_STYLES, ImageStyle } from '../../types';
import Accordion from '../ui/Accordion';

const ImagenOptions: React.FC = () => {
    const { imagenConfig, setImagenConfig } = useAppContext();

    const handleAspectRatioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setImagenConfig({
            ...imagenConfig,
            aspectRatio: e.target.value as AspectRatio
        });
    };

    const handleStyleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setImagenConfig({
            ...imagenConfig,
            style: e.target.value as ImageStyle
        });
    };

    return (
        <Accordion title="Image Configuration" startOpen={true}>
            <div className="space-y-4 p-2">
                <div>
                    <label htmlFor="aspectRatio" className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-2">
                        Aspect Ratio
                    </label>
                    <select
                        id="aspectRatio"
                        value={imagenConfig.aspectRatio}
                        onChange={handleAspectRatioChange}
                        className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-border-light dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
                    >
                        {ASPECT_RATIOS.map(ratio => (
                            <option key={ratio} value={ratio}>
                                {ratio}
                            </option>
                        ))}
                    </select>
                </div>
                 <div>
                    <label htmlFor="imageStyle" className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-2">
                        Image Style
                    </label>
                    <select
                        id="imageStyle"
                        value={imagenConfig.style}
                        onChange={handleStyleChange}
                        className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-border-light dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
                    >
                        {IMAGE_STYLES.map(style => (
                            <option key={style} value={style}>
                                {style}
                            </option>
                        ))}
                    </select>
                </div>
                 <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                    More options like negative prompts can be added in future versions.
                 </p>
            </div>
        </Accordion>
    );
};

export default ImagenOptions;
