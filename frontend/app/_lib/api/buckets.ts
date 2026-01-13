import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import { Bucket, ListResponse } from "../types";

interface CreateBucketInput {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
}

interface UpdateBucketInput {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
}

// Fetch all buckets
export const useBuckets = () => {
  return useQuery({
    queryKey: ["buckets"],
    queryFn: async () => {
      const { data } = await apiClient.get<ListResponse<Bucket>>("/buckets");
      return data.buckets as Bucket[];
    },
  });
};

// Fetch single bucket
export const useBucket = (id: number) => {
  return useQuery({
    queryKey: ["buckets", id],
    queryFn: async () => {
      const { data } = await apiClient.get<{ bucket: Bucket }>(`/buckets/${id}`);
      return data.bucket;
    },
    enabled: !!id,
  });
};

// Create bucket
export const useCreateBucket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateBucketInput) => {
      const { data } = await apiClient.post("/buckets", input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buckets"] });
    },
  });
};

// Update bucket
export const useUpdateBucket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateBucketInput & { id: number }) => {
      const { data } = await apiClient.put(`/buckets/${id}`, input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buckets"] });
    },
  });
};

// Delete bucket
export const useDeleteBucket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/buckets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buckets"] });
    },
  });
};
