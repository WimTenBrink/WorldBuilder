
import React from 'react';

const NewChatIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v14a2 2 0 002 2h7" />
    </svg>
);

export default NewChatIcon;