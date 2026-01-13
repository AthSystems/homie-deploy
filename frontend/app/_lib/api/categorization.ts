import { apiClient, API_BASE_URL } from "./client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CategorizationCandidate } from "../types";

// Query keys
export const categorizationKeys = {
  all: ["categorization"] as const,
  pending: () => [...categorizationKeys.all, "pending"] as const,
  byTransaction: (id: number) => [...categorizationKeys.all, "transaction", id] as const,
};

// Types
export interface SuggestCategorizationRequest {
  topK?: number;
  minConfidence?: number;
}

export interface SuggestCategorizationResult {
  success: boolean;
  message: string;
  transactions: number;
  candidatesGenerated: number;
}

export interface CategorizationProgress {
  type: "progress" | "complete" | "error";
  transactionId?: number;
  transactionDescription?: string;
  candidatesGenerated?: number;
  totalTransactions?: number;
  processedTransactions?: number;
  message?: string;
  error?: string;
}

export interface ConfirmCategorizationRequest {
  candidateId: number;
}

export interface ConfirmCategorizationResult {
  success: boolean;
  message: string;
  candidateId: number;
  subcategoryId: string;
  subcategoryName: string;
}

export interface RejectCategorizationRequest {
  candidateId: number;
}

// Hooks

/**
 * Get all pending categorization candidates
 */
export const usePendingCategorizationCandidates = () => {
  return useQuery({
    queryKey: categorizationKeys.pending(),
    queryFn: async () => {
      const { data } = await apiClient.get<{ candidates: CategorizationCandidate[] }>(
        "/staging/categorization/candidates/pending"
      );
      return data.candidates;
    },
  });
};

/**
 * Get categorization candidates for a specific transaction
 */
export const useCategorizationCandidatesByTransaction = (stagingTxId: number) => {
  return useQuery({
    queryKey: categorizationKeys.byTransaction(stagingTxId),
    queryFn: async () => {
      const { data } = await apiClient.get<{ candidates: CategorizationCandidate[] }>(
        `/staging/categorization/candidates/transaction/${stagingTxId}`
      );
      return data.candidates;
    },
  });
};

/**
 * Suggest categorizations for uncategorized transactions
 */
export const useSuggestCategorizations = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: SuggestCategorizationRequest = {}) => {
      const { data } = await apiClient.post<SuggestCategorizationResult>(
        "/staging/categorization/suggest",
        request
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categorizationKeys.all });
      queryClient.invalidateQueries({ queryKey: ["staging"] });
    },
  });
};

/**
 * Confirm a categorization suggestion
 */
export const useConfirmCategorization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: ConfirmCategorizationRequest) => {
      const { data} = await apiClient.post<ConfirmCategorizationResult>(
        "/staging/categorization/confirm",
        request
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categorizationKeys.all });
      queryClient.invalidateQueries({ queryKey: ["staging"] });
    },
  });
};

/**
 * Reject a categorization suggestion
 */
export const useRejectCategorization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: RejectCategorizationRequest) => {
      const { data } = await apiClient.post<{ success: boolean; message: string }>(
        "/staging/categorization/reject",
        request
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categorizationKeys.all });
    },
  });
};

/**
 * Clear all categorization candidates
 */
export const useClearCategorizationCandidates = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.delete<{ success: boolean; message: string }>(
        "/staging/categorization/candidates"
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categorizationKeys.all });
    },
  });
};

/**
 * Manually categorize a transaction with a specific subcategory
 */
export const useManualCategorization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ stagingTxId, subcategoryId }: { stagingTxId: number; subcategoryId: number }) => {
      const { data } = await apiClient.post<{ success: boolean; message: string }>(
        "/staging/categorization/manual",
        { stagingTxId, subcategoryId }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categorizationKeys.all });
      queryClient.invalidateQueries({ queryKey: ["staging"] });
    },
  });
};

/**
 * Stream categorization suggestions in real-time
 *
 * @param request Categorization request
 * @param onProgress Callback for each progress event
 * @param onComplete Callback when categorization completes
 * @param onError Callback for errors
 */
export const streamCategorizationSuggestions = async (
  request: SuggestCategorizationRequest = {},
  onProgress: (progress: CategorizationProgress) => void,
  onComplete: (progress: CategorizationProgress) => void,
  onError: (error: string) => void
): Promise<void> => {
  const url = `${API_BASE_URL}/staging/categorization/suggest-stream`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error("Response body is null");
    }

    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Process complete SSE messages
      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.startsWith("data:")) {
          const jsonStr = line.substring(5).trim();
          if (jsonStr) {
            try {
              const progress: CategorizationProgress = JSON.parse(jsonStr);

              if (progress.type === "progress") {
                onProgress(progress);
              } else if (progress.type === "complete") {
                onComplete(progress);
              } else if (progress.type === "error") {
                onError(progress.error || "Unknown error");
              }
            } catch (e) {
              console.error("Failed to parse SSE data:", jsonStr, e);
            }
          }
        }
      }
    }
  } catch (error) {
    onError(error instanceof Error ? error.message : "Unknown error");
  }
};
