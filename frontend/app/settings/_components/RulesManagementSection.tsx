"use client";

import { useState } from "react";
import { Database, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { useReloadCategorizationRules } from "../../_lib/api/settings";
import { Button } from "../../_components/Button";

export function RulesManagementSection() {
  const reloadRules = useReloadCategorizationRules();
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleReloadRules = async () => {
    setStatusMessage(null);
    try {
      const result = await reloadRules.mutateAsync();
      setStatusMessage({
        type: "success",
        message: `${result.message} (${result.rulesCount} rules loaded)`
      });
    } catch (error: any) {
      setStatusMessage({
        type: "error",
        message: error.message || "Failed to reload rules"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Database className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Categorization Rules</h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Manage and reload categorization rules from the configuration file
        </p>
      </div>

      {/* Status Message */}
      {statusMessage && (
        <div className={`p-4 rounded-lg border flex items-start gap-3 ${
          statusMessage.type === "success"
            ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
            : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
        }`}>
          {statusMessage.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          )}
          <p className={`text-sm ${
            statusMessage.type === "success"
              ? "text-green-800 dark:text-green-200"
              : "text-red-800 dark:text-red-200"
          }`}>
            {statusMessage.message}
          </p>
        </div>
      )}

      {/* Reload Rules Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Reload Rules</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Reload categorization rules from the <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">categorization-rules-v2.json</code> file.
          This will refresh the rules without restarting the application.
        </p>
        <Button
          onClick={handleReloadRules}
          disabled={reloadRules.isPending}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${reloadRules.isPending ? 'animate-spin' : ''}`} />
          {reloadRules.isPending ? "Reloading..." : "Reload Rules"}
        </Button>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">About Categorization Rules</h4>
        <div className="space-y-2 text-xs text-blue-800 dark:text-blue-300">
          <p>
            Rules are stored in <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">backend/src/main/resources/data/categorization-rules-v2.json</code>
          </p>
          <p>
            You can edit rules directly in the file or through the Rules Management page. After editing the file manually,
            use the reload button to apply changes without restarting.
          </p>
        </div>
      </div>
    </div>
  );
}
