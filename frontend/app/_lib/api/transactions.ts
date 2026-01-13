import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import { Transaction, TransactionType, TransactionStatus, ListResponse } from "../types";

interface CreateTransactionInput {
  accountId: number;
  amount: number;
  type: TransactionType;
  subcategoryId?: number;
  date?: string;
  description?: string;
  notes?: string;
  tags?: string[];
  status?: TransactionStatus;
  isReconciled?: boolean;
}

interface CreateTransferInput {
  fromAccountId: number;
  toAccountId: number;
  amount: number;
  date?: string;
  description?: string;
  notes?: string;
}

interface UpdateTransactionInput {
  accountId?: number;
  amount?: number;
  type?: TransactionType;
  subcategoryId?: number;
  date?: string;
  description?: string;
  notes?: string;
  tags?: string[];
  status?: TransactionStatus;
  isReconciled?: boolean;
}

interface TransactionFilters {
  accountId?: number;
  subcategoryId?: number;
  startDate?: string;
  endDate?: string;
}

// Fetch transactions with optional filters
export const useTransactions = (filters?: TransactionFilters) => {
  return useQuery({
    queryKey: ["transactions", filters],
    queryFn: async () => {
      const { data } = await apiClient.get<ListResponse<Transaction>>("/transactions", {
        params: filters,
      });
      return data.transactions as Transaction[];
    },
  });
};

// Fetch single transaction
export const useTransaction = (id: number) => {
  return useQuery({
    queryKey: ["transactions", id],
    queryFn: async () => {
      const { data } = await apiClient.get<{ transaction: Transaction }>(`/transactions/${id}`);
      return data.transaction;
    },
    enabled: !!id,
  });
};

// Create transaction
export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTransactionInput) => {
      const { data } = await apiClient.post("/transactions", input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
};

// Create transfer
export const useCreateTransfer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTransferInput) => {
      const { data } = await apiClient.post("/transactions/transfer", input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
};

// Update transaction
export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateTransactionInput & { id: number }) => {
      const { data } = await apiClient.put(`/transactions/${id}`, input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
};

// Reconcile transaction
export const useReconcileTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await apiClient.put(`/transactions/${id}/reconcile`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
};

// Delete transaction
export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
};
