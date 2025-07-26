
import React from 'react';

const KijkwijzerAlIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="19" fill="#22C55E" stroke="#166534" strokeWidth="2"/>
    <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold" fontFamily="Arial">AL</text>
  </svg>
);

export default KijkwijzerAlIcon;
