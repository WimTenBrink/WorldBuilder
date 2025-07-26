
import React from 'react';
import { KijkwijzerResult, KijkwijzerAgeRating, KijkwijzerPictogram } from '../../types';
import KijkwijzerAlIcon from './icons/KijkwijzerAlIcon';
import Kijkwijzer6Icon from './icons/Kijkwijzer6Icon';
import Kijkwijzer9Icon from './icons/Kijkwijzer9Icon';
import Kijkwijzer12Icon from './icons/Kijkwijzer12Icon';
import Kijkwijzer16Icon from './icons/Kijkwijzer16Icon';
import KijkwijzerViolenceIcon from './icons/KijkwijzerViolenceIcon';
import KijkwijzerSexIcon from './icons/KijkwijzerSexIcon';
import KijkwijzerFearIcon from './icons/KijkwijzerFearIcon';

interface KijkwijzerDisplayProps {
  result: KijkwijzerResult;
}

const ICONS: { [key in KijkwijzerPictogram]: React.FC<{ className?: string }> } = {
  [KijkwijzerPictogram.VIOLENCE]: KijkwijzerViolenceIcon,
  [KijkwijzerPictogram.SEX]: KijkwijzerSexIcon,
  [KijkwijzerPictogram.FEAR]: KijkwijzerFearIcon,
};

const AGE_ICONS: { [key in KijkwijzerAgeRating]: React.FC<{ className?: string }> } = {
  [KijkwijzerAgeRating.AL]: KijkwijzerAlIcon,
  [KijkwijzerAgeRating._6]: Kijkwijzer6Icon,
  [KijkwijzerAgeRating._9]: Kijkwijzer9Icon,
  [KijkwijzerAgeRating._12]: Kijkwijzer12Icon,
  [KijkwijzerAgeRating._16]: Kijkwijzer16Icon,
};

const KijkwijzerDisplay: React.FC<KijkwijzerDisplayProps> = ({ result }) => {
  const AgeIcon = AGE_ICONS[result.age];
  
  return (
    <div className="flex items-center gap-2" title={`Kijkwijzer Rating: ${result.age} and up`}>
      <AgeIcon className="w-8 h-8" />
      {result.pictograms.map(pictogram => {
        const PictogramIcon = ICONS[pictogram];
        return (
          <div key={pictogram} title={pictogram}>
             <PictogramIcon className="w-8 h-8" />
          </div>
        );
      })}
    </div>
  );
};

export default KijkwijzerDisplay;
