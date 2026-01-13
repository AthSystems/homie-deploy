import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import { Category, ListResponse } from "../types";

interface CreateCategoryInput {
  bucketId: number;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
}

interface UpdateCategoryInput {
  bucketId?: number;
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
}

// Fetch all categories
export const useCategories = (bucketId?: number) => {
  return useQuery({
    queryKey: bucketId ? ["categories", "bucket", bucketId] : ["categories"],
    queryFn: async () => {
      const params = bucketId ? { bucketId } : {};
      const { data } = await apiClient.get<ListResponse<Category>>("/categories", { params });
      return data.categories as Category[];
    },
  });
};

// Fetch single category
export const useCategory = (id: number) => {
  return useQuery({
    queryKey: ["categories", id],
    queryFn: async () => {
      const { data } = await apiClient.get<{ category: Category }>(`/categories/${id}`);
      return data.category;
    },
    enabled: !!id,
  });
};

// Create category
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCategoryInput) => {
      const { data } = await apiClient.post("/categories", input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

// Update category
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateCategoryInput & { id: number }) => {
      const { data } = await apiClient.put(`/categories/${id}`, input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

// Delete category
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};
