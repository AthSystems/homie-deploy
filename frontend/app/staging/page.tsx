"use client";

import { useState } from "react";
import { FileText, Link2, Tag } from "lucide-react";
import { useStaging, useStagingStats } from "../_lib/api/staging";
import { usePendingPairingCandidates } from "../_lib/api/pairing";
import { usePendingCategorizationCandidates } from "../_lib/api/categorization";
import { StatisticsCards } from "./_components/StatisticsCards";
import { TransactionsTab } from "./_components/TransactionsTab";
import { PairingTab } from "./_components/PairingTab";
import { CategorizationTab } from "./_components/CategorizationTab";
import {useAccounts} from "@/app/_lib/api/accounts";
import {useSubcategories} from "@/app/_lib/api/subcategories";

type TabType = "transactions" | "pairing" | "categorization";

export default function StagingPage() {
  const [activeTab, setActiveTab] = useState<TabType>("transactions");

  const { data: transactions = [], isLoading } = useStaging();
  const { data: stats } = useStagingStats();
  const { data: pairingCandidates = [] } = usePendingPairingCandidates();
  const { data: categorizationCandidates = [] } = usePendingCategorizationCandidates();
  const { data: accounts = []} = useAccounts()
  const { data: subcategories = []} = useSubcategories()

  // Create a map of transaction IDs for quick lookup
  const transactionMap = new Map(transactions.map((t) => [t.id, t]));

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Staging Transactions
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Import and review transactions from CSV files before finalizing
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && <StatisticsCards stats={stats} />}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("transactions")}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "transactions"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Transactions ({transactions.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab("pairing")}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "pairing"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              Pairing ({pairingCandidates.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab("categorization")}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "categorization"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Categorization ({categorizationCandidates.length})
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "transactions" && <TransactionsTab transactions={transactions} accounts={accounts} />}
      {activeTab === "pairing" && <PairingTab transactionMap={transactionMap} accounts={accounts} />}
      {activeTab === "categorization" && <CategorizationTab transactionMap={transactionMap} accounts={accounts}/>}
    </div>
  );
}
