import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="h-[10vh] bg-surface-light dark:bg-surface-dark flex items-center justify-center text-center px-4 border-t border-border-light dark:border-border-dark">
      <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
        &copy; {currentYear} KATJE B.V.. All rights reserved. Knowledge And Technology Joyfully Engaged.
      </p>
    </footer>
  );
};

export default Footer;
