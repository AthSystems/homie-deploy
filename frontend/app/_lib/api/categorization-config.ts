import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const API_BASE_URL = 'http://localhost:8080/api/categorization/config';

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
      const response = await fetch(`${API_BASE_URL}/strategy`);
      if (!response.ok) {
        throw new Error('Failed to fetch categorization strategy');
      }
      return response.json();
    },
  });
}

export function useUpdateCategorizationStrategy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (strategy: string) => {
      const response = await fetch(`${API_BASE_URL}/strategy`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ strategy }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update strategy');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorization-strategy'] });
    },
  });
}
