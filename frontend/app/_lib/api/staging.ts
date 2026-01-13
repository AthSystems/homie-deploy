import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import { StagingTransaction, StagingStats, UploadResult } from "../types";

// Query key factory
export const stagingKeys = {
  all: ["staging"] as const,
  lists: () => [...stagingKeys.all, "list"] as const,
  pending: () => [...stagingKeys.all, "pending"] as const,
  stats: () => [...stagingKeys.all, "stats"] as const,
  details: () => [...stagingKeys.all, "detail"] as const,
  detail: (id: number) => [...stagingKeys.details(), id] as const,
};

// Fetch all staging transactions
export const useStaging = () => {
  return useQuery({
    queryKey: stagingKeys.lists(),
    queryFn: async () => {
      const { data } = await apiClient.get<{ transactions: StagingTransaction[]; count: number }>(
        "/staging/transactions"
      );
      return data.transactions;
    },
  });
};

// Fetch pending staging transactions
export const usePendingStaging = () => {
  return useQuery({
    queryKey: stagingKeys.pending(),
    queryFn: async () => {
      const { data } = await apiClient.get<{ transactions: StagingTransaction[]; count: number }>(
        "/staging/transactions/pending"
      );
      return data.transactions;
    },
  });
};

// Fetch staging statistics
export const useStagingStats = () => {
  return useQuery({
    queryKey: stagingKeys.stats(),
    queryFn: async () => {
      const { data } = await apiClient.get<StagingStats>("/staging/transactions/stats");
      return data;
    },
  });
};

// Fetch single staging transaction
export const useStagingTransaction = (id: number) => {
  return useQuery({
    queryKey: stagingKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<{ transaction: StagingTransaction }>(
        `/staging/transactions/${id}`
      );
      return data.transaction;
    },
    enabled: !!id,
  });
};

// Upload CSV file
export const useUploadCSV = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const { data } = await apiClient.post<UploadResult>(
        "/staging/transactions/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stagingKeys.all });
    },
  });
};

// Delete staging transaction
export const useDeleteStagingTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await apiClient.delete<{ success: boolean; message: string; id: number }>(
        `/staging/transactions/${id}`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stagingKeys.all });
    },
  });
};

// Clear all staging data
export const useClearStaging = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.delete<{ success: boolean; message: string; deleted: number }>(
        "/staging/transactions/clear"
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stagingKeys.all });
    },
  });
};

// Commit all categorized staging transactions to main transactions
export const useCommitAllStaging = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post<{
        success: boolean;
        message: string;
        totalStaging: number;
        committed: number;
        skipped: number;
        failed: number;
        errors: string[];
        committedTransactions: Array<{
          stagingId: number;
          transactionId: number;
          description: string;
          amount: number;
        }>;
      }>("/staging/transactions/commit-all");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stagingKeys.all });
    },
  });
};
