

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useAppContext } from '../context/AppContext';
import ErrorDialog from './dialogs/ErrorDialog';
import { LogLevel, LogSource } from '../types';

interface Props {
  children: ReactNode;
  addLog: (log: Omit<any, 'id' | 'timestamp'>) => void;
}

interface State {
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    try {
        this.props.addLog({
            level: LogLevel.ERROR,
            source: LogSource.GENERAL,
            message: `React render error caught by ErrorBoundary: ${error.message}`,
            details: { 
                error: error.toString(), 
                stack: error.stack,
                componentStack: errorInfo.componentStack 
            }
        });
    } catch (loggingError) {
        console.error("--- CRITICAL: Failed to log error to AppContext. This can happen if the context provider itself has crashed. ---", loggingError);
        console.error("--- ORIGINAL RENDER ERROR ---", error, errorInfo);
    }
  }

  private handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    event.preventDefault();
    const error = event.reason instanceof Error ? event.reason : new Error(JSON.stringify(event.reason));
    this.setState({ error, errorInfo: null });
    
    try {
        this.props.addLog({
            level: LogLevel.ERROR,
            source: LogSource.API,
            message: `Unhandled promise rejection caught: ${error.message}`,
            details: {
                error: error.toString(),
                stack: error.stack,
            }
        });
    } catch (loggingError) {
        console.error("--- CRITICAL: Failed to log unhandled rejection to AppContext. ---", loggingError);
        console.error("--- ORIGINAL UNHANDLED REJECTION ---", error);
    }
  };

  componentDidMount() {
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  componentWillUnmount() {
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  public render() {
    if (this.state.error) {
      return <ErrorDialog error={this.state.error} errorInfo={this.state.errorInfo} />;
    }
    return this.props.children;
  }
}

// This wrapper component provides the `addLog` function from context to the class-based ErrorBoundary.
const ErrorBoundaryWithContext: React.FC<{children: ReactNode}> = ({ children }) => {
    const { addLog } = useAppContext();
    return <ErrorBoundary addLog={addLog}>{children}</ErrorBoundary>;
}

export default ErrorBoundaryWithContext;
