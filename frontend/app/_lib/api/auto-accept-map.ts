import { apiClient } from './client';

const API_PATH = '/categorization/auto-accept';

export interface AutoAcceptMapping {
  merchant: string;
  subcategory: string;
  matchCount?: number;
  lastMatched?: string | null;
}

export interface AutoAcceptStats {
  totalMappings: number;
  totalAutoAccepted: number;
  mostUsed: Array<{ merchant: string; count: number }>;
  leastUsed: Array<{ merchant: string; count: number }>;
}

export interface AutoAcceptMapConfig {
  version: string;
  description: string;
  caseSensitive: boolean;
  matchMode: string;
  mappings: Record<string, string>;
  statistics: Record<string, { matchCount: number; lastMatched: string | null }>;
}

export async function getAllMappings(): Promise<AutoAcceptMapping[]> {
  const response = await apiClient.get(`${API_PATH}/mappings`);
  return response.data.mappings || [];
}

export async function getStatistics(): Promise<AutoAcceptStats> {
  const response = await apiClient.get(`${API_PATH}/statistics`);
  return response.data.statistics;
}

export async function addMapping(merchant: string, subcategory: string): Promise<void> {
  await apiClient.post(`${API_PATH}/mappings`, { merchant, subcategory });
}

export async function updateMapping(merchant: string, newSubcategory: string): Promise<void> {
  await apiClient.put(`${API_PATH}/mappings/${encodeURIComponent(merchant)}`, { newSubcategory });
}

export async function deleteMapping(merchant: string): Promise<void> {
  await apiClient.delete(`${API_PATH}/mappings/${encodeURIComponent(merchant)}`);
}

export async function reloadMappings(): Promise<void> {
  await apiClient.post(`${API_PATH}/reload`);
}

export async function importMappings(config: AutoAcceptMapConfig): Promise<void> {
  await apiClient.post(`${API_PATH}/import`, config);
}

export async function exportMappings(): Promise<AutoAcceptMapConfig> {
  const response = await apiClient.get(`${API_PATH}/export`);
  return response.data;
}

export async function runAutoAcceptOnStaging(): Promise<{
  success: boolean;
  message: string;
  totalStaging: number;
  processed: number;
  autoAccepted: number;
  candidatesDeleted: number;
  acceptedTransactions: Array<{
    id: number;
    description: string;
    subcategoryId: number;
    candidatesRemoved: number;
  }>;
}> {
  const response = await apiClient.post(`${API_PATH}/test/run-on-staging`);
  return response.data;
}
