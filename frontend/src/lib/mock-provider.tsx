'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { mockApiClient, mockSupabaseClient } from './mock-api';

// Mock context for providing mock data
interface MockContextType {
  isMockMode: boolean;
  mockApiClient: typeof mockApiClient;
  mockSupabaseClient: typeof mockSupabaseClient;
}

const MockContext = createContext<MockContextType | null>(null);

// Check if we should use mock mode
const checkMockMode = () => {
  if (typeof window === 'undefined') return false;
  
  return (
    process.env.NEXT_PUBLIC_MOCK_MODE === 'true' ||
    process.env.NEXT_PUBLIC_ENV_MODE === 'MOCK' ||
    !process.env.NEXT_PUBLIC_BACKEND_URL
  );
};

export const MockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMockMode, setIsMockMode] = useState(false);

  useEffect(() => {
    const mockMode = checkMockMode();
    setIsMockMode(mockMode);
    
    if (mockMode) {
      console.log('🔧 Mock mode enabled - using mock data for all API calls');
    }
  }, []);

  const value = {
    isMockMode,
    mockApiClient,
    mockSupabaseClient,
  };

  return (
    <MockContext.Provider value={value}>
      {children}
    </MockContext.Provider>
  );
};

export const useMock = () => {
  const context = useContext(MockContext);
  if (!context) {
    throw new Error('useMock must be used within a MockProvider');
  }
  return context;
};

// Hook to check if mock mode is active
export const useMockMode = () => {
  const context = useContext(MockContext);
  return context?.isMockMode || false;
}; 