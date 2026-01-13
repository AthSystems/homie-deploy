import { FileText, Clock, AlertCircle } from "lucide-react";
import { StagingStats } from "../../_lib/types";

interface StatisticsCardsProps {
  stats: StagingStats;
}

export function StatisticsCards({ stats }: StatisticsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>
          <FileText className="w-8 h-8 text-gray-400" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.byStatus.PENDING || 0}</p>
          </div>
          <Clock className="w-8 h-8 text-yellow-400" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Unmapped Accounts</p>
            <p className="text-2xl font-bold text-orange-600">{stats.unmappedAccounts}</p>
          </div>
          <AlertCircle className="w-8 h-8 text-orange-400" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Unmapped Categories</p>
            <p className="text-2xl font-bold text-orange-600">{stats.unmappedSubcategories}</p>
          </div>
          <AlertCircle className="w-8 h-8 text-orange-400" />
        </div>
      </div>
    </div>
  );
}
