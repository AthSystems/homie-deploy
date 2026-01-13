import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import type { Owner } from "../types";

// Query keys
export const ownerKeys = {
  all: ["owners"] as const,
  lists: () => [...ownerKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...ownerKeys.lists(), filters] as const,
  details: () => [...ownerKeys.all, "detail"] as const,
  detail: (id: number) => [...ownerKeys.details(), id] as const,
};

// API functions
export const ownersApi = {
  list: async (): Promise<Owner[]> => {
    const { data } = await apiClient.get("/owners");
    return data.owners;
  },

  getById: async (id: number): Promise<Owner> => {
    const { data } = await apiClient.get(`/owners/${id}`);
    return data.owner;
  },

  create: async (owner: Omit<Owner, "id">): Promise<Owner> => {
    const { data } = await apiClient.post("/owners", owner);
    return data.owner;
  },

  update: async ({ id, ...owner }: Partial<Owner> & { id: number }): Promise<Owner> => {
    const { data } = await apiClient.put(`/owners/${id}`, owner);
    return data.owner;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/owners/${id}`);
  },
};

// Hooks
export function useOwners() {
  return useQuery({
    queryKey: ownerKeys.lists(),
    queryFn: ownersApi.list,
  });
}

export function useOwner(id: number) {
  return useQuery({
    queryKey: ownerKeys.detail(id),
    queryFn: () => ownersApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateOwner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ownersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ownerKeys.lists() });
    },
  });
}

export function useUpdateOwner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ownersApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ownerKeys.all });
    },
  });
}

export function useDeleteOwner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ownersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ownerKeys.lists() });
    },
  });
}
