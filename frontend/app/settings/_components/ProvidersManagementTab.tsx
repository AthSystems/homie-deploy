"use client";

import { useState, useEffect } from "react";
import { Plus, Save, Trash2, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { useLLMSettings, useUpdateLLMSettings } from "../../_lib/api/settings";
import { Button } from "../../_components/Button";

export function ProvidersManagementTab() {
  const { data: llmSettings, isLoading } = useLLMSettings();
  const updateLLMSettings = useUpdateLLMSettings();

  const [openrouterApiKey, setOpenrouterApiKey] = useState<string>("");
  const [openrouterBaseUrl, setOpenrouterBaseUrl] = useState<string>("");
  const [ollamaBaseUrl, setOllamaBaseUrl] = useState<string>("");
  const [showApiKey, setShowApiKey] = useState(false);

  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Initialize form when settings load
  useEffect(() => {
    if (llmSettings) {
      setOpenrouterApiKey(llmSettings.providers.openrouter.apiKey);
      setOpenrouterBaseUrl(llmSettings.providers.openrouter.baseUrl);
      setOllamaBaseUrl(llmSettings.providers.ollama.baseUrl);
    }
  }, [llmSettings]);

  const handleSave = async () => {
    setStatusMessage(null);
    try {
      const result = await updateLLMSettings.mutateAsync({
        providers: {
          openrouter: {
            apiKey: openrouterApiKey,
            baseUrl: openrouterBaseUrl,
          },
          ollama: {
            baseUrl: ollamaBaseUrl,
          },
        },
      });
      setStatusMessage({ type: "success", message: result.message || "Provider settings saved successfully" });
    } catch (error: any) {
      setStatusMessage({ type: "error", message: error.message || "Failed to save provider settings" });
    }
  };

  if (isLoading) {
    return <div className="text-gray-600 dark:text-gray-400">Loading...</div>;
  }

  return (
    <div className="space-y-6">
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

      {/* Description */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-900 dark:text-blue-200">
          Configure connection details and credentials for each LLM provider. These settings are used when the provider is selected as active.
        </p>
      </div>

      {/* Providers Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Base URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  API Key / Credentials
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {/* OpenRouter Row */}
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      OpenRouter
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Cloud LLM Service</div>
                </td>
                <td className="px-6 py-4">
                  <input
                    type="text"
                    value={openrouterBaseUrl}
                    onChange={(e) => setOpenrouterBaseUrl(e.target.value)}
                    placeholder="https://openrouter.ai/api/v1"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={openrouterApiKey}
                      onChange={(e) => setOpenrouterApiKey(e.target.value)}
                      placeholder="sk-or-v1-..."
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    {llmSettings?.operations.similarityQuery.provider === "openrouter" && (
                      <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                        Similarity
                      </span>
                    )}
                    {llmSettings?.operations.categorization.provider === "openrouter" && (
                      <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                        Categorization
                      </span>
                    )}
                    {llmSettings?.operations.similarityQuery.provider !== "openrouter" &&
                     llmSettings?.operations.categorization.provider !== "openrouter" && (
                      <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded">
                        Inactive
                      </span>
                    )}
                  </div>
                </td>
              </tr>

              {/* Ollama Row */}
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      Ollama
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Local LLM Service</div>
                </td>
                <td className="px-6 py-4">
                  <input
                    type="text"
                    value={ollamaBaseUrl}
                    onChange={(e) => setOllamaBaseUrl(e.target.value)}
                    placeholder="http://localhost:11434"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs text-gray-500 dark:text-gray-400 italic">No authentication required</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    {llmSettings?.operations.similarityQuery.provider === "ollama" && (
                      <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                        Similarity
                      </span>
                    )}
                    {llmSettings?.operations.categorization.provider === "ollama" && (
                      <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                        Categorization
                      </span>
                    )}
                    {llmSettings?.operations.similarityQuery.provider !== "ollama" &&
                     llmSettings?.operations.categorization.provider !== "ollama" && (
                      <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded">
                        Inactive
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={updateLLMSettings.isPending}
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {updateLLMSettings.isPending ? "Saving..." : "Save Provider Settings"}
        </Button>
      </div>

      {/* Help Text */}
      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Provider Information</h4>
        <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
          <p><strong>OpenRouter:</strong> Cloud-based LLM service with access to multiple models. Requires an API key from openrouter.ai.</p>
          <p><strong>Ollama:</strong> Run LLMs locally on your machine. Download models from ollama.ai and start the Ollama service.</p>
        </div>
      </div>
    </div>
  );
}
