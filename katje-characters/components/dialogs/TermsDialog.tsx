
import React, { useState, useEffect } from 'react';
import Dialog from '../ui/Dialog';
import { useAppContext } from '../../context/AppContext';
import { DialogType, LogLevel, LogSource } from '../../types';
import MarkdownRenderer from '../../utils/markdownRenderer';

const TermsDialog: React.FC = () => {
    const { openDialog, showDialog, addLog } = useAppContext();
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (openDialog === DialogType.Terms) {
            setLoading(true);
            fetch('/tos.md')
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Failed to load Terms of Service: ${response.statusText}`);
                    }
                    return response.text();
                })
                .then(text => {
                    setContent(text);
                    setLoading(false);
                })
                .catch(error => {
                    console.error('Error fetching tos.md:', error);
                    addLog({
                        level: LogLevel.ERROR,
                        source: LogSource.HTTP,
                        message: 'Failed to fetch tos.md',
                        details: error.toString()
                    });
                    setContent('## Error\nCould not load the Terms of Service. Please try again later.');
                    setLoading(false);
                });
        }
    }, [openDialog, addLog]);

    return (
        <Dialog
            isOpen={openDialog === DialogType.Terms}
            onClose={() => showDialog(null)}
            title="Terms of Service"
        >
            <div className="prose prose-slate dark:prose-invert max-w-none text-text-primary-light dark:text-text-primary-dark">
                 {loading ? (
                    <p>Loading terms...</p>
                ) : (
                    <MarkdownRenderer content={content} />
                )}
            </div>
        </Dialog>
    );
};

export default TermsDialog;
