"use client";

import { useState } from "react";
import {
  Download,
  Upload,
  Database,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import {
  useBackupMetadata,
  useDownloadBackup,
  useValidateBackup,
  useRestoreBackup,
  type ValidationResult,
} from "../../_lib/api/backup";

export function BackupRestoreSection() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);

  // Query hooks
  const { data: metadata, isLoading: metadataLoading } = useBackupMetadata();
  const downloadMutation = useDownloadBackup();
  const validateMutation = useValidateBackup();
  const restoreMutation = useRestoreBackup();

  const handleDownload = async () => {
    try {
      await downloadMutation.mutateAsync(true); // compressed by default
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setValidationResult(null);
      handleValidate(file);
    }
  };

  const handleValidate = async (file: File) => {
    const isCompressed = file.name.endsWith(".gz");
    try {
      const result = await validateMutation.mutateAsync({ file, compress: isCompressed });
      setValidationResult(result);
    } catch (error) {
      console.error("Validation failed:", error);
      setValidationResult({
        valid: false,
        message: "Failed to validate file",
        metadata: null,
        errors: [(error as Error).message],
      });
    }
  };

  const handleRestore = async () => {
    if (!selectedFile) return;

    const isCompressed = selectedFile.name.endsWith(".gz");
    try {
      await restoreMutation.mutateAsync({ file: selectedFile, compress: isCompressed });
      setShowRestoreConfirm(false);
      setSelectedFile(null);
      setValidationResult(null);
      alert("Backup restored successfully!");
    } catch (error) {
      console.error("Restore failed:", error);
      alert(`Restore failed: ${(error as Error).message}`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Database className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Backup & Restore</h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Export your data to a backup file or restore from a previous backup
        </p>
      </div>

      {/* Export Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start gap-3 mb-4">
          <Download className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Export Backup
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Download a complete backup of all your data as a compressed JSON file
            </p>

            {/* Metadata Display */}
            {metadataLoading ? (
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading database statistics...
              </div>
            ) : metadata ? (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Current Database Statistics
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {metadata.counts.transactions.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Transactions</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {metadata.counts.accounts.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Accounts</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {metadata.counts.categories.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Categories</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {metadata.counts.subcategories.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Subcategories</div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={downloadMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
            >
              {downloadMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Backup...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download Backup
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Restore Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start gap-3 mb-4">
          <Upload className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Restore from Backup
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Upload a backup file to restore your data
            </p>

            {/* Warning */}
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-orange-800 dark:text-orange-300">
                  <strong>Warning:</strong> Restoring from a backup will permanently delete all
                  existing data and replace it with the backup contents. This action cannot be
                  undone.
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Backup File
              </label>
              <input
                type="file"
                accept=".json,.json.gz,.gz"
                onChange={handleFileSelect}
                disabled={validateMutation.isPending || restoreMutation.isPending}
                className="block w-full text-sm text-gray-500 dark:text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  dark:file:bg-blue-900 dark:file:text-blue-300
                  dark:hover:file:bg-blue-800
                  cursor-pointer"
              />
            </div>

            {/* Validation Status */}
            {validateMutation.isPending && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                Validating backup file...
              </div>
            )}

            {validationResult && (
              <div
                className={`rounded-lg p-4 mb-4 ${
                  validationResult.valid
                    ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                    : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                }`}
              >
                <div className="flex items-start gap-2">
                  {validationResult.valid ? (
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <div
                      className={`text-sm font-medium mb-1 ${
                        validationResult.valid
                          ? "text-green-800 dark:text-green-300"
                          : "text-red-800 dark:text-red-300"
                      }`}
                    >
                      {validationResult.message}
                    </div>
                    {validationResult.metadata && (
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        Backup from {new Date(validationResult.metadata.timestamp).toLocaleString()}{" "}
                        - {validationResult.metadata.counts.transactions} transactions,{" "}
                        {validationResult.metadata.counts.accounts} accounts
                      </div>
                    )}
                    {validationResult.errors.length > 0 && (
                      <ul className="text-xs text-red-700 dark:text-red-400 list-disc list-inside mt-2">
                        {validationResult.errors.slice(0, 5).map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                        {validationResult.errors.length > 5 && (
                          <li>...and {validationResult.errors.length - 5} more errors</li>
                        )}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Restore Button */}
            {validationResult?.valid && (
              <button
                onClick={() => setShowRestoreConfirm(true)}
                disabled={restoreMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg transition-colors"
              >
                {restoreMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Restoring...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Restore Backup
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showRestoreConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Confirm Restore</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Are you absolutely sure you want to restore from this backup? This will{" "}
              <strong className="text-red-600 dark:text-red-400">
                permanently delete all existing data
              </strong>{" "}
              and cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowRestoreConfirm(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRestore}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
              >
                Yes, Restore Backup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
