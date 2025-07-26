
import React from 'react';

const KijkwijzerFearIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 5 H35 V35 H5 Z" fill="black" />
    <path d="M15 28 C 18 22, 22 22, 25 28" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" />
    <circle cx="16" cy="16" r="2.5" fill="white" />
    <circle cx="24" cy="16" r="2.5" fill="white" />
  </svg>
);

export default KijkwijzerFearIcon;
