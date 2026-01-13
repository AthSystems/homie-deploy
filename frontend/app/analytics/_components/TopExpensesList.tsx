"use client";

import { TopExpense } from "@/app/_lib/api/analytics";
import { ArrowDownRight } from "lucide-react";

interface TopExpensesListProps {
  expenses: TopExpense[];
}

export function TopExpensesList({ expenses }: TopExpensesListProps) {
  if (expenses.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
        No expenses found
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense, index) => (
        <div
          key={expense.transactionId}
          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
        >
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 flex items-center justify-center bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-sm font-medium">
              {index + 1}
            </span>
            <div>
              <p className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
                {expense.description}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {expense.subcategoryName || "Uncategorized"} &bull; {expense.accountName}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-red-600 dark:text-red-400 font-semibold">
              <ArrowDownRight className="w-4 h-4" />
              ${Number(expense.amount).toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(expense.date).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
