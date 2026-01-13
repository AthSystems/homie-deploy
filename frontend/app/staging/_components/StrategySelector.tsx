"use client";

import { useState } from "react";
import { Settings, Zap, TrendingUp, Brain, CheckCircle } from "lucide-react";
import { useCategorizationStrategy, useUpdateCategorizationStrategy } from "../../_lib/api/categorization-config";
import { Button } from "../../_components/Button";

export function StrategySelector() {
  const { data: config, isLoading } = useCategorizationStrategy();
  const updateStrategy = useUpdateCategorizationStrategy();
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);

  const handleStrategyChange = async (strategy: string) => {
    setSelectedStrategy(strategy);
    try {
      await updateStrategy.mutateAsync(strategy);
    } catch (error) {
      console.error("Failed to update strategy:", error);
    }
  };

  if (isLoading || !config) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Categorization Strategy
          </h2>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  const currentStrategy = selectedStrategy || config.strategyEnum;

  const strategyIcons = {
    RULES_ONLY: <Zap className="w-5 h-5" />,
    RULES_WITH_LLM_FALLBACK: <TrendingUp className="w-5 h-5" />,
    FULL_LLM_WORKFLOW: <Brain className="w-5 h-5" />,
  };

  const strategyColors = {
    RULES_ONLY: "border-green-500 dark:border-green-400",
    RULES_WITH_LLM_FALLBACK: "border-blue-500 dark:border-blue-400",
    FULL_LLM_WORKFLOW: "border-purple-500 dark:border-purple-400",
  };

  const strategyBgColors = {
    RULES_ONLY: "bg-green-50 dark:bg-green-900/20",
    RULES_WITH_LLM_FALLBACK: "bg-blue-50 dark:bg-blue-900/20",
    FULL_LLM_WORKFLOW: "bg-purple-50 dark:bg-purple-900/20",
  };

  const strategyTextColors = {
    RULES_ONLY: "text-green-700 dark:text-green-300",
    RULES_WITH_LLM_FALLBACK: "text-blue-700 dark:text-blue-300",
    FULL_LLM_WORKFLOW: "text-purple-700 dark:text-purple-300",
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Categorization Strategy
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {config.availableStrategies.map((strategy) => {
          const isSelected = currentStrategy === strategy.value;
          const isPending = updateStrategy.isPending && selectedStrategy === strategy.value;

          return (
            <button
              key={strategy.value}
              onClick={() => handleStrategyChange(strategy.value)}
              disabled={isPending}
              className={`
                relative p-4 rounded-lg border-2 transition-all text-left
                ${isSelected
                  ? `${strategyColors[strategy.value as keyof typeof strategyColors]} ${strategyBgColors[strategy.value as keyof typeof strategyBgColors]}`
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }
                ${isPending ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
              `}
            >
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <CheckCircle className={`w-5 h-5 ${strategyTextColors[strategy.value as keyof typeof strategyTextColors]}`} />
                </div>
              )}

              <div className="flex items-center gap-2 mb-2">
                <div className={isSelected ? strategyTextColors[strategy.value as keyof typeof strategyTextColors] : "text-gray-600 dark:text-gray-400"}>
                  {strategyIcons[strategy.value as keyof typeof strategyIcons]}
                </div>
                <h3 className={`font-semibold text-sm ${
                  isSelected
                    ? strategyTextColors[strategy.value as keyof typeof strategyTextColors]
                    : "text-gray-900 dark:text-white"
                }`}>
                  {strategy.value.replace(/_/g, ' ').split(' ').map(word =>
                    word.charAt(0) + word.slice(1).toLowerCase()
                  ).join(' ')}
                </h3>
              </div>

              <p className={`text-xs ${
                isSelected
                  ? strategyTextColors[strategy.value as keyof typeof strategyTextColors]
                  : "text-gray-600 dark:text-gray-400"
              }`}>
                {strategy.description}
              </p>

              {strategy.value === "RULES_ONLY" && (
                <div className="mt-3 flex items-center gap-1">
                  <span className="text-xs font-medium text-green-600 dark:text-green-400">
                    💰 Zero LLM cost
                  </span>
                </div>
              )}

              {strategy.value === "RULES_WITH_LLM_FALLBACK" && (
                <div className="mt-3 flex items-center gap-1">
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                    ⚖️ Balanced cost
                  </span>
                </div>
              )}

              {strategy.value === "FULL_LLM_WORKFLOW" && (
                <div className="mt-3 flex items-center gap-1">
                  <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                    🎯 Best accuracy
                  </span>
                </div>
              )}

              {isPending && (
                <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800 bg-opacity-50 dark:bg-opacity-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    Updating...
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          <strong className="text-gray-900 dark:text-white">Current strategy:</strong>{" "}
          <span className={strategyTextColors[currentStrategy as keyof typeof strategyTextColors]}>
            {currentStrategy.replace(/_/g, ' ')}
          </span>
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          This strategy will be used for all new categorization requests
        </p>
      </div>
    </div>
  );
}
