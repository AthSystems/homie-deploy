import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";

export interface EntityType {
  key: string;
  displayName: string;
  tableName: string;
  dependents: string[];
}

/**
 * Get available entity types for deletion
 */
export const useEntityTypes = () => {
  return useQuery({
    queryKey: ["entity-types"],
    queryFn: async () => {
      const { data } = await apiClient.get<{ entityTypes: EntityType[] }>(
        "/system/database/entity-types"
      );
      return data.entityTypes;
    },
  });
};

/**
 * Wipe all database data and reset sequences
 * WARNING: This is a destructive operation that cannot be undone
 */
export const useWipeDatabase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.delete<{
        success: boolean;
        message: string;
        deletedCounts: Record<string, number>;
        errors: string[];
      }>("/system/database/wipe");
      return data;
    },
    onSuccess: () => {
      // Invalidate all queries since all data is gone
      queryClient.clear();
    },
  });
};

/**
 * Wipe selected entities and reset their sequences
 * WARNING: This is a destructive operation that cannot be undone
 */
export const useWipeSelectedEntities = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entities: string[]) => {
      const { data } = await apiClient.delete<{
        success: boolean;
        message: string;
        deletedCounts: Record<string, number>;
        entitiesDeleted: string[];
        warnings: string[];
        errors: string[];
      }>("/system/database/wipe-selective", {
        data: { entities },
      });
      return data;
    },
    onSuccess: () => {
      // Invalidate all queries since data may be gone
      queryClient.clear();
    },
  });
};
