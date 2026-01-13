"use client";

import { useState, useEffect } from "react";
import { DataTable, Column } from "../_components/DataTable";
import {useSubcategories} from "@/app/_lib/api/subcategories";
import {Subcategory} from "@/app/_lib/types";

// Types matching backend structure
type Criterion =
  | KeywordsCriterion
  | AmountCriterion
  | AccountCriterion
  | FlowCriterion
  | DateCriterion
  | LinkedCriterion
  | ScriptCriterion;

interface KeywordsCriterion {
  type: "keywords";
  operator?: string;
  mode: string;
  values: string[];
  caseInsensitive?: boolean;
}

interface AmountCriterion {
  type: "amount";
  operator?: string;
  conditions: Array<{
    op: string;
    value: number;
    value2?: number;
  }>;
}

interface AccountCriterion {
  type: "account";
  operator?: string;
  mode: string;
  values?: string[];
  pattern?: string;
}

interface FlowCriterion {
  type: "flow";
  direction: string;
}

interface DateCriterion {
  type: "date";
  operator?: string;
  conditions: Array<{
    field: string;
    op: string;
    value: string;
    value2?: string;
  }>;
}

interface LinkedCriterion {
  type: "linked";
  required?: boolean;
  conditions: ConditionGroup;
}

interface ScriptCriterion {
  type: "script";
  language: string;
  code: string;
}

interface ConditionGroup {
  operator: string;
  criteria: Criterion[];
}

interface Rule {
  id: string;
  subcategory: string;
  type: string;
  priority: number;
  conditions: ConditionGroup;
  confidence: number;
  enabled: boolean;
}

interface RulesFile {
  version: string;
  description: string;
  rules: Rule[];
}

