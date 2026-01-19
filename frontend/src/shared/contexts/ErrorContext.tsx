import React, { createContext, useContext, ReactNode } from 'react';
import { toast } from '@/shared/hooks/use-toast';

interface ErrorContextType {
  handleError: (error: Error | string, title?: string) => void;
  handleSuccess: (message: string, title?: string) => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const ErrorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const handleError = (error: Error | string, title = 'Error') => {
    const message = error instanceof Error ? error.message : error;
    toast({
      title,
      description: message,
      variant: 'destructive',
    });
  };

  const handleSuccess = (message: string, title = 'Success') => {
    toast({
      title,
      description: message,
      variant: 'default',
    });
  };

  const value: ErrorContextType = {
    handleError,
    handleSuccess,
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useError = () => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

export default ErrorContext;
