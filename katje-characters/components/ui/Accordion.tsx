import React, { useState, ReactNode } from 'react';

interface AccordionProps {
  title: ReactNode;
  children: ReactNode;
  startOpen?: boolean;
}

const Accordion: React.FC<AccordionProps> = ({ title, children, startOpen = false }) => {
  const [isOpen, setIsOpen] = useState(startOpen);

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <div className="border border-border-light dark:border-border-dark rounded-lg overflow-hidden transition-all duration-300">
      <button
        onClick={toggleOpen}
        className="w-full flex justify-between items-center p-4 bg-surface-light dark:bg-surface-dark/50 hover:bg-slate-200 dark:hover:bg-slate-700/60 transition-colors"
        aria-expanded={isOpen}
      >
        <h3 className="font-semibold text-lg text-text-primary-light dark:text-text-primary-dark">{title}</h3>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-6 w-6 transform transition-transform duration-300 text-text-secondary-light dark:text-text-secondary-dark ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="p-4 bg-background-light dark:bg-background-dark">
          {children}
        </div>
      )}
    </div>
  );
};

export default Accordion;