import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const API_BASE_URL = 'http://localhost:8080/api/settings';

export interface OperationConfig {
  provider: string;
  model: string;
  description: string;
  providerConfig: {
    apiKey?: string;
    baseUrl: string;
  };
}

export interface LLMSettings {
  operations: {
    similarityQuery: OperationConfig;
    categorization: OperationConfig;
    tieBreaker: OperationConfig;
  };
  providers: {
    openrouter: {
      apiKey: string;
      baseUrl: string;
    };
    ollama: {
      baseUrl: string;
    };
  };
}

// Update request types (partial, no description or providerConfig needed)
export interface OperationUpdate {
  provider?: string;
  model?: string;
}

export interface LLMSettingsUpdate {
  operations?: {
    similarityQuery?: OperationUpdate;
    categorization?: OperationUpdate;
    tieBreaker?: OperationUpdate;
  };
  providers?: {
    openrouter?: {
      apiKey?: string;
      baseUrl?: string;
    };
    ollama?: {
      baseUrl?: string;
    };
  };
}

export interface CategorizationSettings {
  strategy: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  description?: string;
}

export interface AllSettings {
  llm: LLMSettings;
  categorization: CategorizationSettings;
}

// Get all settings
export function useSettings() {
  return useQuery<AllSettings>({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}`);
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }
      return response.json();
    },
  });
}

// Get LLM settings
export function useLLMSettings() {
  return useQuery<LLMSettings>({
    queryKey: ['settings', 'llm'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/llm`);
      if (!response.ok) {
        throw new Error('Failed to fetch LLM settings');
      }
      return response.json();
    },
  });
}

// Update LLM settings
export function useUpdateLLMSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: LLMSettingsUpdate) => {
      const response = await fetch(`${API_BASE_URL}/llm`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update LLM settings');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}

// Reload categorization rules
export function useReloadCategorizationRules() {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_BASE_URL}/categorization/reload-rules`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reload rules');
      }

      return response.json();
    },
  });
}

// Test LLM connection
export function useTestLLMConnection() {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_BASE_URL}/llm/test`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Connection test failed');
      }

      return response.json();
    },
  });
}

// Get available models from OpenRouter
export function useOpenRouterModels(enabled: boolean = true) {
  return useQuery<ModelInfo[]>({
    queryKey: ['settings', 'llm', 'openrouter', 'models'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/llm/providers/openrouter/models`);
      if (!response.ok) {
        throw new Error('Failed to fetch OpenRouter models');
      }
      const data = await response.json();
      return data.models || [];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1,
    enabled, // Allow conditional fetching
  });
}

// Get available models from Ollama
export function useOllamaModels(enabled: boolean = true) {
  return useQuery<ModelInfo[]>({
    queryKey: ['settings', 'llm', 'ollama', 'models'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/llm/providers/ollama/models`);
      if (!response.ok) {
        throw new Error('Failed to fetch Ollama models');
      }
      const data = await response.json();
      return data.models || [];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1,
    enabled, // Allow conditional fetching
  });
}
