
import React from 'react';

const KijkwijzerViolenceIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 5 H35 V35 H5 Z" fill="black" />
    <path d="M12 15 L28 15 L20 28 Z" fill="none" stroke="white" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" transform="translate(0, -2)"/>
    <path d="M18 12 L22 12 M20 12 L20 8" stroke="white" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

export default KijkwijzerViolenceIcon;
