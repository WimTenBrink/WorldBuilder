
import React from 'react';

interface ErrorDialogProps {
  error: Error;
  errorInfo: React.ErrorInfo | null;
}

const ErrorDialog: React.FC<ErrorDialogProps> = ({ error, errorInfo }) => {
    const handleReload = () => {
        window.location.reload();
    };
    
    const handleCopy = () => {
        const details = `Error: ${error.message}\n\nStack:\n${error.stack}\n\nComponent Stack:\n${errorInfo?.componentStack || 'N/A'}`;
        navigator.clipboard.writeText(details)
            .catch(err => console.error('Failed to copy error details:', err));
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-red-900/50 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-surface-light dark:bg-surface-dark rounded-2xl shadow-2xl flex flex-col overflow-hidden border-2 border-red-500 m-4">
                <header className="flex items-center justify-between p-6 border-b border-red-500/30 bg-red-500/10">
                    <h2 className="text-2xl font-bold text-red-700 dark:text-red-400">An Unexpected Error Occurred</h2>
                </header>
                <div className="p-6 overflow-y-auto flex-grow max-h-[70vh]">
                    <p className="text-text-primary-light dark:text-text-primary-dark">
                        The application has encountered a critical error and cannot continue.
                        Please reload the application to try again.
                    </p>
                    <p className="mt-4 text-sm text-text-secondary-light dark:text-text-secondary-dark bg-slate-100 dark:bg-slate-900/50 p-3 rounded-md border border-border-light dark:border-border-dark">
                        <strong>Error:</strong> {error.message}
                    </p>

                     <div className="mt-4">
                        <details className="border border-border-light dark:border-border-dark rounded-lg">
                            <summary className="p-3 font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
                                Technical Details
                            </summary>
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border-t border-border-light dark:border-border-dark">
                                <pre className="text-xs text-text-secondary-light dark:text-text-secondary-dark whitespace-pre-wrap break-all">
                                    <strong>Stack Trace:</strong><br />
                                    {error.stack}
                                    <br /><br />
                                    {errorInfo && <><strong>Component Stack:</strong><br />{errorInfo.componentStack}</>}
                                </pre>
                            </div>
                        </details>
                    </div>
                </div>
                 <footer className="flex justify-end gap-4 p-4 border-t border-border-light dark:border-border-dark flex-shrink-0 bg-surface-light dark:bg-surface-dark">
                    <button onClick={handleCopy} className="px-4 py-2 text-sm font-semibold rounded-md transition-colors text-text-primary-light dark:text-text-primary-dark bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500">
                        Copy Details
                    </button>
                    <button onClick={handleReload} className="px-6 py-2 text-sm font-semibold rounded-md transition-colors text-white bg-red-600 hover:bg-red-700">
                        Reload Application
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default ErrorDialog;