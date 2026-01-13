import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import type { Account } from "../types";

// Query keys
export const accountKeys = {
  all: ["accounts"] as const,
  lists: () => [...accountKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...accountKeys.lists(), filters] as const,
  details: () => [...accountKeys.all, "detail"] as const,
  detail: (id: number) => [...accountKeys.details(), id] as const,
};

// API functions
export const accountsApi = {
  list: async (): Promise<Account[]> => {
    const { data } = await apiClient.get("/accounts");
    return data.accounts;
  },

  getById: async (id: number): Promise<Account> => {
    const { data } = await apiClient.get(`/accounts/${id}`);
    return data.account;
  },

  create: async (account: Omit<Account, "id" | "balance">): Promise<Account> => {
    const { data } = await apiClient.post("/accounts", account);
    return data.account;
  },

  update: async ({ id, ...account }: Partial<Account> & { id: number }): Promise<Account> => {
    const { data } = await apiClient.put(`/accounts/${id}`, account);
    return data.account;
  },

  updateBalance: async (id: number, balance: number): Promise<Account> => {
    const { data } = await apiClient.put(`/accounts/${id}/balance`, { balance });
    return data.account;
  },

  close: async (id: number, closedAt?: string): Promise<Account> => {
    const { data } = await apiClient.put(`/accounts/${id}/close`, { closedAt });
    return data.account;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/accounts/${id}`);
  },
};

// Hooks
export function useAccounts() {
  return useQuery({
    queryKey: accountKeys.lists(),
    queryFn: accountsApi.list,
  });
}

export function useAccount(id: number) {
  return useQuery({
    queryKey: accountKeys.detail(id),
    queryFn: () => accountsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: accountsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: accountsApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.all });
    },
  });
}

export function useCloseAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, closedAt }: { id: number; closedAt?: string }) =>
      accountsApi.close(id, closedAt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.all });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: accountsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
    },
  });
}
