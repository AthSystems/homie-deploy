import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import { Subcategory, ListResponse } from "../types";

interface CreateSubcategoryInput {
  categoryId: number;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
}

interface UpdateSubcategoryInput {
  categoryId?: number;
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
}

// Fetch all subcategories
export const useSubcategories = (categoryId?: number) => {
  return useQuery({
    queryKey: categoryId ? ["subcategories", "category", categoryId] : ["subcategories"],
    queryFn: async () => {
      const params = categoryId ? { categoryId } : {};
      const { data } = await apiClient.get<ListResponse<Subcategory>>("/subcategories", { params });
      return data.subcategories as Subcategory[];
    },
  });
};

// Fetch single subcategory
export const useSubcategory = (id: number) => {
  return useQuery({
    queryKey: ["subcategories", id],
    queryFn: async () => {
      const { data } = await apiClient.get<{ subcategory: Subcategory }>(`/subcategories/${id}`);
      return data.subcategory;
    },
    enabled: !!id,
  });
};

// Create subcategory
export const useCreateSubcategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateSubcategoryInput) => {
      const { data } = await apiClient.post("/subcategories", input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
    },
  });
};

// Update subcategory
export const useUpdateSubcategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateSubcategoryInput & { id: number }) => {
      const { data } = await apiClient.put(`/subcategories/${id}`, input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
    },
  });
};

// Delete subcategory
export const useDeleteSubcategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/subcategories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
    },
  });
};
