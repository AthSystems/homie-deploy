import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import {
  PairingCandidate,
  PairingSuggestRequest,
  PairingSuggestResult,
  PairingConfirmRequest,
  PairingConfirmResult,
} from "../types";

// Query key factory
export const pairingKeys = {
  all: ["pairing"] as const,
  candidates: () => [...pairingKeys.all, "candidates"] as const,
  pending: () => [...pairingKeys.all, "pending"] as const,
  forLeft: (leftId: number) => [...pairingKeys.all, "left", leftId] as const,
};

// Fetch all pairing candidates
export const usePairingCandidates = () => {
  return useQuery({
    queryKey: pairingKeys.candidates(),
    queryFn: async () => {
      const { data } = await apiClient.get<{ candidates: PairingCandidate[]; count: number }>(
        "/staging/pairing/candidates"
      );
      return data.candidates;
    },
  });
};

// Fetch pending pairing candidates
export const usePendingPairingCandidates = () => {
  return useQuery({
    queryKey: pairingKeys.pending(),
    queryFn: async () => {
      const { data } = await apiClient.get<{ candidates: PairingCandidate[]; count: number }>(
        "/staging/pairing/candidates/pending"
      );
      return data.candidates;
    },
  });
};

// Fetch candidates for specific left transaction
export const usePairingCandidatesForLeft = (leftId: number) => {
  return useQuery({
    queryKey: pairingKeys.forLeft(leftId),
    queryFn: async () => {
      const { data } = await apiClient.get<{ candidates: PairingCandidate[]; count: number }>(
        `/staging/pairing/candidates/left/${leftId}`
      );
      return data.candidates;
    },
    enabled: !!leftId,
  });
};

// Generate pairing suggestions
export const useSuggestPairings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request?: PairingSuggestRequest) => {
      const { data } = await apiClient.post<PairingSuggestResult>(
        "/staging/pairing/suggest",
        request || {}
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pairingKeys.all });
    },
  });
};

// Confirm a pairing
export const useConfirmPairing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: PairingConfirmRequest) => {
      const { data } = await apiClient.post<PairingConfirmResult>(
        "/staging/pairing/confirm",
        request
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pairingKeys.all });
      queryClient.invalidateQueries({ queryKey: ["staging"] });
    },
  });
};

// Reject a pairing
export const useRejectPairing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: PairingConfirmRequest) => {
      const { data } = await apiClient.post<{ success: boolean; message: string }>(
        "/staging/pairing/reject",
        request
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pairingKeys.all });
    },
  });
};

// Clear all pairing candidates
export const useClearPairings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.delete<{ success: boolean; message: string }>(
        "/staging/pairing/clear"
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pairingKeys.all });
    },
  });
};
