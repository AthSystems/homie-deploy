import { format } from "date-fns";
import {StagingTransaction, PairingCandidate, Account} from "../../_lib/types";
import { CreditCandidateCard } from "./CreditCandidateCard";

interface DebitTransactionGroupProps {
  leftTransaction: StagingTransaction;
  candidates: PairingCandidate[];
  transactionMap: Map<number, StagingTransaction>;
  onConfirm: (leftId: number, rightId: number) => Promise<void>;
  onReject: (leftId: number, rightId: number) => Promise<void>;
  isConfirming: boolean;
  isRejecting: boolean;
  accounts: Account[]
}

export function DebitTransactionGroup({
  leftTransaction,
  candidates,
  transactionMap,
  onConfirm,
  onReject,
  isConfirming,
  isRejecting,
    accounts
}: DebitTransactionGroupProps) {
  // Sort candidates by score descending
  const sortedCandidates = [...candidates].sort((a, b) => b.score - a.score);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header with debit transaction */}
      <div className="bg-gray-50 dark:bg-gray-700/50 p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  DEBIT TRANSACTION
                </p>
              </div>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {candidates.length} {candidates.length === 1 ? "match" : "matches"} found
              </span>
            </div>
            <p className="text-base font-medium text-gray-900 dark:text-gray-100 mb-1">
              {leftTransaction.description}
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span>{accounts.find(acc => acc.accountNumber === leftTransaction.accountNumber)?.name} - {leftTransaction.accountNumber}</span>
              <span>•</span>
              <span className="font-semibold text-red-600">
                -${Math.abs(leftTransaction.amount).toFixed(2)}
              </span>
              <span>•</span>
              <span>{format(new Date(leftTransaction.transactionDate), "MMM d, yyyy")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Credit candidates */}
      <div className="p-4 space-y-3">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Potential Credit Matches
        </p>
        {sortedCandidates.map((candidate) => {
          const rightTx = transactionMap.get(candidate.rightId);
          if (!rightTx) return null;

          return (
            <CreditCandidateCard
              key={candidate.id}
              candidate={candidate}
              creditTransaction={rightTx}
              onConfirm={() => onConfirm(candidate.leftId, candidate.rightId)}
              onReject={() => onReject(candidate.leftId, candidate.rightId)}
              isConfirming={isConfirming}
              isRejecting={isRejecting}
              accounts={accounts}
            />
          );
        })}
      </div>
    </div>
  );
}
