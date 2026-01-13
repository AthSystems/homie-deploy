"use client";

import { useState } from "react";
import { Brain, Settings, Server } from "lucide-react";
import { ModelAllocationTab } from "./ModelAllocationTab";
import { ProvidersManagementTab } from "./ProvidersManagementTab";

export function LLMSettingsSection() {
  const [activeTab, setActiveTab] = useState<"allocation" | "providers">("allocation");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">LLM Configuration</h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Configure language models for different operations and manage provider credentials
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("allocation")}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "allocation"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Model Allocation
            </div>
          </button>
          <button
            onClick={() => setActiveTab("providers")}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "providers"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4" />
              Providers Management
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "allocation" && <ModelAllocationTab />}
      {activeTab === "providers" && <ProvidersManagementTab />}
    </div>
  );
}
