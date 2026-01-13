import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';

const API_PATH = '/categorization/config';

export interface StrategyOption {
  value: string;
  description: string;
}

export interface StrategyConfig {
  strategy: string;
  strategyEnum: string;
  availableStrategies: StrategyOption[];
}

export function useCategorizationStrategy() {
  return useQuery<StrategyConfig>({
    queryKey: ['categorization-strategy'],
    queryFn: async () => {
      const response = await apiClient.get(`${API_PATH}/strategy`);
      return response.data;
    },
  });
}

export function useUpdateCategorizationStrategy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (strategy: string) => {
      const response = await apiClient.put(`${API_PATH}/strategy`, { strategy });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorization-strategy'] });
    },
  });
}
