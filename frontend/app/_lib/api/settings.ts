import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';

const API_PATH = '/settings';

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
      const response = await apiClient.get(API_PATH);
      return response.data;
    },
  });
}

// Get LLM settings
export function useLLMSettings() {
  return useQuery<LLMSettings>({
    queryKey: ['settings', 'llm'],
    queryFn: async () => {
      const response = await apiClient.get(`${API_PATH}/llm`);
      return response.data;
    },
  });
}

// Update LLM settings
export function useUpdateLLMSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: LLMSettingsUpdate) => {
      const response = await apiClient.put(`${API_PATH}/llm`, settings);
      return response.data;
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
      const response = await apiClient.post(`${API_PATH}/categorization/reload-rules`);
      return response.data;
    },
  });
}

// Test LLM connection
export function useTestLLMConnection() {
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post(`${API_PATH}/llm/test`);
      return response.data;
    },
  });
}

// Get available models from OpenRouter
export function useOpenRouterModels(enabled: boolean = true) {
  return useQuery<ModelInfo[]>({
    queryKey: ['settings', 'llm', 'openrouter', 'models'],
    queryFn: async () => {
      const response = await apiClient.get(`${API_PATH}/llm/providers/openrouter/models`);
      return response.data.models || [];
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
      const response = await apiClient.get(`${API_PATH}/llm/providers/ollama/models`);
      return response.data.models || [];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1,
    enabled, // Allow conditional fetching
  });
}
