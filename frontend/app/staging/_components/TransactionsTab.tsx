import { useRef, useState } from "react";
import { Upload, Trash2, AlertCircle, CheckCircle, Link2, Send } from "lucide-react";
import { Button } from "../../_components/Button";
import { DataTable, Column } from "../../_components/DataTable";
import {
  useUploadCSV,
  useDeleteStagingTransaction,
  useClearStaging,
  useCommitAllStaging,
} from "../../_lib/api/staging";
import {Account, StagingTransaction} from "../../_lib/types";
import { format } from "date-fns";

interface TransactionsTabProps {
  transactions: StagingTransaction[];
  accounts: Account[];
}

export function TransactionsTab({ transactions, accounts }: TransactionsTabProps) {
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [commitError, setCommitError] = useState<string | null>(null);
  const [commitSuccess, setCommitSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadCSV = useUploadCSV();
  const deleteTransaction = useDeleteStagingTransaction();
  const clearStaging = useClearStaging();
  const commitAllStaging = useCommitAllStaging();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadSuccess(null);

    if (!file.name.endsWith(".csv")) {
      setUploadError("Only CSV files are supported");
      return;
    }

    try {
      const result = await uploadCSV.mutateAsync(file);
      if (result.success) {
        setUploadSuccess(
          `Successfully uploaded ${result.saved} transactions. ${result.duplicates} duplicates skipped.`
        );
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        setUploadError(result.message || "Upload failed");
      }
    } catch (error: any) {
      setUploadError(error.response?.data?.error || "Failed to upload file");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;

    try {
      await deleteTransaction.mutateAsync(id);
    } catch (error) {
      console.error("Failed to delete transaction:", error);
    }
  };

  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to clear ALL staging data? This cannot be undone.")) return;

    try {
      const result = await clearStaging.mutateAsync();
      setUploadSuccess(`Cleared ${result.deleted} transactions`);
    } catch (error) {
      console.error("Failed to clear staging data:", error);
      setUploadError("Failed to clear staging data");
    }
  };

  const handleCommitAll = async () => {
    const categorizedCount = transactions.filter(t => t.categorized && !t.importedTransactionId).length;

    if (categorizedCount === 0) {
      setCommitError("No categorized transactions to commit. Please categorize transactions first.");
      return;
    }

    if (!confirm(`Commit ${categorizedCount} categorized transactions to main transactions? This will create ${categorizedCount} new transactions.`)) return;

    setCommitError(null);
    setCommitSuccess(null);

    try {
      const result = await commitAllStaging.mutateAsync();
      if (result.success) {
        setCommitSuccess(
          `Successfully committed ${result.committed} transactions. ${result.skipped} skipped, ${result.failed} failed.`
        );
        if (result.errors.length > 0) {
          setCommitError(`Errors: ${result.errors.join(", ")}`);
        }
      } else {
        setCommitError("Commit failed");
      }
    } catch (error: any) {
      console.error("Failed to commit transactions:", error);
      setCommitError(error.response?.data?.message || "Failed to commit transactions");
    }
  };

  const formatAmount = (amount: number) => {
    const color = amount >= 0 ? "text-green-600" : "text-red-600";
    const sign = amount >= 0 ? "+" : "-";
    return <span className={color}>{sign}${Math.abs(amount).toFixed(2)}</span>;
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      REVIEWED: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      APPROVED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      REJECTED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      IMPORTED: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.PENDING}`}>
        {status}
      </span>
    );
  };

  const columns: Column<StagingTransaction>[] = [
    {
      header: "Date",
      accessor: (row) => format(new Date(row.transactionDate), "yyyy-MM-dd"),
      className: "px-4 py-3 text-sm text-gray-900 dark:text-gray-100",
    },
    {
      header: "Description",
      accessor: (row) => row.description || "-",
      className: "px-4 py-3 text-sm text-gray-900 dark:text-gray-100",
    },
    {
      header: "Account",
      accessor: (row) =>  accounts.find(acc => acc.accountNumber === row.accountNumber)?.name || "-",
      className: "px-4 py-3 text-sm text-gray-600 dark:text-gray-400",
    },
    {
      header: "Subcategory",
      accessor: (row) => row.subcategoryName || "-",
      className: "px-4 py-3 text-sm text-gray-600 dark:text-gray-400",
    },
    {
      header: "Amount",
      accessor: (row) => formatAmount(row.amount),
      className: "px-4 py-3 text-sm text-right font-medium",
      headerClassName: "px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider",
    },
    {
      header: "Status",
      accessor: (row) => getStatusBadge(row.status),
      className: "px-4 py-3 text-center",
      headerClassName: "px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider",
    },
    {
      header: "Paired",
      accessor: (row) => row.linkedStagingTxId ? (
        <Link2 className="w-4 h-4 text-green-600 dark:text-green-400 mx-auto" />
      ) : (
        <span className="text-gray-400 dark:text-gray-500">-</span>
      ),
      className: "px-4 py-3 text-center",
      headerClassName: "px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider",
    },
    {
      header: "Actions",
      accessor: (row) => (
        <Button
          variant="danger"
          size="sm"
          onClick={() => handleDelete(row.id)}
          disabled={deleteTransaction.isPending}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      ),
      className: "px-4 py-3 text-right",
      headerClassName: "px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider",
    },
  ];

  return (
    <div className="space-y-6">
      {/* CSV Upload Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Upload CSV File
          </h2>
          <div className="flex gap-3">
            {transactions.length > 0 && (
              <>
                <Button
                  variant="primary"
                  onClick={handleCommitAll}
                  disabled={commitAllStaging.isPending || transactions.filter(t => t.categorized && !t.importedTransactionId).length === 0}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Commit All ({transactions.filter(t => t.categorized && !t.importedTransactionId).length})
                </Button>
                <Button variant="danger" onClick={handleClearAll} disabled={clearStaging.isPending}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-900 dark:text-gray-100
                     border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer
                     bg-gray-50 dark:bg-gray-700 focus:outline-none"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadCSV.isPending}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <Upload className="w-4 h-4" />
            {uploadCSV.isPending ? "Uploading..." : "Upload"}
          </Button>
        </div>

        {uploadError && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 dark:text-red-200">{uploadError}</p>
          </div>
        )}

        {uploadSuccess && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800 dark:text-green-200">{uploadSuccess}</p>
          </div>
        )}

        {commitError && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 dark:text-red-200">{commitError}</p>
          </div>
        )}

        {commitSuccess && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800 dark:text-green-200">{commitSuccess}</p>
          </div>
        )}
      </div>

      {/* Transactions Table */}
      <DataTable
        data={transactions}
        columns={columns}
        keyExtractor={(row) => row.id.toString()}
        emptyMessage="No staging transactions. Upload a CSV file to get started."
        containerClassName="border border-gray-200 dark:border-gray-700"
      />
    </div>
  );
}
