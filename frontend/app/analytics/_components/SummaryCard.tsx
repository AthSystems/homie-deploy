"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/app/_lib/utils/cn";

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "income" | "expense" | "neutral";
}

export function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
}: SummaryCardProps) {
  const variantStyles = {
    default: "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
    income: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
    expense: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
    neutral: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
  };

  const iconStyles = {
    default: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400",
    income: "bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400",
    expense: "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400",
    neutral: "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400",
  };

  const valueStyles = {
    default: "text-gray-900 dark:text-white",
    income: "text-green-700 dark:text-green-400",
    expense: "text-red-700 dark:text-red-400",
    neutral: "text-blue-700 dark:text-blue-400",
  };

  return (
    <div className={cn("p-4 rounded-xl border", variantStyles[variant])}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
          <p className={cn("text-2xl font-bold", valueStyles[variant])}>
            {typeof value === "number" ? `$${value.toLocaleString()}` : value}
          </p>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={cn("flex items-center gap-1 mt-2 text-sm",
              trend.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
            )}>
              <span>{trend.isPositive ? "+" : ""}{trend.value.toFixed(1)}%</span>
              <span className="text-gray-500 dark:text-gray-400">vs last period</span>
            </div>
          )}
        </div>
        <div className={cn("p-3 rounded-lg", iconStyles[variant])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
