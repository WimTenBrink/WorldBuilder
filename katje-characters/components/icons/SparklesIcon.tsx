import React from 'react';

const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104l-1.12 2.242-2.242 1.12 2.242 1.12 1.12 2.242 1.12-2.242 2.242-1.12-2.242-1.12-1.12-2.242zM16.878 9.318l-1.12 2.242-2.242 1.12 2.242 1.12 1.12 2.242 1.12-2.242 2.242-1.12-2.242-1.12-1.12-2.242zM19.5 21l-1.12-2.242-2.242-1.12 2.242-1.12 1.12-2.242 1.12 2.242 2.242-1.12-2.242 1.12-1.12 2.242z" />
    </svg>
);

export default SparklesIcon;
