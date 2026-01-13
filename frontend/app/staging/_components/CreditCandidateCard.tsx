import { format } from "date-fns";
import { CheckCircle } from "lucide-react";
import { Button } from "../../_components/Button";
import {StagingTransaction, PairingCandidate, PairingReasons, Account} from "../../_lib/types";

interface CreditCandidateCardProps {
  candidate: PairingCandidate;
  creditTransaction: StagingTransaction;
  onConfirm: () => void;
  onReject: () => void;
  isConfirming: boolean;
  isRejecting: boolean;
  accounts: Account[]
}

export function CreditCandidateCard({
  candidate,
  creditTransaction,
  onConfirm,
  onReject,
  isConfirming,
  isRejecting,
    accounts
}: CreditCandidateCardProps) {
  const parseReasons = (reasonsStr: string): PairingReasons | null => {
    try {
      return JSON.parse(reasonsStr);
    } catch {
      return null;
    }
  };

  const getScoreBadge = (score: number) => {
    const percentage = (score * 100).toFixed(1);
    let colorClass = "";
    if (score >= 0.9) colorClass = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    else if (score >= 0.75) colorClass = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    else if (score >= 0.6) colorClass = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    else colorClass = "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";

    return (
      <span className={`px-2 py-1 rounded-full text-sm font-semibold ${colorClass}`}>
        {percentage}%
      </span>
    );
  };

  const reasons = parseReasons(candidate.reasons);

  return (
    <div
      className={`border rounded-lg p-4 transition-all ${
        candidate.preselected
          ? "border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/10"
          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          {getScoreBadge(candidate.score)}
          {candidate.preselected && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              Top Match
            </span>
          )}
          {reasons?.ruleMatched && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
              Rule: {reasons.ruleSubcategory}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={onConfirm}
            disabled={isConfirming}
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            Confirm
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={onReject}
            disabled={isRejecting}
          >
            Reject
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {creditTransaction.description}
        </p>
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span>{accounts.find(acc => acc.accountNumber === creditTransaction.accountNumber)?.name} - {creditTransaction.accountNumber}</span>
          <span>•</span>
          <span className="font-semibold text-green-600">
            +${Math.abs(creditTransaction.amount).toFixed(2)}
          </span>
          <span>•</span>
          <span>{format(new Date(creditTransaction.transactionDate), "MMM d, yyyy")}</span>
        </div>
      </div>

      {/* Scoring Details */}
      {reasons && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-4 gap-3 text-xs">
            <div className="flex flex-col">
              <span className="text-gray-500 mb-1">Amount Match</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {(reasons.amountScore * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-500 mb-1">Date Proximity</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {(reasons.dateScore * 100).toFixed(0)}%
                <span className="text-gray-400 ml-1">({reasons.days}d)</span>
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-500 mb-1">Description</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {(reasons.descScore * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-500 mb-1">Amount Diff</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                ${(reasons.amtDiffCents / 100).toFixed(2)}
              </span>
            </div>
          </div>
          {reasons.ruleMatched && reasons.ruleBonus && (
            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                  Rule Bonus: +{(reasons.ruleBonus * 100).toFixed(1)}%
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-500">
                  Confidence: {((reasons.ruleConfidence ?? 0) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
