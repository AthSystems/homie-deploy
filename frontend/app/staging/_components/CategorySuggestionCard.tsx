import { useState } from "react";
import { CheckCircle, Tag, ChevronDown } from "lucide-react";
import { Button } from "../../_components/Button";
import { CategorizationCandidate, CategorizationReasons } from "../../_lib/types";

interface CategorySuggestionCardProps {
  candidate: CategorizationCandidate;
  onConfirm: () => void;
  onReject: () => void;
  isConfirming: boolean;
  isRejecting: boolean;
}

export function CategorySuggestionCard({
  candidate,
  onConfirm,
  onReject,
  isConfirming,
  isRejecting,
}: CategorySuggestionCardProps) {
  const [showSimilarTransactions, setShowSimilarTransactions] = useState(false);

  const parseReasons = (reasonsStr: string): CategorizationReasons | null => {
    try {
      return JSON.parse(reasonsStr);
    } catch {
      return null;
    }
  };

  const getConfidenceBadge = (confidence: number) => {
    const percentage = (confidence * 100).toFixed(1);
    let colorClass = "";
    if (confidence >= 0.9) colorClass = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    else if (confidence >= 0.75) colorClass = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    else if (confidence >= 0.6) colorClass = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
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
          <Tag className="w-4 h-4 text-gray-500" />
          <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {candidate.suggestedSubcategoryName}
          </span>
          {getConfidenceBadge(candidate.confidence)}
          {candidate.preselected && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              Top Match
            </span>
          )}
          {candidate.ruleTags && candidate.ruleTags !== "V2_RULES" && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              candidate.ruleTags.includes("TIE_BREAKER")
                ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                : "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
            }`}>
              {candidate.ruleTags.replace("V2_RULES+", "").replace("+TIE_BREAKER", " + Tie-Breaker")}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={onConfirm} disabled={isConfirming}>
            <CheckCircle className="w-4 h-4 mr-1" />
            Confirm
          </Button>
          <Button variant="danger" size="sm" onClick={onReject} disabled={isRejecting}>
            Reject
          </Button>
        </div>
      </div>

      {/* Reasoning and match details */}
      {reasons && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          {reasons.reasoning && (
            <div className="mb-2">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Reasoning:</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{reasons.reasoning}</p>
            </div>
          )}

          {/* Display tie-breaker reasoning if winner */}
          {reasons.tieBreakerWinner && reasons.tieBreakerReasoning && (
            <div className="mb-2 p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded">
              <p className="text-xs font-medium text-orange-800 dark:text-orange-200 mb-1">Tie-Breaker Winner:</p>
              <p className="text-sm text-orange-700 dark:text-orange-300">{reasons.tieBreakerReasoning}</p>
            </div>
          )}

          {/* Display reason list from LLM */}
          {reasons.reasonList && Array.isArray(reasons.reasonList) && reasons.reasonList.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Detailed Reasons:</p>
              <div className="space-y-1">
                {reasons.reasonList.map((reason: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="text-gray-700 dark:text-gray-300">{reason.name}</span>
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-900 dark:text-gray-100 font-medium">
                      {(reason.score * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Display rule names if available */}
          {reasons.ruleNames && Array.isArray(reasons.ruleNames) && reasons.ruleNames.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                Matched Rules {reasons.mergedFrom && `(${reasons.mergedFrom} rules)`}:
              </p>
              <div className="flex flex-wrap gap-1">
                {reasons.ruleNames.map((ruleName: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded text-xs font-medium"
                  >
                    {ruleName}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Display stats */}
          <div className="grid grid-cols-2 gap-3 text-xs mt-2">
            {reasons.ruleHintsUsed !== undefined && (
              <div className="flex flex-col">
                <span className="text-gray-500 mb-1">Rule Hints Used</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {reasons.ruleHintsUsed}
                </span>
              </div>
            )}
            {reasons.similarTransactions !== undefined && (
              <div className="flex flex-col">
                <button
                  onClick={() => setShowSimilarTransactions(!showSimilarTransactions)}
                  className="flex items-center gap-1 text-left hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  disabled={!reasons.similarTransactionsList || reasons.similarTransactionsList.length === 0}
                >
                  <span className="text-gray-500 mb-1">Similar Transactions</span>
                  {reasons.similarTransactionsList && reasons.similarTransactionsList.length > 0 && (
                    <ChevronDown
                      className={`w-3 h-3 text-gray-500 transition-transform ${
                        showSimilarTransactions ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {reasons.similarTransactions}
                </span>
              </div>
            )}
          </div>

          {/* Expandable Similar Transactions List */}
          {showSimilarTransactions && reasons.similarTransactionsList && reasons.similarTransactionsList.length > 0 && (
            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Similar Past Transactions:</p>
              <div className="space-y-2">
                {reasons.similarTransactionsList.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-2 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                          {tx.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {new Date(tx.date).toLocaleDateString()} • {tx.subcategoryName}
                        </p>
                      </div>
                      <span className={`ml-2 text-xs font-semibold whitespace-nowrap ${
                        tx.amount < 0
                          ? "text-red-600 dark:text-red-400"
                          : "text-green-600 dark:text-green-400"
                      }`}>
                        ${Math.abs(tx.amount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Legacy rule matching display (for backward compatibility) */}
          {(reasons.mandatoryHits !== undefined || reasons.optionalHits !== undefined) && (
            <div className="grid grid-cols-3 gap-3 text-xs mt-2">
              {reasons.mandatoryHits !== undefined && (
                <div className="flex flex-col">
                  <span className="text-gray-500 mb-1">Mandatory Hits</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {reasons.mandatoryHits}/{reasons.totalMandatory || 0}
                  </span>
                </div>
              )}
              {reasons.optionalHits !== undefined && (
                <div className="flex flex-col">
                  <span className="text-gray-500 mb-1">Optional Hits</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {reasons.optionalHits}/{reasons.totalOptional || 0}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
