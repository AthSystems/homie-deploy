"use client";

import { useState, useEffect } from "react";
import { Zap, CheckCircle, XCircle, Save } from "lucide-react";
import { useLLMSettings, useUpdateLLMSettings, useTestLLMConnection, useOpenRouterModels, useOllamaModels } from "../../_lib/api/settings";
import { Button } from "../../_components/Button";
import { ModelAutocomplete } from "../../_components/ModelAutocomplete";

interface OperationState {
  provider: string;
  model: string;
}

export function ModelAllocationTab() {
  const { data: llmSettings, isLoading } = useLLMSettings();
  const updateLLMSettings = useUpdateLLMSettings();
  const testConnection = useTestLLMConnection();

  // Always fetch both provider models on mount
  const { data: openrouterModels, isLoading: openrouterLoading, refetch: refetchOpenRouter } = useOpenRouterModels(true);
  const { data: ollamaModels, isLoading: ollamaLoading, refetch: refetchOllama } = useOllamaModels(true);

  const [similarityQuery, setSimilarityQuery] = useState<OperationState>({
    provider: "ollama",
    model: "llama3.1:8b",
  });
  const [categorization, setCategorization] = useState<OperationState>({
    provider: "ollama",
    model: "llama3.1:8b",
  });
  const [tieBreaker, setTieBreaker] = useState<OperationState>({
    provider: "ollama",
    model: "llama3.1:8b",
  });

  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Initialize form when settings load
  useEffect(() => {
    if (llmSettings) {
      setSimilarityQuery({
        provider: llmSettings.operations.similarityQuery.provider,
        model: llmSettings.operations.similarityQuery.model,
      });
      setCategorization({
        provider: llmSettings.operations.categorization.provider,
        model: llmSettings.operations.categorization.model,
      });
      setTieBreaker({
        provider: llmSettings.operations.tieBreaker.provider,
        model: llmSettings.operations.tieBreaker.model,
      });
    }
  }, [llmSettings]);

  const handleSave = async () => {
    setStatusMessage(null);
    try {
      const result = await updateLLMSettings.mutateAsync({
        operations: {
          similarityQuery: {
            provider: similarityQuery.provider,
            model: similarityQuery.model,
          },
          categorization: {
            provider: categorization.provider,
            model: categorization.model,
          },
          tieBreaker: {
            provider: tieBreaker.provider,
            model: tieBreaker.model,
          },
        },
      });
      setStatusMessage({ type: "success", message: result.message || "Settings saved successfully" });
    } catch (error: any) {
      setStatusMessage({ type: "error", message: error.message || "Failed to save settings" });
    }
  };

  const handleTestConnection = async () => {
    setStatusMessage(null);
    try {
      const result = await testConnection.mutateAsync();
      setStatusMessage({ type: "success", message: result.message || "Connection test successful" });
    } catch (error: any) {
      setStatusMessage({ type: "error", message: error.message || "Connection test failed" });
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

      {/* Similarity Query Operation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Similarity Query Generation</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {llmSettings?.operations.similarityQuery.description || "Generate SQL SIMILAR TO patterns for finding similar historical transactions"}
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Provider
            </label>
            <select
              value={similarityQuery.provider}
              onChange={(e) => setSimilarityQuery({ ...similarityQuery, provider: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="openrouter">OpenRouter (Cloud)</option>
              <option value="ollama">Ollama (Local)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Model
            </label>
            <ModelAutocomplete
              value={similarityQuery.model}
              onChange={(value) => setSimilarityQuery({ ...similarityQuery, model: value })}
              models={similarityQuery.provider === "openrouter" ? openrouterModels : ollamaModels}
              isLoading={similarityQuery.provider === "openrouter" ? openrouterLoading : ollamaLoading}
              placeholder={similarityQuery.provider === "openrouter" ? "anthropic/claude-3-haiku" : "llama3.1:8b"}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {similarityQuery.provider === "openrouter"
                ? "Select from available models or enter a custom model ID"
                : "Select from installed models or enter a custom model name"}
            </p>
          </div>
        </div>
      </div>

      {/* Categorization Operation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Transaction Categorization</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {llmSettings?.operations.categorization.description || "Analyze transactions and suggest categories based on rules and similar transactions"}
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Provider
            </label>
            <select
              value={categorization.provider}
              onChange={(e) => setCategorization({ ...categorization, provider: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="openrouter">OpenRouter (Cloud)</option>
              <option value="ollama">Ollama (Local)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Model
            </label>
            <ModelAutocomplete
              value={categorization.model}
              onChange={(value) => setCategorization({ ...categorization, model: value })}
              models={categorization.provider === "openrouter" ? openrouterModels : ollamaModels}
              isLoading={categorization.provider === "openrouter" ? openrouterLoading : ollamaLoading}
              placeholder={categorization.provider === "openrouter" ? "anthropic/claude-3.5-haiku" : "llama3.1:8b"}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {categorization.provider === "openrouter"
                ? "Select from available models or enter a custom model ID"
                : "Select from installed models or enter a custom model name"}
            </p>
          </div>
        </div>
      </div>

      {/* Tie-Breaker Operation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Categorization Tie-Breaker</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {llmSettings?.operations.tieBreaker?.description || "Disambiguate between multiple categorization candidates with equal confidence scores"}
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Provider
            </label>
            <select
              value={tieBreaker.provider}
              onChange={(e) => setTieBreaker({ ...tieBreaker, provider: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="openrouter">OpenRouter (Cloud)</option>
              <option value="ollama">Ollama (Local)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Model
            </label>
            <ModelAutocomplete
              value={tieBreaker.model}
              onChange={(value) => setTieBreaker({ ...tieBreaker, model: value })}
              models={tieBreaker.provider === "openrouter" ? openrouterModels : ollamaModels}
              isLoading={tieBreaker.provider === "openrouter" ? openrouterLoading : ollamaLoading}
              placeholder={tieBreaker.provider === "openrouter" ? "anthropic/claude-3-haiku" : "llama3.1:8b"}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {tieBreaker.provider === "openrouter"
                ? "Select from available models or enter a custom model ID"
                : "Select from installed models or enter a custom model name"}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleSave}
          disabled={updateLLMSettings.isPending}
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {updateLLMSettings.isPending ? "Saving..." : "Save Configuration"}
        </Button>
        <Button
          onClick={handleTestConnection}
          disabled={testConnection.isPending}
          variant="secondary"
          className="flex items-center gap-2"
        >
          <Zap className="w-4 h-4" />
          {testConnection.isPending ? "Testing..." : "Test Connection"}
        </Button>
      </div>

      {/* Current Configuration Summary */}
      {llmSettings && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-3">Current Configuration Summary</h3>
          <div className="space-y-3">
            <div className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
              <p className="font-semibold">Similarity Query Generation:</p>
              <p className="font-mono ml-4">Provider: {llmSettings.operations.similarityQuery.provider}</p>
              <p className="font-mono ml-4">Model: {llmSettings.operations.similarityQuery.model}</p>
            </div>
            <div className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
              <p className="font-semibold">Transaction Categorization:</p>
              <p className="font-mono ml-4">Provider: {llmSettings.operations.categorization.provider}</p>
              <p className="font-mono ml-4">Model: {llmSettings.operations.categorization.model}</p>
            </div>
            <div className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
              <p className="font-semibold">Categorization Tie-Breaker:</p>
              <p className="font-mono ml-4">Provider: {llmSettings.operations.tieBreaker.provider}</p>
              <p className="font-mono ml-4">Model: {llmSettings.operations.tieBreaker.model}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
