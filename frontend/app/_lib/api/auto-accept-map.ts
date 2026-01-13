const API_BASE = 'http://localhost:8080/api/categorization/auto-accept';

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

/**
 * Get all auto-accept mappings with statistics
 */
export async function getAllMappings(): Promise<AutoAcceptMapping[]> {
  const response = await fetch(`${API_BASE}/mappings`);
  if (!response.ok) {
    throw new Error('Failed to fetch mappings');
  }
  const data = await response.json();
  return data.mappings || [];
}

/**
 * Get usage statistics summary
 */
export async function getStatistics(): Promise<AutoAcceptStats> {
  const response = await fetch(`${API_BASE}/statistics`);
  if (!response.ok) {
    throw new Error('Failed to fetch statistics');
  }
  const data = await response.json();
  return data.statistics;
}

/**
 * Add a new auto-accept mapping
 */
export async function addMapping(merchant: string, subcategory: string): Promise<void> {
  const response = await fetch(`${API_BASE}/mappings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ merchant, subcategory }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add mapping');
  }
}

/**
 * Update an existing auto-accept mapping
 */
export async function updateMapping(merchant: string, newSubcategory: string): Promise<void> {
  const response = await fetch(`${API_BASE}/mappings/${encodeURIComponent(merchant)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ newSubcategory }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update mapping');
  }
}

/**
 * Delete an auto-accept mapping
 */
export async function deleteMapping(merchant: string): Promise<void> {
  const response = await fetch(`${API_BASE}/mappings/${encodeURIComponent(merchant)}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete mapping');
  }
}

/**
 * Reload mappings from file
 */
export async function reloadMappings(): Promise<void> {
  const response = await fetch(`${API_BASE}/reload`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to reload mappings');
  }
}

/**
 * Import mappings from JSON config
 */
export async function importMappings(config: AutoAcceptMapConfig): Promise<void> {
  const response = await fetch(`${API_BASE}/import`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to import mappings');
  }
}

/**
 * Export all mappings as JSON config
 */
export async function exportMappings(): Promise<AutoAcceptMapConfig> {
  const response = await fetch(`${API_BASE}/export`);
  if (!response.ok) {
    throw new Error('Failed to export mappings');
  }
  return await response.json();
}

/**
 * Test function: Run auto-accept on existing staging transactions
 * This will check all uncategorized staging transactions against the map
 * and mark matched ones as categorized (removes candidates)
 */
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
  const response = await fetch(`${API_BASE}/test/run-on-staging`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to run auto-accept test');
  }

  return await response.json();
}
