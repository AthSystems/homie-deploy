import { apiClient } from "./client";
import { CategorizationRuleV3, RulePerformanceAnalysis } from "../types";

const BASE_URL = "/categorization/v3";

// Rule retrieval
export async function getAllRulesV3(params?: {
  status?: string;
  source?: string;
}): Promise<CategorizationRuleV3[]> {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append("status", params.status);
  if (params?.source) queryParams.append("source", params.source);

  const url = queryParams.toString()
    ? `${BASE_URL}/rules?${queryParams.toString()}`
    : `${BASE_URL}/rules`;

  const response = await apiClient.get<CategorizationRuleV3[]>(url);
  return response.data;
}

export async function getActiveRulesV3(): Promise<CategorizationRuleV3[]> {
  const response = await apiClient.get<CategorizationRuleV3[]>(
    `${BASE_URL}/rules/active`
  );
  return response.data;
}

export async function getSuggestedRulesV3(): Promise<CategorizationRuleV3[]> {
  const response = await apiClient.get<CategorizationRuleV3[]>(
    `${BASE_URL}/rules/suggested`
  );
  return response.data;
}

export async function getLLMGeneratedRulesV3(): Promise<
  CategorizationRuleV3[]
> {
  const response = await apiClient.get<CategorizationRuleV3[]>(
    `${BASE_URL}/rules/llm-generated`
  );
  return response.data;
}

export async function getRuleV3(id: string): Promise<CategorizationRuleV3> {
  const response = await apiClient.get<CategorizationRuleV3>(
    `${BASE_URL}/rules/${id}`
  );
  return response.data;
}

// Rule management
export async function addRuleV3(
  rule: CategorizationRuleV3
): Promise<{ success: boolean; message: string; ruleId: string }> {
  const response = await apiClient.post<{
    success: boolean;
    message: string;
    ruleId: string;
  }>(`${BASE_URL}/rules`, rule);
  return response.data;
}

export async function updateRuleV3(
  id: string,
  rule: CategorizationRuleV3
): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.put<{
    success: boolean;
    message: string;
  }>(`${BASE_URL}/rules/${id}`, rule);
  return response.data;
}

export async function deleteRuleV3(
  id: string
): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.delete<{
    success: boolean;
    message: string;
  }>(`${BASE_URL}/rules/${id}`);
  return response.data;
}

// Rule workflow
export async function approveRuleV3(
  id: string,
  approvedBy?: string
): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.post<{
    success: boolean;
    message: string;
  }>(`${BASE_URL}/rules/${id}/approve`, { approvedBy });
  return response.data;
}

export async function rejectRuleV3(
  id: string
): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.post<{
    success: boolean;
    message: string;
  }>(`${BASE_URL}/rules/${id}/reject`);
  return response.data;
}

export async function activateRuleV3(
  id: string
): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.post<{
    success: boolean;
    message: string;
  }>(`${BASE_URL}/rules/${id}/activate`);
  return response.data;
}

export async function disableRuleV3(
  id: string
): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.post<{
    success: boolean;
    message: string;
  }>(`${BASE_URL}/rules/${id}/disable`);
  return response.data;
}

export async function archiveRuleV3(
  id: string
): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.post<{
    success: boolean;
    message: string;
  }>(`${BASE_URL}/rules/${id}/archive`);
  return response.data;
}

// Bulk operations
export async function bulkApproveActivateRulesV3(
  ruleIds: string[],
  approvedBy?: string
): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.post<{
    success: boolean;
    message: string;
  }>(`${BASE_URL}/rules/bulk/approve-activate`, { ruleIds, approvedBy });
  return response.data;
}

export async function bulkRejectRulesV3(
  ruleIds: string[]
): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.post<{
    success: boolean;
    message: string;
  }>(`${BASE_URL}/rules/bulk/reject`, { ruleIds });
  return response.data;
}

// Rule learning
export async function learnRulesV3(params?: {
  subcategoryId?: number;
  minTransactions?: number;
}): Promise<{
  success: boolean;
  message: string;
  rulesGenerated: number;
  rules: any[];
}> {
  const response = await apiClient.post<{
    success: boolean;
    message: string;
    rulesGenerated: number;
    rules: any[];
  }>(`${BASE_URL}/learn`, params);
  return response.data;
}

export async function getRulePerformanceV3(
  id: string
): Promise<RulePerformanceAnalysis> {
  const response = await apiClient.get<RulePerformanceAnalysis>(
    `${BASE_URL}/rules/${id}/performance`
  );
  return response.data;
}

export async function getLowPrecisionRulesV3(
  threshold: number = 0.7
): Promise<CategorizationRuleV3[]> {
  const response = await apiClient.get<CategorizationRuleV3[]>(
    `${BASE_URL}/rules/low-precision?threshold=${threshold}`
  );
  return response.data;
}

export async function getRulesWithConflictsV3(): Promise<
  CategorizationRuleV3[]
> {
  const response = await apiClient.get<CategorizationRuleV3[]>(
    `${BASE_URL}/rules/conflicts`
  );
  return response.data;
}

// Reload rules
export async function reloadRulesV3(): Promise<{
  success: boolean;
  message: string;
}> {
  const response = await apiClient.post<{
    success: boolean;
    message: string;
  }>(`${BASE_URL}/rules/reload`);
  return response.data;
}
