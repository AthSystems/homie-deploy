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

  reconcileBalance: async (
    id: number,
    asOfDate: string,
    knownBalance: number
  ): Promise<ReconcileBalanceResponse> => {
    const { data } = await apiClient.post(`/accounts/${id}/reconcile-balance`, {
      asOfDate,
      knownBalance,
    });
    return data;
  },

  getBalanceAtDate: async (
    id: number,
    asOfDate: string
  ): Promise<BalanceAtDateResponse> => {
    const { data } = await apiClient.get(`/accounts/${id}/balance-at-date`, {
      params: { asOfDate },
    });
    return data;
  },

  recalculateBalance: async (id: number): Promise<RecalculateBalanceResponse> => {
    const { data } = await apiClient.post(`/accounts/${id}/recalculate-balance`);
    return data;
  },

  recalculateAllBalances: async (): Promise<RecalculateAllBalancesResponse> => {
    const { data } = await apiClient.post("/accounts/recalculate-all-balances");
    return data;
  },
};

// Response types for reconciliation
export interface ReconcileBalanceResponse {
  accountId: number;
  asOfDate: string;
  knownBalance: number;
  previousInitialBalance: number;
  newInitialBalance: number;
  transactionSumToDate: number;
  previousBalance: number;
  newBalance: number;
  account: Account;
}

export interface BalanceAtDateResponse {
  accountId: number;
  accountName: string;
  asOfDate: string;
  initialBalance: number;
  transactionSumToDate: number;
  calculatedBalanceAtDate: number;
  transactionCountToDate: number;
  transactionSumAfterDate: number;
  transactionCountAfterDate: number;
  currentBalance: number;
}

export interface RecalculateBalanceResponse {
  accountId: number;
  previousBalance: number;
  newBalance: number;
  transactionSum: number;
  account: Account;
}

export interface RecalculateAllBalancesResponse {
  accountsUpdated: number;
  results: RecalculateBalanceResponse[];
}

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

export function useReconcileBalance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      asOfDate,
      knownBalance,
    }: {
      id: number;
      asOfDate: string;
      knownBalance: number;
    }) => accountsApi.reconcileBalance(id, asOfDate, knownBalance),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.all });
    },
  });
}

export function useBalanceAtDate(id: number, asOfDate: string | null) {
  return useQuery({
    queryKey: [...accountKeys.detail(id), "balanceAtDate", asOfDate],
    queryFn: () => accountsApi.getBalanceAtDate(id, asOfDate!),
    enabled: !!id && !!asOfDate,
  });
}

export function useRecalculateBalance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: accountsApi.recalculateBalance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.all });
    },
  });
}

export function useRecalculateAllBalances() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: accountsApi.recalculateAllBalances,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.all });
    },
  });
}
