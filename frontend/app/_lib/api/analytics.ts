import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";

// Types for analytics responses
export interface MonthlyData {
  month: string;
  monthName: string;
  year: number;
  income: number;
  expense: number;
  net: number;
}

export interface MonthlySummaryResponse {
  data: MonthlyData[];
  totalIncome: number;
  totalExpense: number;
  totalNet: number;
  averageIncome: number;
  averageExpense: number;
}

export interface CategoryData {
  categoryId: number;
  categoryName: string;
  color: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface SubcategoryData {
  subcategoryId: number;
  subcategoryName: string;
  categoryName: string;
  color: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface CategoryBreakdownResponse {
  type: string;
  total: number;
  byCategory: CategoryData[];
  bySubcategory: SubcategoryData[];
}

export interface DailyData {
  date: string;
  dayOfWeek: string;
  income: number;
  expense: number;
  net: number;
  transactionCount: number;
  runningTotal: number;
}

export interface DailyTrendResponse {
  data: DailyData[];
  totalIncome: number;
  totalExpense: number;
}

export interface AccountBalance {
  accountId: number;
  accountName: string;
  type: string;
  balance: number;
  currency: string;
  color: string;
}

export interface AccountBalancesResponse {
  accounts: AccountBalance[];
  totalBalance: number;
}

export interface TopExpense {
  transactionId: number;
  description: string;
  amount: number;
  date: string;
  subcategoryName?: string;
  accountName: string;
}

export interface TopExpensesResponse {
  expenses: TopExpense[];
}

export interface DayOfWeekData {
  dayNumber: number;
  dayName: string;
  total: number;
  average: number;
}

export interface SpendingByDayOfWeekResponse {
  data: DayOfWeekData[];
}

export interface IncomeVsExpenseRatioResponse {
  totalIncome: number;
  totalExpense: number;
  net: number;
  savingsRate: number;
  expenseToIncomeRatio: number;
}

// Common filter types
export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  accountId?: number;
  excludeInternalTransfers?: boolean;
}

interface CategoryBreakdownFilters extends AnalyticsFilters {
  type?: "INCOME" | "EXPENSE";
}

interface TopExpensesFilters extends AnalyticsFilters {
  limit?: number;
}

// Monthly Summary
export const useMonthlySummary = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: ["analytics", "monthly-summary", filters],
    queryFn: async () => {
      const { data } = await apiClient.get<MonthlySummaryResponse>("/analytics/monthly-summary", {
        params: filters,
      });
      return data;
    },
  });
};

// Category Breakdown
export const useCategoryBreakdown = (filters?: CategoryBreakdownFilters) => {
  return useQuery({
    queryKey: ["analytics", "category-breakdown", filters],
    queryFn: async () => {
      const { data } = await apiClient.get<CategoryBreakdownResponse>("/analytics/category-breakdown", {
        params: filters,
      });
      return data;
    },
  });
};

// Daily Trend
export const useDailyTrend = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: ["analytics", "daily-trend", filters],
    queryFn: async () => {
      const { data } = await apiClient.get<DailyTrendResponse>("/analytics/daily-trend", {
        params: filters,
      });
      return data;
    },
  });
};

// Account Balances
export const useAccountBalances = () => {
  return useQuery({
    queryKey: ["analytics", "account-balances"],
    queryFn: async () => {
      const { data } = await apiClient.get<AccountBalancesResponse>("/analytics/account-balances");
      return data;
    },
  });
};

// Top Expenses
export const useTopExpenses = (filters?: TopExpensesFilters) => {
  return useQuery({
    queryKey: ["analytics", "top-expenses", filters],
    queryFn: async () => {
      const { data } = await apiClient.get<TopExpensesResponse>("/analytics/top-expenses", {
        params: filters,
      });
      return data;
    },
  });
};

// Spending by Day of Week
export const useSpendingByDayOfWeek = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: ["analytics", "spending-by-day-of-week", filters],
    queryFn: async () => {
      const { data } = await apiClient.get<SpendingByDayOfWeekResponse>("/analytics/spending-by-day-of-week", {
        params: filters,
      });
      return data;
    },
  });
};

// Income vs Expense Ratio
export const useIncomeVsExpenseRatio = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: ["analytics", "income-vs-expense-ratio", filters],
    queryFn: async () => {
      const { data } = await apiClient.get<IncomeVsExpenseRatioResponse>("/analytics/income-vs-expense-ratio", {
        params: filters,
      });
      return data;
    },
  });
};
