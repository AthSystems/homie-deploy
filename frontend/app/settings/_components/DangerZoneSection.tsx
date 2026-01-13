"use client";

import { useState, useEffect } from "react";
import {
  AlertTriangle,
  Trash2,
  Loader2,
  Shield,
  Database,
  Lock,
  XCircle,
  CheckSquare,
  Square,
  Info,
} from "lucide-react";
import { useWipeDatabase, useWipeSelectedEntities, useEntityTypes } from "../../_lib/api/database";

export function DangerZoneSection() {
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [wipeMode, setWipeMode] = useState<"all" | "selective">("all");
  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
  const [calculatedEntities, setCalculatedEntities] = useState<string[]>([]);

  const wipeMutation = useWipeDatabase();
  const wipeSelectiveMutation = useWipeSelectedEntities();
  const { data: entityTypes = [], isLoading: loadingEntityTypes } = useEntityTypes();

  // Calculate entities that will be deleted (including dependencies)
  useEffect(() => {
    if (wipeMode === "selective" && selectedEntities.length > 0) {
      const toDelete = new Set<string>();

      const addWithDependents = (entityKey: string) => {
        const entity = entityTypes.find(e => e.key === entityKey);
        if (!entity || toDelete.has(entityKey)) return;

        // Add dependents first
        entity.dependents.forEach(depName => {
          const depEntity = entityTypes.find(e => e.displayName === depName);
          if (depEntity) addWithDependents(depEntity.key);
        });

        // Then add the entity itself
        toDelete.add(entityKey);
      };

      selectedEntities.forEach(addWithDependents);
      setCalculatedEntities(Array.from(toDelete));
    } else {
      setCalculatedEntities([]);
    }
  }, [selectedEntities, entityTypes, wipeMode]);

  const handleToggleEntity = (entityKey: string) => {
    setSelectedEntities(prev =>
      prev.includes(entityKey)
        ? prev.filter(k => k !== entityKey)
        : [...prev, entityKey]
    );
  };

  const handleWipeDatabase = async () => {
    if (confirmText !== "DELETE ALL DATA") {
      return;
    }

    try {
      if (wipeMode === "selective") {
        const result = await wipeSelectiveMutation.mutateAsync(selectedEntities);
        setShowWipeConfirm(false);
        setConfirmText("");
        setSelectedEntities([]);
        alert(`Database wiped successfully. Deleted: ${result.entitiesDeleted.join(", ")}`);
      } else {
        await wipeMutation.mutateAsync();
        setShowWipeConfirm(false);
        setConfirmText("");
        alert("Database wiped successfully. All data has been permanently deleted.");
      }
    } catch (error) {
      console.error("Database wipe failed:", error);
      alert(`Database wipe failed: ${(error as Error).message}`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-md">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Danger Zone</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Irreversible operations that permanently affect your data
            </p>
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-red-900 dark:text-red-100 mb-2">
              Proceed with Extreme Caution
            </h3>
            <p className="text-sm text-red-800 dark:text-red-200 leading-relaxed">
              The operations in this section are <strong>permanent and irreversible</strong>.
              They will permanently delete data from your database without any possibility of recovery.
              Always create a backup before performing any dangerous operation.
            </p>
          </div>
        </div>
      </div>

      {/* Wipe Database Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-red-200 dark:border-red-800 overflow-hidden shadow-lg">
        <div className=" p-6 border-b-2 border-red-200 dark:border-red-800">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-lg">
              <Database className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                Wipe All Database Data
                <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 text-xs font-bold rounded-full">
                  DESTRUCTIVE
                </span>
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Permanently delete all transactions, accounts, categories, subcategories,
                buckets, owners, and staging data. This will reset your database to an empty state.
              </p>

              {/* Wipe Mode Selection */}
              <div className="mb-4 space-y-3">
                <div className="text-xs font-semibold text-red-800 dark:text-red-300 mb-2 uppercase tracking-wide">
                  Deletion Mode:
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setWipeMode("all")}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                      wipeMode === "all"
                        ? "border-red-500 bg-red-50 dark:bg-red-900/30"
                        : "border-gray-300 dark:border-gray-600 hover:border-red-300"
                    }`}
                  >
                    <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">Delete All Data</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Wipe entire database
                    </div>
                  </button>
                  <button
                    onClick={() => setWipeMode("selective")}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                      wipeMode === "selective"
                        ? "border-red-500 bg-red-50 dark:bg-red-900/30"
                        : "border-gray-300 dark:border-gray-600 hover:border-red-300"
                    }`}
                  >
                    <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">Selective Deletion</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Choose what to delete
                    </div>
                  </button>
                </div>
              </div>

              {/* Selective Entity Selection */}
              {wipeMode === "selective" && (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
                  <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    Select entities to delete:
                  </div>
                  {loadingEntityTypes ? (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading entity types...
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {entityTypes.map((entity) => {
                        const isSelected = selectedEntities.includes(entity.key);
                        const willBeDeleted = calculatedEntities.includes(entity.key);
                        const isImplied = willBeDeleted && !isSelected;

                        return (
                          <div key={entity.key} className="flex items-start gap-3">
                            <button
                              onClick={() => handleToggleEntity(entity.key)}
                              className={`flex items-center gap-2 flex-1 px-3 py-2 rounded-lg border-2 transition-all text-left ${
                                isSelected
                                  ? "border-red-500 bg-red-50 dark:bg-red-900/30"
                                  : isImplied
                                  ? "border-orange-400 bg-orange-50 dark:bg-orange-900/20"
                                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                              }`}
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                              ) : (
                                <Square className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              )}
                              <div className="flex-1">
                                <div className={`text-sm font-medium ${
                                  isSelected || isImplied
                                    ? "text-gray-900 dark:text-gray-100"
                                    : "text-gray-700 dark:text-gray-300"
                                }`}>
                                  {entity.displayName}
                                  {isImplied && (
                                    <span className="ml-2 text-xs text-orange-600 dark:text-orange-400">
                                      (dependency)
                                    </span>
                                  )}
                                </div>
                                {entity.dependents.length > 0 && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Requires: {entity.dependents.join(", ")}
                                  </div>
                                )}
                              </div>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {selectedEntities.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-blue-800 dark:text-blue-200">
                          <strong>{calculatedEntities.length} entities</strong> will be deleted
                          {calculatedEntities.length > selectedEntities.length && (
                            <span> (including {calculatedEntities.length - selectedEntities.length} dependencies)</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* What will be deleted (for "all" mode) */}
              {wipeMode === "all" && (
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-4">
                  <div className="text-xs font-semibold text-red-800 dark:text-red-300 mb-3 uppercase tracking-wide">
                    This will permanently delete:
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "All Transactions",
                      "All Accounts",
                      "All Categories",
                      "All Subcategories",
                      "All Buckets",
                      "All Owners",
                      "All Staging Data",
                      "All Core Events"
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
                        <XCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={() => setShowWipeConfirm(true)}
                disabled={
                  wipeMutation.isPending ||
                  wipeSelectiveMutation.isPending ||
                  (wipeMode === "selective" && selectedEntities.length === 0)
                }
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-red-400 disabled:to-red-500 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
              >
                {wipeMutation.isPending || wipeSelectiveMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Wiping Database...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
                    {wipeMode === "all" ? "Wipe All Data" : `Wipe Selected (${selectedEntities.length})`}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showWipeConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden border-2 border-red-500">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-6">
              <div className="flex items-center gap-3 text-white">
                <div className="p-3 bg-white/20 rounded-lg">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Confirm Database Wipe</h3>
                  <p className="text-red-100 text-sm mt-1">This action cannot be undone</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Warning */}
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-900 dark:text-red-100 font-semibold mb-2">
                  ⚠️ CRITICAL WARNING ⚠️
                </p>
                <p className="text-sm text-red-800 dark:text-red-200">
                  {wipeMode === "all" ? (
                    <>
                      You are about to <strong className="font-bold">permanently delete ALL data</strong> from
                      your database. This includes all transactions, accounts, categories, and everything else.
                      This operation <strong className="font-bold">CANNOT be reversed</strong>.
                    </>
                  ) : (
                    <>
                      You are about to <strong className="font-bold">permanently delete selected data</strong> from
                      your database. This will delete <strong className="font-bold">{calculatedEntities.length} entities</strong>
                      {calculatedEntities.length > selectedEntities.length && (
                        <> (including dependencies)</>
                      )}.
                      This operation <strong className="font-bold">CANNOT be reversed</strong>.
                    </>
                  )}
                </p>
              </div>

              {/* Confirmation Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  To confirm, type <code className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded font-mono text-xs">DELETE ALL DATA</code> below:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Type exactly: DELETE ALL DATA"
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono text-sm"
                  autoFocus
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setShowWipeConfirm(false);
                    setConfirmText("");
                  }}
                  disabled={wipeMutation.isPending}
                  className="px-5 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWipeDatabase}
                  disabled={confirmText !== "DELETE ALL DATA" || wipeMutation.isPending}
                  className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg transition-all font-medium disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {wipeMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Wiping...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Wipe Database
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
