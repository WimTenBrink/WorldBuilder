
import React from 'react';

const KatjeLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 120 50"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'rgb(99, 102, 241)', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: 'rgb(167, 139, 250)', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <rect
      x="2"
      y="2"
      width="116"
      height="46"
      rx="15"
      fill="url(#logoGradient)"
      stroke="#e0e7ff"
      strokeWidth="3"
    />
    <text
      x="50%"
      y="50%"
      dominantBaseline="middle"
      textAnchor="middle"
      fill="white"
      fontSize="24"
      fontFamily="Arial, sans-serif"
      fontWeight="bold"
      letterSpacing="2"
    >
      KATJE
    </text>
  </svg>
);

export default KatjeLogo;
