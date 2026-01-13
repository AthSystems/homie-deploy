"use client";

import { useState } from "react";
import { Settings, Brain, Database, Shield, AlertTriangle, Archive } from "lucide-react";
import { LLMSettingsSection } from "./_components/LLMSettingsSection";
import { RulesManagementSection } from "./_components/RulesManagementSection";
import { BackupRestoreSection } from "./_components/BackupRestoreSection";
import { DangerZoneSection } from "./_components/DangerZoneSection";

type SettingsSection = "llm" | "rules" | "backup" | "danger";

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>("llm");

  const sections = [
    {
      id: "llm" as const,
      label: "LLM Configuration",
      icon: Brain,
      description: "AI model settings",
      color: "blue"
    },
    {
      id: "rules" as const,
      label: "Categorization Rules",
      icon: Shield,
      description: "Manage rules",
      color: "purple"
    },
    {
      id: "backup" as const,
      label: "Backup & Restore",
      icon: Archive,
      description: "Data management",
      color: "green"
    },
  ];

  const dangerSection = {
    id: "danger" as const,
    label: "Danger Zone",
    icon: AlertTriangle,
    description: "Risky operations",
    color: "red"
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Left Navigation Drawer - Improved Design */}
      <div className="w-72 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 flex flex-col shadow-lg">
        {/* Header */}
        <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Settings</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                System Configuration
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 py-2">
            General
          </div>
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            const colorMap = {
              blue: "from-blue-500 to-blue-600",
              purple: "from-purple-500 to-purple-600",
              green: "from-green-500 to-green-600",
            };
            const bgColor = colorMap[section.color as keyof typeof colorMap];

            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`
                  group w-full flex items-start gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200
                  ${isActive
                    ? "bg-gradient-to-r " + bgColor + " text-white shadow-lg shadow-" + section.color + "-500/30 scale-[1.02]"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:scale-[1.01]"
                  }
                `}
              >
                <div className={`p-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-white/20"
                    : "bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600"
                }`}>
                  <Icon className="w-4 h-4 flex-shrink-0" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{section.label}</div>
                  <div className={`text-xs mt-0.5 ${
                    isActive ? "text-white/80" : "text-gray-500 dark:text-gray-400"
                  }`}>
                    {section.description}
                  </div>
                </div>
              </button>
            );
          })}

          {/* Danger Zone Section */}
          <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider px-3 py-2">
              Danger Zone
            </div>
            <button
              onClick={() => setActiveSection(dangerSection.id)}
              className={`
                group w-full flex items-start gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200
                ${activeSection === dangerSection.id
                  ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 scale-[1.02]"
                  : "text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:scale-[1.01] border-2 border-red-200/50 dark:border-red-800/50"
                }
              `}
            >
              <div className={`p-2 rounded-lg transition-colors ${
                activeSection === dangerSection.id
                  ? "bg-white/20"
                  : "bg-red-100 dark:bg-red-900/30 group-hover:bg-red-200 dark:group-hover:bg-red-800/30"
              }`}>
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">{dangerSection.label}</div>
                <div className={`text-xs mt-0.5 ${
                  activeSection === dangerSection.id ? "text-white/80" : "text-gray-500 dark:text-gray-400"
                }`}>
                  {dangerSection.description}
                </div>
              </div>
            </button>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/50">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Homie Finance v2.0.1
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-6xl mx-auto">
          {activeSection === "llm" && <LLMSettingsSection />}
          {activeSection === "rules" && <RulesManagementSection />}
          {activeSection === "backup" && <BackupRestoreSection />}
          {activeSection === "danger" && <DangerZoneSection />}
        </div>
      </div>
    </div>
  );
}
