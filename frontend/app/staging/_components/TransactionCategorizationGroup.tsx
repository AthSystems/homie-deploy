import { format } from "date-fns";
import { useState } from "react";
import {StagingTransaction, CategorizationCandidate, Subcategory, Account} from "../../_lib/types";
import { CategorySuggestionCard } from "./CategorySuggestionCard";
import { useSubcategories } from "../../_lib/api/subcategories";
import { useManualCategorization } from "../../_lib/api/categorization";
import { Button } from "../../_components/Button";
import { Check } from "lucide-react";

interface TransactionCategorizationGroupProps {
  transaction: StagingTransaction;
  candidates: CategorizationCandidate[];
  onConfirm: (candidateId: number) => Promise<void>;
  onReject: (candidateId: number) => Promise<void>;
  isConfirming: boolean;
  isRejecting: boolean;
  accounts: Account[];
}

export function TransactionCategorizationGroup({
  transaction,
  candidates,
  onConfirm,
  onReject,
  isConfirming,
  isRejecting,
    accounts
}: TransactionCategorizationGroupProps) {
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<number | null>(null);
  const { data: subcategories = [] } = useSubcategories();
  const manualCategorization = useManualCategorization();

  // Sort candidates by confidence descending
  const sortedCandidates = [...candidates].sort((a, b) => b.confidence - a.confidence);

  const handleManualCategorization = async () => {
    if (!selectedSubcategoryId) return;

    try {
      await manualCategorization.mutateAsync({
        stagingTxId: transaction.id,
        subcategoryId: selectedSubcategoryId,
      });
    } catch (error) {
      console.error("Failed to manually categorize:", error);
    }
  };

  const formatAmount = (amount: number) => {
    const color = amount >= 0 ? "text-green-600" : "text-red-600";
    const sign = amount >= 0 ? "+" : "-";
    return (
      <span className={color}>
        {sign}${Math.abs(amount).toFixed(2)}
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header with transaction details */}
      <div className="bg-gray-50 dark:bg-gray-700/50 p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase">
                Transaction
              </p>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {candidates.length} {candidates.length === 1 ? "suggestion" : "suggestions"}
              </span>
            </div>
            <p className="text-base font-medium text-gray-900 dark:text-gray-100 mb-1">
              {transaction.description || "No description"}
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span>{accounts.find(a => a.accountNumber === transaction.accountNumber)?.name || "Unknown FI"} - {transaction.accountNumber}</span>
              <span>•</span>
              <span className="font-semibold">{formatAmount(transaction.amount)}</span>
              <span>•</span>
              <span>{format(new Date(transaction.transactionDate), "MMM d, yyyy")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Override Section */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Manual Override
        </p>
        <div className="flex items-center gap-3">
          <select
            value={selectedSubcategoryId || ""}
            onChange={(e) => setSelectedSubcategoryId(e.target.value ? Number(e.target.value) : null)}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a category...</option>
            {subcategories.map((subcategory) => (
              <option key={subcategory.id} value={subcategory.id}>
                {subcategory.name}
              </option>
            ))}
          </select>
          <Button
            onClick={handleManualCategorization}
            disabled={!selectedSubcategoryId || manualCategorization.isPending}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <Check className="w-4 h-4" />
            {manualCategorization.isPending ? "Saving..." : "Apply"}
          </Button>
        </div>
      </div>

      {/* Category suggestions */}
      <div className="p-4 space-y-3">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Suggested Categories
        </p>
        {sortedCandidates.map((candidate, index) => (
          <CategorySuggestionCard
            key={candidate.id}
            candidate={candidate}
            onConfirm={() => onConfirm(candidate.id)}
            onReject={() => onReject(candidate.id)}
            isConfirming={isConfirming}
            isRejecting={isRejecting}
          />
        ))}
      </div>
    </div>
  );
}