export default function CategorizationRulesPage() {
    const {data: subcategories} = useSubcategories()
  const [rulesFile, setRulesFile] = useState<RulesFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState<number | "all">("all");
  const [filterById, setFilterById] = useState("");
  const [filterBySubcategory, setFilterBySubcategory] = useState("");

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/categorization/rules/v2");
      const data = await response.json();
      setRulesFile(data);
    } catch (error) {
      console.error("Failed to load rules:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this rule?")) return;

    try {
      const response = await fetch(`http://localhost:8080/api/categorization/rules/v2/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      setRulesFile(data);
    } catch (error) {
      console.error("Failed to delete rule:", error);
    }
  };

  const handleToggleEnabled = async (rule: Rule) => {
    try {
      const updatedRule = { ...rule, enabled: !rule.enabled };
      const response = await fetch(`http://localhost:8080/api/categorization/rules/v2/${rule.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedRule),
      });
      const data = await response.json();
      setRulesFile(data);
    } catch (error) {
      console.error("Failed to toggle rule:", error);
    }
  };

  const openEditModal = (rule: Rule) => {
    setSelectedRule(rule);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    const newRule: Rule = {
      id: "",
      subcategory: "",
      type: "COMPOSITE",
      priority: 100,
      conditions: {
        operator: "AND",
        criteria: [],
      },
      confidence: 0.9,
      enabled: true,
    };
    setSelectedRule(newRule);
    setIsModalOpen(true);
  };

  const handleSaveRule = async (rule: Rule) => {
    try {
      const isNewRule = !(rulesFile?.rules ?? []).some((r) => r.id === rule.id);
      const url = isNewRule
        ? "http://localhost:8080/api/categorization/rules/v2"
        : `http://localhost:8080/api/categorization/rules/v2/${rule.id}`;
      const method = isNewRule ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rule),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setRulesFile(data);
      setIsModalOpen(false);
      setSelectedRule(null);
    } catch (error) {
      console.error("Failed to save rule:", error);
      alert("Failed to save rule. Please check the console for details.");
    }
  };

  const renderCriterion = (criterion: Criterion, index: number) => {
    const parts: string[] = [];

    if (criterion.type === "keywords") {
      parts.push(`Keywords (${criterion.mode}): ${criterion.values?.join(", ") || ""}`);
    } else if (criterion.type === "amount") {
      const conditions = (criterion as any).conditions || [];
      parts.push(`Amount: ${conditions.length} condition(s)`);
    } else if (criterion.type === "account") {
      parts.push(`Account (${criterion.mode || "EXACT"}): ${criterion.values?.join(", ") || ""}`);
    } else if (criterion.type === "flow") {
      parts.push(`Flow: ${criterion.direction}`);
    } else if (criterion.type === "date") {
      const conditions = (criterion as any).conditions || [];
      parts.push(`Date: ${conditions.length} condition(s)`);
    } else if (criterion.type === "linked") {
      parts.push("Linked Transaction");
    } else if (criterion.type === "script") {
      const language = (criterion as any).language || "unknown";
      parts.push(`Script (${language})`);
    }

    return (
      <div key={index} className="text-sm text-gray-600 dark:text-gray-400 ml-4">
        • {parts.join(" | ")}
      </div>
    );
  };

  const filteredRules = (rulesFile?.rules ?? []).filter((rule) => {
    const matchesSearch =
      rule.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.subcategory.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === "all" || rule.priority === filterPriority;
    const matchesId = filterById === "" || rule.id.toLowerCase().includes(filterById.toLowerCase());
    const matchesSubcategory = filterBySubcategory === "" || rule.subcategory.toLowerCase().includes(filterBySubcategory.toLowerCase());

    return matchesSearch && matchesPriority && matchesId && matchesSubcategory;
  });

  // Get unique subcategories for the filter dropdown
  const uniqueSubcategories = Array.from(
    new Set((rulesFile?.rules ?? []).map((rule) => rule.subcategory))
  ).sort();

  const columns: Column<Rule>[] = [
    {
      header: "ID",
      accessor: "id",
      className: "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white",
    },
    {
      header: "Subcategory",
      accessor: "subcategory",
      className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white",
    },
    {
      header: "Priority",
      accessor: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            row.priority === 200
              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              : row.priority === 150
              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
              : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          }`}
        >
          {row.priority}
        </span>
      ),
      className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white",
    },
    {
      header: "Confidence",
      accessor: (row) => `${(row.confidence * 100).toFixed(0)}%`,
      className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white",
    },
    {
      header: "Criteria",
      accessor: (row) => (
        <div className="max-w-md">
          {row.conditions.criteria.map((criterion, idx) => renderCriterion(criterion, idx))}
        </div>
      ),
      className: "px-6 py-4 text-sm text-gray-500 dark:text-gray-400",
    },
    {
      header: "Status",
      accessor: (row) => (
        <button
          onClick={() => handleToggleEnabled(row)}
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            row.enabled
              ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800"
              : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          {row.enabled ? "Enabled" : "Disabled"}
        </button>
      ),
      className: "px-6 py-4 whitespace-nowrap text-sm",
    },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => openEditModal(row)}
            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
          >
            Delete
          </button>
        </div>
      ),
      className: "px-6 py-4 whitespace-nowrap text-sm font-medium",
    },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Categorization Rules V2</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{rulesFile?.description}</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Add Rule
        </button>
      </div>

      <DataTable
        data={filteredRules}
        columns={columns}
        keyExtractor={(row) => row.id}
        loading={loading}
        emptyMessage="No rules found"
        rowClassName={(row) => row.enabled ? "" : "opacity-60"}
        filterComponent={
          <div className="space-y-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  General Search
                </label>
                <input
                  type="text"
                  placeholder="Search in ID or Subcategory..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Filter by ID
                </label>
                <input
                  type="text"
                  placeholder="Enter rule ID..."
                  value={filterById}
                  onChange={(e) => setFilterById(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Filter by Subcategory
                </label>
                <select
                  value={filterBySubcategory}
                  onChange={(e) => setFilterBySubcategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Subcategories</option>
                  {subcategories && subcategories.map((subcategory) => (
                    <option key={subcategory.name} value={subcategory.name}>
                      {subcategory.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Filter by Priority
                </label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value === "all" ? "all" : Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Priorities</option>
                  <option value="100">Priority 100</option>
                  <option value="150">Priority 150</option>
                  <option value="200">Priority 200</option>
                </select>
              </div>
            </div>

            {(filterById || filterBySubcategory || filterPriority !== "all") && (
              <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {filteredRules.length} of {(rulesFile?.rules ?? []).length} rules
                </span>
                <button
                  onClick={() => {
                    setFilterById("");
                    setFilterBySubcategory("");
                    setFilterPriority("all");
                  }}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        }
      />

      {isModalOpen && selectedRule && (
        <RuleEditorModal
          rule={selectedRule}
          subcategories={subcategories ?? []}
          onSave={handleSaveRule}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedRule(null);
          }}
        />
      )}
    </div>
  );
}

// Rule Editor Modal Component
function RuleEditorModal({
  rule,
    subcategories,
  onSave,
  onClose,
}: {
  rule: Rule;
  subcategories: Subcategory[];
  onSave: (rule: Rule) => void;
  onClose: () => void;
}) {
  const [editedRule, setEditedRule] = useState<Rule>(JSON.parse(JSON.stringify(rule)));

  const addCriterion = () => {
    const newCriterion: KeywordsCriterion = {
      type: "keywords",
      operator: "AND",
      mode: "ANY",
      values: [],
      caseInsensitive: true,
    };
    setEditedRule({
      ...editedRule,
      conditions: {
        ...editedRule.conditions,
        criteria: [...editedRule.conditions.criteria, newCriterion],
      },
    });
  };

  const removeCriterion = (index: number) => {
    const newCriteria = editedRule.conditions.criteria.filter((_, i) => i !== index);
    setEditedRule({
      ...editedRule,
      conditions: {
        ...editedRule.conditions,
        criteria: newCriteria,
      },
    });
  };

  const updateCriterion = (index: number, newCriterion: Criterion) => {
    const newCriteria = [...editedRule.conditions.criteria];
    newCriteria[index] = newCriterion;
    setEditedRule({
      ...editedRule,
      conditions: {
        ...editedRule.conditions,
        criteria: newCriteria,
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {rule.id ? "Edit Rule" : "Add New Rule"}
          </h2>
        </div>

        <div className="p-6 space-y-6 bg-white dark:bg-gray-800">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rule ID</label>
              <input
                type="text"
                value={editedRule.id}
                onChange={(e) => setEditedRule({ ...editedRule, id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                placeholder="e.g., groceries"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subcategory</label>
              <select
                value={editedRule.subcategory}
                onChange={(e) => setEditedRule({ ...editedRule, subcategory: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
              >
                  {subcategories.map((subcategory) => (
                      <option key={subcategory.name} value={subcategory.name}>{subcategory.name}</option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
              <select
                value={editedRule.priority}
                onChange={(e) => setEditedRule({ ...editedRule, priority: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
              >
                <option value="100">100 - Keywords only</option>
                <option value="150">150 - Keywords + Account/Flow</option>
                <option value="200">200 - Account pairing</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confidence</label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="1"
                value={editedRule.confidence}
                onChange={(e) => setEditedRule({ ...editedRule, confidence: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Enabled</label>
              <input
                type="checkbox"
                checked={editedRule.enabled}
                onChange={(e) => setEditedRule({ ...editedRule, enabled: e.target.checked })}
                className="mt-3 h-5 w-5"
              />
            </div>
          </div>

          {/* Criteria */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Criteria</label>
              <button
                onClick={addCriterion}
                className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
              >
                + Add Criterion
              </button>
            </div>

            <div className="space-y-4">
              {editedRule.conditions.criteria.map((criterion, index) => (
                <CriterionEditor
                  key={index}
                  criterion={criterion}
                  onUpdate={(updates) => updateCriterion(index, updates)}
                  onRemove={() => removeCriterion(index)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(editedRule)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Rule
          </button>
        </div>
      </div>
    </div>
  );
}

// Criterion Editor Component
function CriterionEditor({
  criterion,
  onUpdate,
  onRemove,
}: {
  criterion: Criterion;
  onUpdate: (newCriterion: Criterion) => void;
  onRemove: () => void;
}) {
  const [keywordsText, setKeywordsText] = useState(
    criterion.type === "keywords" ? criterion.values.join(", ") : ""
  );
  const [accountText, setAccountText] = useState(
    criterion.type === "account" ? (criterion.values?.join(", ") || "") : ""
  );

  // Sync local state when criterion changes (e.g., when loading existing rules)
  useEffect(() => {
    if (criterion.type === "keywords") {
      setKeywordsText(criterion.values.join(", "));
    } else if (criterion.type === "account") {
      setAccountText(criterion.values?.join(", ") || "");
    }
  }, [criterion]);

  const handleTypeChange = (newType: string) => {
    let newCriterion: Criterion;

    switch (newType) {
      case "keywords":
        newCriterion = { type: "keywords", operator: "AND", mode: "ANY", values: [], caseInsensitive: true };
        setKeywordsText(""); // Reset local state
        break;
      case "amount":
        newCriterion = { type: "amount", operator: "AND", conditions: [] };
        break;
      case "account":
        newCriterion = { type: "account", operator: "AND", mode: "EXACT", values: [] };
        setAccountText(""); // Reset local state
        break;
      case "flow":
        newCriterion = { type: "flow", direction: "OUT" };
        break;
      case "date":
        newCriterion = { type: "date", operator: "AND", conditions: [] };
        break;
      case "linked":
        newCriterion = { type: "linked", required: true, conditions: { operator: "AND", criteria: [] } };
        break;
      case "script":
        newCriterion = { type: "script", language: "kotlin", code: "" };
        break;
      default:
        return;
    }

    onUpdate(newCriterion);
  };

  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
      <div className="flex justify-between items-start mb-3">
        <select
          value={criterion.type}
          onChange={(e) => handleTypeChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
        >
          <option value="keywords">Keywords</option>
          <option value="amount">Amount</option>
          <option value="account">Account</option>
          <option value="flow">Flow Direction</option>
          <option value="date">Date</option>
          <option value="linked">Linked Transaction</option>
          <option value="script">Script (Advanced)</option>
        </select>
        <button onClick={onRemove} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium">
          Remove
        </button>
      </div>

      {criterion.type === "keywords" && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Match Mode</label>
            <select
              value={criterion.mode}
              onChange={(e) => onUpdate({ ...criterion, mode: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
            >
              <option value="ANY">ANY (match any keyword)</option>
              <option value="ALL">ALL (match all keywords)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Keywords (comma-separated)
            </label>
            <textarea
              value={keywordsText}
              onChange={(e) => setKeywordsText(e.target.value)}
              onBlur={() => {
                const parsed = keywordsText
                  .split(",")
                  .map((v) => v.trim())
                  .filter((v) => v);
                onUpdate({ ...criterion, values: parsed });
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              rows={3}
              placeholder="e.g., coles, woolworths, iga"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Separate keywords with commas. Values are parsed when you click outside the field.
            </p>
          </div>
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={criterion.caseInsensitive || false}
                onChange={(e) => onUpdate({ ...criterion, caseInsensitive: e.target.checked })}
                className="mr-2 h-4 w-4"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Case insensitive</span>
            </label>
          </div>
        </div>
      )}

      {criterion.type === "amount" && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Operator</label>
            <input
              type="text"
              value={criterion.operator || "AND"}
              onChange={(e) => onUpdate({ ...criterion, operator: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              placeholder="AND or OR"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Conditions (JSON format)
            </label>
            <textarea
              value={JSON.stringify(criterion.conditions, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  onUpdate({ ...criterion, conditions: parsed });
                } catch (err) {
                  // Invalid JSON, ignore
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              rows={4}
              placeholder='[{"op": ">=", "value": 100}, {"op": "<=", "value": 500}]'
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Operators: =, !=, &lt;, &gt;, &lt;=, &gt;=, BETWEEN, IN
            </p>
          </div>
        </div>
      )}

      {criterion.type === "account" && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Match Mode</label>
            <select
              value={criterion.mode}
              onChange={(e) => onUpdate({ ...criterion, mode: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
            >
              <option value="EXACT">EXACT</option>
              <option value="PATTERN">PATTERN</option>
              <option value="IN">IN</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Account Numbers (comma-separated)
            </label>
            <input
              type="text"
              value={accountText}
              onChange={(e) => setAccountText(e.target.value)}
              onBlur={() => {
                const parsed = accountText
                  .split(",")
                  .map((v) => v.trim())
                  .filter((v) => v);
                onUpdate({ ...criterion, values: parsed });
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              placeholder="e.g., xxx-xxx xx9212"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Separate account numbers with commas. Values are parsed when you click outside the field.
            </p>
          </div>
        </div>
      )}

      {criterion.type === "flow" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Direction</label>
          <select
            value={criterion.direction}
            onChange={(e) => onUpdate({ ...criterion, direction: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
          >
            <option value="IN">IN (incoming)</option>
            <option value="OUT">OUT (outgoing)</option>
            <option value="BOTH">BOTH</option>
          </select>
        </div>
      )}

      {criterion.type === "date" && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Operator</label>
            <input
              type="text"
              value={criterion.operator || "AND"}
              onChange={(e) => onUpdate({ ...criterion, operator: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              placeholder="AND or OR"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Conditions (JSON format)
            </label>
            <textarea
              value={JSON.stringify(criterion.conditions, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  onUpdate({ ...criterion, conditions: parsed });
                } catch (err) {
                  // Invalid JSON, ignore
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              rows={4}
              placeholder='[{"field": "postedDate", "op": ">=", "value": "2024-01-01"}]'
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Operators: =, !=, &lt;, &gt;, &lt;=, &gt;=, BETWEEN, DAY_OF_MONTH, MONTH, QUARTER
            </p>
          </div>
        </div>
      )}

      {criterion.type === "linked" && (
        <div className="space-y-3">
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={criterion.required || false}
                onChange={(e) => onUpdate({ ...criterion, required: e.target.checked })}
                className="mr-2 h-4 w-4"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Linked transaction required</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nested Conditions (JSON format)
            </label>
            <textarea
              value={JSON.stringify(criterion.conditions, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  onUpdate({ ...criterion, conditions: parsed });
                } catch (err) {
                  // Invalid JSON, ignore
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              rows={6}
              placeholder='{"operator": "AND", "criteria": [...]}'
            />
          </div>
        </div>
      )}

      {criterion.type === "script" && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Language</label>
            <select
              value={criterion.language}
              onChange={(e) => onUpdate({ ...criterion, language: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
            >
              <option value="kotlin">Kotlin</option>
              <option value="javascript">JavaScript</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Code</label>
            <textarea
              value={criterion.code}
              onChange={(e) => onUpdate({ ...criterion, code: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              rows={8}
              placeholder="// Write your custom matching logic here"
            />
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs font-semibold text-blue-900 mb-1">Available fields in script:</p>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• <code className="bg-blue-100 px-1 rounded">tx.description</code> - Transaction description</li>
                <li>• <code className="bg-blue-100 px-1 rounded">tx.amount</code> - Transaction amount</li>
                <li>• <code className="bg-blue-100 px-1 rounded">tx.accountNumber</code> - Account number</li>
                <li>• <code className="bg-blue-100 px-1 rounded">tx.postedDate</code> - Posted date</li>
                <li>• <code className="bg-blue-100 px-1 rounded">tx.linkedStagingTxId</code> - Linked transaction ID (if any)</li>
                <li>• <code className="bg-blue-100 px-1 rounded">linkedTx</code> - Linked transaction object (if paired)</li>
              </ul>
              <p className="text-xs text-blue-700 mt-2">Return <code className="bg-blue-100 px-1 rounded">true</code> to match, <code className="bg-blue-100 px-1 rounded">false</code> otherwise</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
