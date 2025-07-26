
import React from 'react';
import { VISION_FEATURES, VisionFeatureType } from '../../types';
import Accordion from '../ui/Accordion';

interface FeatureSelectorProps {
  selectedFeatures: VisionFeatureType[];
  onFeatureChange: (feature: VisionFeatureType) => void;
}

const FeatureSelector: React.FC<FeatureSelectorProps> = ({ selectedFeatures, onFeatureChange }) => {
  const title = (
    <div className="flex items-center justify-between w-full">
      <span>Analysis Features</span>
      <span className="text-sm font-normal px-2 py-1 rounded-full bg-primary-light text-white dark:bg-primary-dark dark:text-slate-900">
        {selectedFeatures.length} selected
      </span>
    </div>
  );

  return (
    <Accordion title={title} startOpen={true}>
      <div className="space-y-3 p-2">
        {VISION_FEATURES.map(({ id, label }) => (
          <label key={id} htmlFor={id} className="flex items-center gap-3 cursor-pointer p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700/70 transition-colors">
            <input
              type="checkbox"
              id={id}
              name={id}
              checked={selectedFeatures.includes(id)}
              onChange={() => onFeatureChange(id)}
              className="h-5 w-5 rounded border-gray-300 text-primary-light focus:ring-primary-light dark:text-primary-dark dark:focus:ring-primary-dark dark:ring-offset-slate-800 dark:bg-slate-700 dark:border-slate-600"
            />
            <span className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">{label}</span>
          </label>
        ))}
      </div>
    </Accordion>
  );
};

export default FeatureSelector;
