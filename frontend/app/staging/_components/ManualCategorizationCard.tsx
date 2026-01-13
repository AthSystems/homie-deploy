import { format } from "date-fns";
import { useState } from "react";
import { StagingTransaction, Account } from "../../_lib/types";
import { useSubcategories } from "../../_lib/api/subcategories";
import { useManualCategorization } from "../../_lib/api/categorization";
import { Button } from "../../_components/Button";
import { Check } from "lucide-react";

interface ManualCategorizationCardProps {
  transaction: StagingTransaction;
  accounts: Account[];
}

export function ManualCategorizationCard({
  transaction,
  accounts,
}: ManualCategorizationCardProps) {
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<number | null>(null);
  const { data: subcategories = [] } = useSubcategories();
  const manualCategorization = useManualCategorization();

  const handleManualCategorization = async () => {
    if (!selectedSubcategoryId) return;

    try {
      await manualCategorization.mutateAsync({
        stagingTxId: transaction.id,
        subcategoryId: selectedSubcategoryId,
      });
      setSelectedSubcategoryId(null);
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

  const accountName = accounts.find(a => a.accountNumber === transaction.accountNumber)?.name || "Unknown";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-amber-200 dark:border-amber-800 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {transaction.description || "No description"}
            </p>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-600 dark:text-gray-400">
              <span>{accountName}</span>
              <span>-</span>
              <span className="font-medium">{formatAmount(transaction.amount)}</span>
              <span>-</span>
              <span>{format(new Date(transaction.transactionDate), "MMM d, yyyy")}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <select
              value={selectedSubcategoryId || ""}
              onChange={(e) => setSelectedSubcategoryId(e.target.value ? Number(e.target.value) : null)}
              className="px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent max-w-[200px]"
            >
              <option value="">Select category...</option>
              {subcategories.map((subcategory) => (
                <option key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </option>
              ))}
            </select>
            <Button
              onClick={handleManualCategorization}
              disabled={!selectedSubcategoryId || manualCategorization.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm"
            >
              <Check className="w-4 h-4" />
              {manualCategorization.isPending ? "..." : "Apply"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
