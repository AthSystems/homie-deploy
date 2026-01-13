"use client";

import {useCallback, useState} from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSuggestedRulesV3,
  getActiveRulesV3,
  approveRuleV3,
  rejectRuleV3,
  disableRuleV3,
  learnRulesV3,
  bulkApproveActivateRulesV3,
  bulkRejectRulesV3,
} from "../_lib/api/categorization-v3";
import {CategorizationRuleV3, Subcategory} from "../_lib/types";
import { Button } from "../_components/Button";
import {
  CheckCircle,
  XCircle,
  Sparkles,
  Power,
  PowerOff,
  AlertCircle,
  TrendingUp,
  Brain,
  RefreshCw,
} from "lucide-react";
import {useSubcategories} from "@/app/_lib/api/subcategories";

type TabType = "suggested" | "active";

export default function CategorizationRulesV3Page() {
  const [activeTab, setActiveTab] = useState<TabType>("suggested");
  const [selectedRules, setSelectedRules] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();
  const {data: subcategories = []} = useSubcategories();

  // Queries
  const {
    data: suggestedRules,
    isLoading: loadingSuggested,
    error: errorSuggested,
  } = useQuery({
    queryKey: ["v3-rules", "suggested"],
    queryFn: getSuggestedRulesV3,
  });

  const {
    data: activeRules,
    isLoading: loadingActive,
    error: errorActive,
  } = useQuery({
    queryKey: ["v3-rules", "active"],
    queryFn: getActiveRulesV3,
  });

  // Mutations
  const approveMutation = useMutation({
    mutationFn: (id: string) => approveRuleV3(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["v3-rules"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => rejectRuleV3(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["v3-rules"] });
    },
  });

  const disableMutation = useMutation({
    mutationFn: (id: string) => disableRuleV3(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["v3-rules"] });
    },
  });

  const learnMutation = useMutation({
    mutationFn: learnRulesV3,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["v3-rules"] });
      alert(
        `Learning complete! Generated ${data.rulesGenerated} new rule suggestions.`
      );
    },
  });

  const bulkApproveMutation = useMutation({
    mutationFn: (ruleIds: string[]) => bulkApproveActivateRulesV3(ruleIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["v3-rules"] });
      setSelectedRules(new Set());
    },
  });

  const bulkRejectMutation = useMutation({
    mutationFn: (ruleIds: string[]) => bulkRejectRulesV3(ruleIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["v3-rules"] });
      setSelectedRules(new Set());
    },
  });

  // Handlers
  const handleToggleRule = (id: string) => {
    const newSelected = new Set(selectedRules);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRules(newSelected);
  };

  const handleSelectAll = () => {
    if (activeTab === "suggested" && suggestedRules) {
      const allIds = suggestedRules.map((r) => r.id);
      setSelectedRules(new Set(allIds));
    }
  };

  const handleDeselectAll = () => {
    setSelectedRules(new Set());
  };

  const handleBulkApprove = () => {
    if (selectedRules.size === 0) return;
    if (
      confirm(
        `Approve and activate ${selectedRules.size} rule(s)? They will start matching transactions immediately.`
      )
    ) {
      bulkApproveMutation.mutate(Array.from(selectedRules));
    }
  };

  const handleBulkReject = () => {
    if (selectedRules.size === 0) return;
    if (
      confirm(
        `Reject and delete ${selectedRules.size} rule(s)? This cannot be undone.`
      )
    ) {
      bulkRejectMutation.mutate(Array.from(selectedRules));
    }
  };

  const handleLearnRules = () => {
    if (
      confirm(
        "This will analyze your confirmed transactions and generate new rule suggestions. Continue?"
      )
    ) {
      learnMutation.mutate({});
    }
  };

  const isLoading = loadingSuggested || loadingActive;
  const error = errorSuggested || errorActive;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Brain className="w-8 h-8 text-purple-600" />
              V3 Categorization Rules (Learning)
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              AI-powered rules with automatic learning and performance tracking
            </p>
          </div>
          <Button
            onClick={handleLearnRules}
            disabled={learnMutation.isPending}
            variant="primary"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {learnMutation.isPending ? "Learning..." : "Learn New Rules"}
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("suggested")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "suggested"
                ? "text-purple-600 border-b-2 border-purple-600"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            Suggested Rules
            {suggestedRules && suggestedRules.length > 0 && (
              <span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full">
                {suggestedRules.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("active")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "active"
                ? "text-green-600 border-b-2 border-green-600"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            Active Rules
            {activeRules && (
              <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 rounded-full">
                {activeRules.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {activeTab === "suggested" && selectedRules.size > 0 && (
        <div className="mb-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium text-purple-900 dark:text-purple-100">
                {selectedRules.size} rule(s) selected
              </span>
              <button
                onClick={handleDeselectAll}
                className="text-sm text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-200"
              >
                Deselect all
              </button>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleBulkApprove}
                disabled={bulkApproveMutation.isPending}
                size="sm"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Approve & Activate
              </Button>
              <Button
                onClick={handleBulkReject}
                disabled={bulkRejectMutation.isPending}
                variant="danger"
                size="sm"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Reject
              </Button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "suggested" && suggestedRules && suggestedRules.length > 0 && (
        <div className="mb-4">
          <Button onClick={handleSelectAll} variant="ghost" size="sm">
            Select all
          </Button>
        </div>
      )}

      {/* Content */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
            <AlertCircle className="w-5 h-5" />
            <span>Failed to load rules: {(error as Error).message}</span>
          </div>
        </div>
      )}

      {!isLoading && !error && (
        <div className="space-y-4">
          {activeTab === "suggested" &&
            (suggestedRules && suggestedRules.length > 0 ? (
              suggestedRules.map((rule) => (
                <SuggestedRuleCard
                    subcategories={subcategories}
                  key={rule.id}
                  rule={rule}
                  isSelected={selectedRules.has(rule.id)}
                  onToggleSelect={() => handleToggleRule(rule.id)}
                  onApprove={() => approveMutation.mutate(rule.id)}
                  onReject={() => rejectMutation.mutate(rule.id)}
                  isApproving={approveMutation.isPending}
                  isRejecting={rejectMutation.isPending}
                />
              ))
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No suggested rules</p>
                <p className="text-sm mt-2">
                  Click &quot;Learn New Rules&quot; to analyze your transactions
                </p>
              </div>
            ))}

          {activeTab === "active" &&
            (activeRules && activeRules.length > 0 ? (
              activeRules.map((rule) => (
                <ActiveRuleCard
                  key={rule.id}
                  rule={rule}
                  onDisable={() => disableMutation.mutate(rule.id)}
                  isDisabling={disableMutation.isPending}
                />
              ))
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Power className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No active rules</p>
                <p className="text-sm mt-2">
                  Approve suggested rules to activate them
                </p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

// Suggested Rule Card Component
function SuggestedRuleCard({
    subcategories,
  rule,
  isSelected,
  onToggleSelect,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}: {
    subcategories: Subcategory[];
  rule: CategorizationRuleV3;
  isSelected: boolean;
  onToggleSelect: () => void;
  onApprove: () => void;
  onReject: () => void;
  isApproving: boolean;
  isRejecting: boolean;
}) {



    const getSubcategoryName = useCallback((id?: number) =>
            id ? subcategories.find((s) => s.id === id)?.name || `Subcategory ${id}` : "-",
        [subcategories]
    );

  const getSourceBadge = (source: string) => {
    if (source === "LLM_GENERATED") {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
          <Brain className="w-3 h-3 inline mr-1" />
          AI Generated
        </span>
      );
    }
    return null;
  };

  const getConfidenceBadge = (confidence: number) => {
    const percentage = (confidence * 100).toFixed(0);
    let colorClass = "";
    if (confidence >= 0.9)
      colorClass =
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    else if (confidence >= 0.75)
      colorClass =
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    else
      colorClass =
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        {percentage}% confidence
      </span>
    );
  };

  return (
    <div
      className={`border rounded-lg p-4 transition-all ${
        isSelected
          ? "border-purple-400 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/10"
          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
      }`}
    >
      <div className="flex items-start gap-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="mt-1 w-4 h-4 text-purple-600 rounded"
        />
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {rule.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Subcategory: {getSubcategoryName(Number(rule.subcategory))}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={onApprove}
                disabled={isApproving}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Approve
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={onReject}
                disabled={isRejecting}
              >
                <XCircle className="w-4 h-4 mr-1" />
                Reject
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            {getSourceBadge(rule.source)}
            {getConfidenceBadge(rule.confidence)}
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
              Priority: {rule.priority}
            </span>
          </div>

          {rule.description && (
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              {rule.description}
            </p>
          )}

          {rule.metadata.llmReasoning && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800 mb-3">
              <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">
                AI Reasoning:
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {rule.metadata.llmReasoning}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Training Size</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {rule.metadata.trainingSize} transactions
              </p>
            </div>
            {rule.metadata.trainingDateRange && (
              <div>
                <p className="text-gray-500 dark:text-gray-400">Date Range</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {new Date(rule.metadata.trainingDateRange.start).toLocaleDateString()}{" "}
                  - {new Date(rule.metadata.trainingDateRange.end).toLocaleDateString()}
                </p>
              </div>
            )}
            <div>
              <p className="text-gray-500 dark:text-gray-400">Model</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {rule.metadata.llmModel || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Created</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {new Date(rule.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Active Rule Card Component
function ActiveRuleCard({
  rule,
  onDisable,
  isDisabling,
}: {
  rule: CategorizationRuleV3;
  onDisable: () => void;
  isDisabling: boolean;
}) {
  const precision = rule.metadata.precision
    ? (rule.metadata.precision * 100).toFixed(1)
    : "N/A";

  const getPrecisionBadge = () => {
    if (!rule.metadata.precision) return null;
    const p = rule.metadata.precision;
    let colorClass = "";
    if (p >= 0.95)
      colorClass =
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    else if (p >= 0.85)
      colorClass =
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    else if (p >= 0.7)
      colorClass =
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    else
      colorClass =
        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        <TrendingUp className="w-3 h-3 inline mr-1" />
        {precision}% precision
      </span>
    );
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-all">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {rule.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Subcategory: {rule.subcategory}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDisable}
          disabled={isDisabling}
        >
          <PowerOff className="w-4 h-4 mr-1" />
          Disable
        </Button>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <Power className="w-3 h-3 inline mr-1" />
          Active
        </span>
        {getPrecisionBadge()}
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
          Confidence: {(rule.confidence * 100).toFixed(0)}%
        </span>
      </div>

      {rule.description && (
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
          {rule.description}
        </p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
        <div>
          <p className="text-gray-500 dark:text-gray-400">Matches</p>
          <p className="font-medium text-gray-900 dark:text-gray-100">
            {rule.metadata.matchCount}
          </p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Correct</p>
          <p className="font-medium text-green-600 dark:text-green-400">
            {rule.metadata.correctCount}
          </p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Incorrect</p>
          <p className="font-medium text-red-600 dark:text-red-400">
            {rule.metadata.incorrectCount}
          </p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Source</p>
          <p className="font-medium text-gray-900 dark:text-gray-100">
            {rule.source.replace(/_/g, " ")}
          </p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Last Updated</p>
          <p className="font-medium text-gray-900 dark:text-gray-100">
            {new Date(rule.updatedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
