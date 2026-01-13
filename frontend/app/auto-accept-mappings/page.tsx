"use client";

import { useState } from "react";
import { Plus, Trash2, Download, Upload, RefreshCw, Play } from "lucide-react";
import { Button } from "../_components/Button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as autoAcceptApi from "../_lib/api/auto-accept-map";
import { useSubcategories } from "../_lib/api/subcategories";

export default function AutoAcceptMappingsPage() {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [merchant, setMerchant] = useState("");
  const [subcategory, setSubcategory] = useState("");

  // Queries
  const { data: mappings = [], isLoading } = useQuery({
    queryKey: ["autoAcceptMappings"],
    queryFn: autoAcceptApi.getAllMappings,
  });

  const fields = mappings.sort((a, b) => a.merchant.localeCompare(b.merchant))

  const { data: stats } = useQuery({
    queryKey: ["autoAcceptStats"],
    queryFn: autoAcceptApi.getStatistics,
  });

  const { data: subcategories = [] } = useSubcategories();

  // Mutations
  const addMutation = useMutation({
    mutationFn: ({ merchant, subcategory }: { merchant: string; subcategory: string }) =>
      autoAcceptApi.addMapping(merchant, subcategory),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["autoAcceptMappings"] });
      queryClient.invalidateQueries({ queryKey: ["autoAcceptStats"] });
      setShowAddForm(false);
      setMerchant("");
      setSubcategory("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (merchant: string) => autoAcceptApi.deleteMapping(merchant),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["autoAcceptMappings"] });
      queryClient.invalidateQueries({ queryKey: ["autoAcceptStats"] });
    },
  });

  const reloadMutation = useMutation({
    mutationFn: autoAcceptApi.reloadMappings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["autoAcceptMappings"] });
      queryClient.invalidateQueries({ queryKey: ["autoAcceptStats"] });
    },
  });

  const runTestMutation = useMutation({
    mutationFn: autoAcceptApi.runAutoAcceptOnStaging,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["autoAcceptStats"] });
      alert(
        `Auto-accept test completed!\n\n` +
        `Total staging transactions: ${data.totalStaging}\n` +
        `Processed: ${data.processed}\n` +
        `Auto-accepted: ${data.autoAccepted}\n` +
        `Candidates deleted: ${data.candidatesDeleted}`
      );
    },
  });

  const exportMappings = async () => {
    const config = await autoAcceptApi.exportMappings();
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "auto-accept-map.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddMapping = () => {
    if (merchant.trim() && subcategory.trim()) {
      addMutation.mutate({ merchant: merchant.trim(), subcategory: subcategory.trim() });
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Auto-Accept Mappings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Fast categorization for known merchants
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              if (confirm(
                'This will run auto-accept on all uncategorized staging transactions and delete their candidates. Continue?'
              )) {
                runTestMutation.mutate();
              }
            }}
            variant="secondary"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            disabled={runTestMutation.isPending}
          >
            <Play className={`w-4 h-4 ${runTestMutation.isPending ? 'animate-pulse' : ''}`} />
            {runTestMutation.isPending ? 'Running...' : 'Test on Staging'}
          </Button>
          <Button
            onClick={() => reloadMutation.mutate()}
            variant="secondary"
            className="flex items-center gap-2"
            disabled={reloadMutation.isPending}
          >
            <RefreshCw className={`w-4 h-4 ${reloadMutation.isPending ? 'animate-spin' : ''}`} />
            Reload
          </Button>
          <Button
            onClick={exportMappings}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Mapping
          </Button>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Mappings</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {stats.totalMappings}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">Auto-Accepted</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
              {stats.totalAutoAccepted}
            </div>
          </div>
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Add New Mapping
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Merchant Keyword
              </label>
              <input
                type="text"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                placeholder="e.g., mcdonalds, coles"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subcategory
              </label>
              <select
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select subcategory...</option>
                {subcategories.map((sub) => (
                  <option key={sub.id} value={sub.name}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <Button
                onClick={handleAddMapping}
                disabled={!merchant.trim() || !subcategory.trim() || addMutation.isPending}
                className="flex-1"
              >
                {addMutation.isPending ? "Adding..." : "Add"}
              </Button>
              <Button
                onClick={() => {
                  setShowAddForm(false);
                  setMerchant("");
                  setSubcategory("");
                }}
                variant="secondary"
              >
                Cancel
              </Button>
            </div>
          </div>
          {addMutation.isError && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
              Error: {(addMutation.error as Error).message}
            </div>
          )}
        </div>
      )}

      {/* Mappings Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {mappings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              No mappings yet. Add one to get started.
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Merchant Keyword
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Subcategory
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Match Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Matched
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {fields.map((mapping) => (
                <tr key={mapping.merchant} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {mapping.merchant}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {mapping.subcategory}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {mapping.matchCount || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {mapping.lastMatched
                      ? new Date(mapping.lastMatched).toLocaleDateString()
                      : "Never"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            `Are you sure you want to delete the mapping for "${mapping.merchant}"?`
                          )
                        ) {
                          deleteMutation.mutate(mapping.merchant);
                        }
                      }}
                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Most/Least Used */}
      {stats && (stats.mostUsed.length > 0 || stats.leastUsed.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.mostUsed.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Most Used Mappings
              </h3>
              <ul className="space-y-2">
                {stats.mostUsed.map((item, idx) => (
                  <li key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">{item.merchant}</span>
                    <span className="text-gray-500 dark:text-gray-400">{item.count} matches</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {stats.leastUsed.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Least Used Mappings
              </h3>
              <ul className="space-y-2">
                {stats.leastUsed.map((item, idx) => (
                  <li key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">{item.merchant}</span>
                    <span className="text-gray-500 dark:text-gray-400">{item.count} matches</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
