"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { ModelInfo } from "../_lib/api/settings";

interface ModelAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  models: ModelInfo[] | undefined;
  isLoading: boolean;
  placeholder?: string;
  className?: string;
}

export function ModelAutocomplete({
  value,
  onChange,
  models,
  isLoading,
  placeholder,
  className = "",
}: ModelAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [hasUserTyped, setHasUserTyped] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value);
    setHasUserTyped(false); // Reset typing flag when value changes externally
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter models based on input - only filter if user has typed something
  const filteredModels = (hasUserTyped && inputValue.trim())
    ? (models?.filter((model) =>
        model.id.toLowerCase().includes(inputValue.toLowerCase()) ||
        model.name.toLowerCase().includes(inputValue.toLowerCase())
      ) || [])
    : (models || []); // Show all models if user hasn't typed yet

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setHasUserTyped(true);
    onChange(newValue);
    setIsOpen(true);
  };

  const handleSelectModel = (modelId: string) => {
    setInputValue(modelId);
    setHasUserTyped(false); // Reset typing flag after selection
    onChange(modelId);
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    setHasUserTyped(false); // Show all models when focused
    setIsOpen(true);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className={`w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${className}`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isLoading && <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />}
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && !isLoading && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredModels.length > 0 ? (
            <ul className="py-1">
              {filteredModels.map((model) => (
                <li
                  key={model.id}
                  onClick={() => handleSelectModel(model.id)}
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {model.name}
                    </span>
                    {model.description && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {model.description}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              {models && models.length === 0 ? (
                <span>No models available. Make sure the provider is configured and running.</span>
              ) : (
                <span>No models match your search. You can still enter a custom model name.</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
