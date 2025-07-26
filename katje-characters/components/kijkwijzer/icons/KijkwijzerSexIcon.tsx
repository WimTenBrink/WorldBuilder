
import React from 'react';

const KijkwijzerSexIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 5 H35 V35 H5 Z" fill="black" />
    <circle cx="20" cy="20" r="6" stroke="white" strokeWidth="3"/>
    <path d="M25 15 L32 8 M28 8 H32 V12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20 26 V34 M16 34 H24" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default KijkwijzerSexIcon;
