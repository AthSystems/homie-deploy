import {useMemo, useState} from "react";
import { Sparkles, AlertCircle } from "lucide-react";
import { Button } from "../../_components/Button";
import { useQueryClient } from "@tanstack/react-query";
import {
  usePendingCategorizationCandidates,
  useConfirmCategorization,
  useRejectCategorization,
  streamCategorizationSuggestions,
  categorizationKeys,
} from "../../_lib/api/categorization";
import {StagingTransaction, CategorizationCandidate, Account} from "../../_lib/types";
import { TransactionCategorizationGroup } from "./TransactionCategorizationGroup";
import { ManualCategorizationCard } from "./ManualCategorizationCard";
import { StrategySelector } from "./StrategySelector";

interface CategorizationTabProps {
  transactionMap: Map<number, StagingTransaction>;
  accounts: Account[]
}

export function CategorizationTab({ transactionMap, accounts }: CategorizationTabProps) {

    const PAGE_SIZE = 5;

    const [page, setPage] = useState(1);

  const [categorizationMessage, setCategorizationMessage] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamProgress, setStreamProgress] = useState<{
    processed: number;
    total: number;
  } | null>(null);

  const queryClient = useQueryClient();
  const { data: categorizationCandidates = [] } = usePendingCategorizationCandidates();
  const confirmCategorization = useConfirmCategorization();
  const rejectCategorization = useRejectCategorization();

  const handleSuggestCategorizations = async () => {
    setCategorizationMessage(null);
    setIsStreaming(true);
    setStreamProgress(null);

    try {
      await streamCategorizationSuggestions(
        { topK: 3, minConfidence: 0.5 },
        // On progress
        (progress) => {
          console.log("Progress:", progress);
          setStreamProgress({
            processed: progress.processedTransactions || 0,
            total: progress.totalTransactions || 0,
          });
          setCategorizationMessage(
            `Processing: ${progress.processedTransactions}/${progress.totalTransactions} transactions`
          );
          // Invalidate queries to refresh the candidate list
          queryClient.invalidateQueries({ queryKey: categorizationKeys.pending() });
        },
        // On complete
        (progress) => {
          console.log("Complete:", progress);
          setCategorizationMessage(
            `Complete: ${progress.candidatesGenerated} suggestions for ${progress.processedTransactions} transactions`
          );
          setIsStreaming(false);
          setStreamProgress(null);
          // Final refresh
          queryClient.invalidateQueries({ queryKey: categorizationKeys.all });
          queryClient.invalidateQueries({ queryKey: ["staging"] });
        },
        // On error
        (error) => {
          console.error("Stream error:", error);
          setCategorizationMessage(`Error: ${error}`);
          setIsStreaming(false);
          setStreamProgress(null);
        }
      );
    } catch (error) {
      console.error("Failed to start streaming:", error);
      setCategorizationMessage("Failed to start categorization");
      setIsStreaming(false);
      setStreamProgress(null);
    }
  };

  const handleConfirmCategorization = async (candidateId: number) => {
    try {
      const result = await confirmCategorization.mutateAsync({ candidateId });
      setCategorizationMessage(`Categorized as "${result.subcategoryName}" successfully`);
    } catch (error) {
      console.error("Failed to confirm categorization:", error);
      setCategorizationMessage("Failed to confirm categorization");
    }
  };

  const handleRejectCategorization = async (candidateId: number) => {
    try {
      await rejectCategorization.mutateAsync({ candidateId });
    } catch (error) {
      console.error("Failed to reject categorization:", error);
    }
  };

  // Group candidates by transaction ID
  const groupedCandidates = categorizationCandidates.reduce((acc, candidate) => {
    if (!acc[candidate.stagingTxId]) {
      acc[candidate.stagingTxId] = [];
    }
    acc[candidate.stagingTxId].push(candidate);
    return acc;
  }, {} as Record<number, CategorizationCandidate[]>);

  // Find uncategorized transactions without any pending candidates
  const uncategorizedWithoutCandidates = useMemo(() => {
    const txIdsWithCandidates = new Set(Object.keys(groupedCandidates).map(Number));
    return Array.from(transactionMap.values()).filter(
      (tx) => !tx.categorized && !txIdsWithCandidates.has(tx.id)
    );
  }, [transactionMap, groupedCandidates]);

    const paginatedEntries = useMemo(() => {
        const entries = Object.entries(groupedCandidates);
        const start = (page - 1) * PAGE_SIZE;
        return entries.slice(start, start + PAGE_SIZE);
    }, [groupedCandidates, page]);

  return (
    <div className="space-y-6">
      {/* Strategy Selector */}
      <StrategySelector />

      {/* Categorization Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Transaction Categorization
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Automatically categorize transactions using rules and AI
            </p>
          </div>
          <Button
            onClick={handleSuggestCategorizations}
            disabled={isStreaming}
            className="flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {isStreaming
              ? streamProgress
                ? `Processing ${streamProgress.processed}/${streamProgress.total}...`
                : "Starting..."
              : "Suggest Categories"}
          </Button>
        </div>

        {categorizationMessage && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">{categorizationMessage}</p>
          </div>
        )}
      </div>

      {/* Categorization Candidates - Grouped by Transaction */}
      <div className="space-y-6">
        {categorizationCandidates.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
            <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No categorization candidates. Click &quot;Suggest Categories&quot; to categorize uncategorized transactions.
            </p>
          </div>
        ) : (
            <div className="max-h-[1200px] overflow-y-auto pr-2">
                {paginatedEntries.map(([txIdStr, candidates]) => {
                    const txId = Number(txIdStr);
                    const transaction = transactionMap.get(txId);
                    if (!transaction) return null;

                    return (
                        <TransactionCategorizationGroup
                            key={txId}
                            transaction={transaction}
                            candidates={candidates}
                            onConfirm={handleConfirmCategorization}
                            onReject={handleRejectCategorization}
                            isConfirming={confirmCategorization.isPending}
                            isRejecting={rejectCategorization.isPending}
                            accounts={accounts}
                        />
                    );
                })}
            </div>
        )}
      </div>

      {/* Uncategorized Transactions Without Suggestions */}
      {uncategorizedWithoutCandidates.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Needs Manual Categorization ({uncategorizedWithoutCandidates.length})
            </h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            These transactions have no suggested categories. You can assign categories manually.
          </p>
          <div className="space-y-3">
            {uncategorizedWithoutCandidates.map((transaction) => (
              <ManualCategorizationCard
                key={transaction.id}
                transaction={transaction}
                accounts={accounts}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
