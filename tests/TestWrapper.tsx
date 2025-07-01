import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../src/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

interface TestWrapperProps {
  children: React.ReactNode;
}

const TestWrapper: React.FC<TestWrapperProps> = ({ children }) => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default TestWrapper;
