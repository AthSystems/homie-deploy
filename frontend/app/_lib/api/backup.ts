import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";

// Types
export interface BackupMetadata {
  version: string;
  timestamp: string;
  application: string;
  counts: BackupCounts;
}

export interface BackupCounts {
  owners: number;
  buckets: number;
  categories: number;
  subcategories: number;
  accounts: number;
  accountOwners: number;
  transactions: number;
}

export interface ValidationResult {
  valid: boolean;
  message: string;
  metadata: BackupMetadata | null;
  errors: string[];
}

export interface RestoreResult {
  success: boolean;
  message: string;
  restoredCounts: Record<string, number>;
  errors: string[];
}

// Query keys
export const backupKeys = {
  all: ["backup"] as const,
  metadata: () => [...backupKeys.all, "metadata"] as const,
};

// API functions
export const backupApi = {
  /**
   * Get backup metadata (record counts).
   */
  getMetadata: async (): Promise<BackupMetadata> => {
    const { data } = await apiClient.get("/backup/metadata");
    return data;
  },

  /**
   * Download backup file.
   * Downloads the file directly to the browser.
   */
  downloadBackup: async (compress: boolean = true): Promise<void> => {
    const response = await apiClient.get("/backup/export", {
      params: { compress },
      responseType: "blob",
    });

    // Extract filename from Content-Disposition header
    const contentDisposition = response.headers["content-disposition"];
    let filename = `homie-backup-${new Date().toISOString()}.${compress ? "json.gz" : "json"}`;
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+?)"?$/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  /**
   * Validate uploaded backup file.
   */
  validateBackup: async (file: File, compress: boolean = true): Promise<ValidationResult> => {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await apiClient.post("/backup/validate", formData, {
      params: { compress },
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return data;
  },

  /**
   * Restore from backup file.
   * WARNING: This will wipe all existing data!
   */
  restoreBackup: async (file: File, compress: boolean = true): Promise<RestoreResult> => {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await apiClient.post("/backup/restore", formData, {
      params: { compress },
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return data;
  },
};

// Hooks

/**
 * Get backup metadata (record counts).
 */
export function useBackupMetadata() {
  return useQuery({
    queryKey: backupKeys.metadata(),
    queryFn: backupApi.getMetadata,
  });
}

/**
 * Download backup file.
 */
export function useDownloadBackup() {
  return useMutation({
    mutationFn: (compress: boolean = true) => backupApi.downloadBackup(compress),
  });
}

/**
 * Validate backup file.
 */
export function useValidateBackup() {
  return useMutation({
    mutationFn: ({ file, compress = true }: { file: File; compress?: boolean }) =>
      backupApi.validateBackup(file, compress),
  });
}

/**
 * Restore from backup file.
 * WARNING: This will wipe all existing data!
 */
export function useRestoreBackup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, compress = true }: { file: File; compress?: boolean }) =>
      backupApi.restoreBackup(file, compress),
    onSuccess: () => {
      // Invalidate all queries after restore since all data has changed
      queryClient.invalidateQueries();
    },
  });
}
