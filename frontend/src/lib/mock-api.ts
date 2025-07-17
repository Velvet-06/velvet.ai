// Mock API interceptor for frontend-only development
// This provides dummy data when backend is not available

export interface MockApiResponse<T = any> {
  data?: T;
  error?: any;
  success: boolean;
}

// Mock data for different endpoints
const mockData = {
  agents: {
    agents: [
      {
        id: 'mock-agent-1',
        name: 'Research Assistant',
        description: 'A helpful research agent',
        avatar: '🔍',
        avatar_color: '#3B82F6',
        is_default: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        tools_count: 5,
        has_mcp_tools: true,
        has_agentpress_tools: false
      },
      {
        id: 'mock-agent-2',
        name: 'Data Analyst',
        description: 'Analyzes data and creates reports',
        avatar: '📊',
        avatar_color: '#10B981',
        is_default: false,
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
        tools_count: 3,
        has_mcp_tools: false,
        has_agentpress_tools: true
      }
    ],
    pagination: {
      page: 1,
      limit: 20,
      total: 2,
      total_pages: 1
    }
  },
  threads: {
    threads: [
      {
        id: 'mock-thread-1',
        name: 'Market Research Discussion',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T12:00:00Z',
        message_count: 15
      },
      {
        id: 'mock-thread-2',
        name: 'Data Analysis Project',
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-02T18:00:00Z',
        message_count: 8
      }
    ]
  },
  marketplace: {
    templates: [
      {
        template_id: 'mock-template-1',
        name: 'SEO Analyzer',
        description: 'Analyzes websites for SEO optimization',
        tags: ['seo', 'analysis', 'web'],
        download_count: 150,
        creator_name: 'Kortix Team',
        created_at: '2024-01-01T00:00:00Z',
        marketplace_published_at: '2024-01-01T00:00:00Z',
        avatar: '🔍',
        avatar_color: '#3B82F6',
        is_kortix_team: true,
        mcp_requirements: [],
        metadata: {}
      },
      {
        template_id: 'mock-template-2',
        name: 'Data Scraper',
        description: 'Scrapes data from websites',
        tags: ['scraping', 'data', 'automation'],
        download_count: 89,
        creator_name: 'Community User',
        created_at: '2024-01-02T00:00:00Z',
        marketplace_published_at: '2024-01-02T00:00:00Z',
        avatar: '🕷️',
        avatar_color: '#8B5CF6',
        is_kortix_team: false,
        mcp_requirements: [],
        metadata: {}
      }
    ]
  },
  user: {
    id: 'mock-user-1',
    email: 'demo@example.com',
    name: 'Demo User',
    avatar_url: null
  }
};

// Mock API client that intercepts requests
export const mockApiClient = {
  async request<T = any>(
    url: string,
    options: RequestInit & { showErrors?: boolean; errorContext?: any; timeout?: number } = {}
  ): Promise<MockApiResponse<T>> {
    const { method = 'GET' } = options;
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Parse URL to determine endpoint
    const urlPath = new URL(url, 'http://localhost').pathname;
    
    try {
      let data: T;
      
      // Route requests to appropriate mock data
      if ((urlPath.includes('/health') || urlPath.includes('/status') || urlPath.includes('/health-docker')) && method === 'GET') {
        data = { status: 'ok', timestamp: new Date().toISOString(), instance_id: 'mock-instance' } as T;
      } else if (urlPath.includes('/agents/prompt') && method === 'POST') {
        // Always return the same output for testing
        data = {
          output: 'This is a mock response to your prompt!',
          prompt: typeof options.body === 'string'
            ? JSON.parse(options.body || '{}').prompt || 'No prompt provided'
            : 'No prompt provided',
          timestamp: new Date().toISOString(),
        } as T;
      } else if (urlPath.includes('/agents') && method === 'GET') {
        data = mockData.agents as T;
      } else if (urlPath.includes('/threads') && method === 'GET') {
        data = mockData.threads as T;
      } else if (urlPath.includes('/marketplace') && method === 'GET') {
        data = mockData.marketplace as T;
      } else if (urlPath.includes('/user') && method === 'GET') {
        data = mockData.user as T;
      } else if (method === 'POST') {
        // For POST requests, return success response
        data = { success: true, message: 'Mock operation completed' } as T;
      } else {
        // Default response for unknown endpoints
        data = { message: 'Mock endpoint' } as T;
      }
      
      return {
        data,
        success: true,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error : new Error('Mock API error'),
        success: false,
      };
    }
  },

  get: async <T = any>(url: string, options?: any): Promise<MockApiResponse<T>> => {
    return mockApiClient.request<T>(url, { ...options, method: 'GET' });
  },

  post: async <T = any>(url: string, data?: any, options?: any): Promise<MockApiResponse<T>> => {
    return mockApiClient.request<T>(url, { ...options, method: 'POST', body: JSON.stringify(data) });
  },

  put: async <T = any>(url: string, data?: any, options?: any): Promise<MockApiResponse<T>> => {
    return mockApiClient.request<T>(url, { ...options, method: 'PUT', body: JSON.stringify(data) });
  },

  patch: async <T = any>(url: string, data?: any, options?: any): Promise<MockApiResponse<T>> => {
    return mockApiClient.request<T>(url, { ...options, method: 'PATCH', body: JSON.stringify(data) });
  },

  delete: async <T = any>(url: string, options?: any): Promise<MockApiResponse<T>> => {
    return mockApiClient.request<T>(url, { ...options, method: 'DELETE' });
  },
};

// Mock Supabase client
export const mockSupabaseClient = {
  auth: {
    getSession: async () => ({
      data: {
        session: {
          access_token: 'mock-access-token',
          user: mockData.user
        }
      },
      error: null
    }),
    signInWithOAuth: async () => ({ data: {}, error: null }),
    signOut: async () => ({ error: null })
  },
  from: (table: string) => ({
    select: () => ({
      eq: () => Promise.resolve({ data: [], error: null }),
      order: () => Promise.resolve({ data: [], error: null })
    }),
    insert: () => Promise.resolve({ data: [], error: null }),
    update: () => Promise.resolve({ data: [], error: null }),
    delete: () => Promise.resolve({ data: [], error: null })
  })
}; 