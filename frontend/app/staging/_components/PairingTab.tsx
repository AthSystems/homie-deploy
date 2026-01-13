import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "../../_components/Button";
import {
  usePendingPairingCandidates,
  useSuggestPairings,
  useConfirmPairing,
  useRejectPairing,
} from "../../_lib/api/pairing";
import {StagingTransaction, PairingCandidate, Account} from "../../_lib/types";
import { DebitTransactionGroup } from "./DebitTransactionGroup";

interface PairingTabProps {
  transactionMap: Map<number, StagingTransaction>;
  accounts: Account[]
}

export function PairingTab({ transactionMap, accounts }: PairingTabProps) {
  const [pairingMessage, setPairingMessage] = useState<string | null>(null);

  const { data: pairingCandidates = [] } = usePendingPairingCandidates();
  const suggestPairings = useSuggestPairings();
  const confirmPairing = useConfirmPairing();
  const rejectPairing = useRejectPairing();

  const handleSuggestPairings = async () => {
    setPairingMessage(null);
    try {
      const result = await suggestPairings.mutateAsync({});
      setPairingMessage(
        `Found ${result.pairsGenerated} potential pairs from ${result.debits} debits and ${result.credits} credits`
      );
    } catch (error) {
      console.error("Failed to suggest pairings:", error);
      setPairingMessage("Failed to generate pairing suggestions");
    }
  };

  const handleConfirmPair = async (leftId: number, rightId: number) => {
    try {
      await confirmPairing.mutateAsync({ leftId, rightId });
      setPairingMessage("Pair confirmed successfully");
    } catch (error) {
      console.error("Failed to confirm pairing:", error);
      setPairingMessage("Failed to confirm pairing");
    }
  };

  const handleRejectPair = async (leftId: number, rightId: number) => {
    try {
      await rejectPairing.mutateAsync({ leftId, rightId });
    } catch (error) {
      console.error("Failed to reject pairing:", error);
    }
  };

  // Group candidates by leftId
  const groupedCandidates = pairingCandidates.reduce((acc, candidate) => {
    if (!acc[candidate.leftId]) {
      acc[candidate.leftId] = [];
    }
    acc[candidate.leftId].push(candidate);
    return acc;
  }, {} as Record<number, PairingCandidate[]>);

  return (
    <div className="space-y-6">
      {/* Pairing Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Transfer Pairing
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Automatically match transfers between accounts
            </p>
          </div>
          <Button
            onClick={handleSuggestPairings}
            disabled={suggestPairings.isPending}
            className="flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {suggestPairings.isPending ? "Analyzing..." : "Generate Pairs"}
          </Button>
        </div>

        {pairingMessage && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">{pairingMessage}</p>
          </div>
        )}
      </div>

      {/* Pairing Candidates - Grouped by Left Transaction */}
      <div className="space-y-6">
        {pairingCandidates.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
            <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No pairing candidates. Click &quot;Generate Pairs&quot; to find potential transfer matches.
            </p>
          </div>
        ) : (
          Object.entries(groupedCandidates).map(([leftIdStr, candidates]) => {
            const leftId = parseInt(leftIdStr);
            const leftTx = transactionMap.get(leftId);
            if (!leftTx) return null;

            return (
              <DebitTransactionGroup
                key={leftId}
                leftTransaction={leftTx}
                candidates={candidates}
                transactionMap={transactionMap}
                onConfirm={handleConfirmPair}
                onReject={handleRejectPair}
                isConfirming={confirmPairing.isPending}
                isRejecting={rejectPairing.isPending}
                accounts={accounts}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
