

import React, { ReactNode } from 'react';

interface MarkdownRendererProps {
  content: string;
}

const applyStyling = (line: string): ReactNode => {
    // This regex handles both **bold** and inline HTML for color swatches
    const parts = line.split(/(\*\*.*?\*\*|<span.*?<\/span>)/g);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('<span')) {
            return <span key={index} dangerouslySetInnerHTML={{ __html: part }} />;
        }
        return part;
    });
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const lines = content.split('\n');

  const elements: ReactNode[] = [];
  let listItems: ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockContent = '';
  let codeBlockKey = 0;

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(<ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-2 my-2 pl-4">{listItems}</ul>);
      listItems = [];
    }
  };

  const flushCodeBlock = () => {
    if (inCodeBlock) {
       elements.push(
            <pre key={`code-${codeBlockKey}`} className="bg-slate-100 dark:bg-slate-900 p-4 rounded-md my-4">
                <code className="text-sm font-mono text-text-secondary-light dark:text-text-secondary-dark whitespace-pre-wrap break-words">{codeBlockContent}</code>
            </pre>
        );
        codeBlockContent = '';
        inCodeBlock = false;
    }
  };


  lines.forEach((line, index) => {
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        flushCodeBlock();
      } else {
        flushList();
        inCodeBlock = true;
        codeBlockKey = index;
      }
      return;
    }
    
    if (inCodeBlock) {
        codeBlockContent += (codeBlockContent ? '\n' : '') + line;
        return;
    }

    if (line.startsWith('# ')) {
      flushList();
      elements.push(<h1 key={index} className="text-3xl font-bold mt-4 mb-2 pb-2 border-b border-border-light dark:border-border-dark">{applyStyling(line.substring(2))}</h1>);
    } else if (line.startsWith('## ')) {
      flushList();
      elements.push(<h2 key={index} className="text-2xl font-semibold mt-4 mb-2 pb-1 border-b border-border-light dark:border-border-dark">{applyStyling(line.substring(3))}</h2>);
    } else if (line.startsWith('### ')) {
      flushList();
      elements.push(<h3 key={index} className="text-xl font-semibold mt-3 mb-1">{applyStyling(line.substring(4))}</h3>);
    } else if (line.startsWith('* ')) {
      listItems.push(<li key={index}>{applyStyling(line.substring(2))}</li>);
    } else {
      flushList();
      if (line.trim().length > 0) {
        elements.push(<p key={index} className="my-2">{applyStyling(line)}</p>);
      }
    }
  });

  flushList();
  flushCodeBlock();

  return <>{elements}</>;
};

export default MarkdownRenderer;