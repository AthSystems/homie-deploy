"use client";

import { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Calendar,
  ChevronDown,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Building2,
  CalendarDays,
  ArrowDownRight,
  Filter,
  X,
} from "lucide-react";
import { Button } from "@/app/_components/Button";
import { SummaryCard } from "./_components/SummaryCard";
import { MonthlyChart } from "./_components/MonthlyChart";
import { CategoryPieChart } from "./_components/CategoryPieChart";
import { TrendChart } from "./_components/TrendChart";
import { AccountBalancesChart } from "./_components/AccountBalancesChart";
import { DayOfWeekChart } from "./_components/DayOfWeekChart";
import { TopExpensesList } from "./_components/TopExpensesList";
import {
  useMonthlySummary,
  useCategoryBreakdown,
  useDailyTrend,
  useAccountBalances,
  useTopExpenses,
  useSpendingByDayOfWeek,
  useIncomeVsExpenseRatio,
  AnalyticsFilters,
} from "@/app/_lib/api/analytics";
import { useAccounts } from "@/app/_lib/api/accounts";

type DateRange = "7d" | "30d" | "90d" | "12m" | "ytd" | "custom";

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [selectedAccountId, setSelectedAccountId] = useState<number | undefined>(undefined);
  const [excludeInternalTransfers, setExcludeInternalTransfers] = useState(true);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  // Fetch accounts for filter dropdown
  const { data: accounts } = useAccounts();

  // Calculate date filters based on selected range
  const dateFilters = useMemo(() => {
    const today = new Date();
    let startDate: Date;
    let endDate = today;

    if (dateRange === "custom" && customStartDate && customEndDate) {
      return {
        startDate: customStartDate,
        endDate: customEndDate,
      };
    }

    switch (dateRange) {
      case "7d":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 6);
        break;
      case "30d":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 29);
        break;
      case "90d":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 89);
        break;
      case "12m":
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 11);
        startDate.setDate(1);
        break;
      case "ytd":
        startDate = new Date(today.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 29);
    }

    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    };
  }, [dateRange, customStartDate, customEndDate]);

  // Build common filters object
  const commonFilters: AnalyticsFilters = useMemo(() => ({
    ...dateFilters,
    accountId: selectedAccountId,
    excludeInternalTransfers,
  }), [dateFilters, selectedAccountId, excludeInternalTransfers]);

  // Fetch all analytics data with filters
  const { data: monthlySummary, isLoading: loadingMonthly } = useMonthlySummary(commonFilters);
  const { data: categoryBreakdown, isLoading: loadingCategory } = useCategoryBreakdown({
    ...commonFilters,
    type: "EXPENSE",
  });
  const { data: dailyTrend, isLoading: loadingTrend } = useDailyTrend(commonFilters);
  const { data: accountBalances, isLoading: loadingBalances } = useAccountBalances();
  const { data: topExpenses, isLoading: loadingTopExpenses } = useTopExpenses({
    ...commonFilters,
    limit: 5,
  });
  const { data: dayOfWeek, isLoading: loadingDayOfWeek } = useSpendingByDayOfWeek(commonFilters);
  const { data: ratio, isLoading: loadingRatio } = useIncomeVsExpenseRatio(commonFilters);

  const dateRangeOptions: { value: DateRange; label: string }[] = [
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 90 days" },
    { value: "12m", label: "Last 12 months" },
    { value: "ytd", label: "Year to date" },
    { value: "custom", label: "Custom range" },
  ];

  const clearFilters = () => {
    setSelectedAccountId(undefined);
    setExcludeInternalTransfers(true);
    setDateRange("30d");
    setCustomStartDate("");
    setCustomEndDate("");
  };

  const hasActiveFilters = selectedAccountId !== undefined || !excludeInternalTransfers || dateRange === "custom";

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analytics
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Track your financial performance and spending patterns
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          {showFilters ? "Hide Filters" : "Show Filters"}
          {hasActiveFilters && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
              Active
            </span>
          )}
        </Button>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            {/* Date Range */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date Range
              </label>
              <div className="relative">
                <Button
                  variant="secondary"
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="w-full flex items-center justify-between gap-2"
                >
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {dateRangeOptions.find((o) => o.value === dateRange)?.label}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
                {showDatePicker && (
                  <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                    {dateRangeOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setDateRange(option.value);
                          setShowDatePicker(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg ${
                          dateRange === option.value
                            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Custom Date Inputs */}
            {dateRange === "custom" && (
              <>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </>
            )}

            {/* Account Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Account
              </label>
              <select
                value={selectedAccountId ?? ""}
                onChange={(e) => setSelectedAccountId(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Accounts</option>
                {accounts?.filter(a => a.isActive).map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Exclude Internal Transfers */}
            <div className="flex-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={excludeInternalTransfers}
                  onChange={(e) => setExcludeInternalTransfers(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Exclude internal transfers
                </span>
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Hide transfers between your own accounts
              </p>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Clear
              </Button>
            )}
          </div>

          {/* Active Filters Summary */}
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Showing:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {dateFilters.startDate} to {dateFilters.endDate}
            </span>
            {selectedAccountId && accounts && (
              <>
                <span>|</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {accounts.find(a => a.id === selectedAccountId)?.name}
                </span>
              </>
            )}
            {excludeInternalTransfers && (
              <>
                <span>|</span>
                <span className="text-green-600 dark:text-green-400">Excluding internal transfers</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <SummaryCard
          title="Total Income"
          value={ratio?.totalIncome || 0}
          icon={TrendingUp}
          variant="income"
          subtitle={monthlySummary ? `Avg: $${Number(monthlySummary.averageIncome).toLocaleString()}/mo` : undefined}
        />
        <SummaryCard
          title="Total Expenses"
          value={ratio?.totalExpense || 0}
          icon={TrendingDown}
          variant="expense"
          subtitle={monthlySummary ? `Avg: $${Number(monthlySummary.averageExpense).toLocaleString()}/mo` : undefined}
        />
        <SummaryCard
          title="Net Savings"
          value={ratio?.net || 0}
          icon={PiggyBank}
          variant={ratio && ratio.net >= 0 ? "income" : "expense"}
          subtitle={ratio ? `Savings rate: ${ratio.savingsRate.toFixed(1)}%` : undefined}
        />
        <SummaryCard
          title="Total Balance"
          value={accountBalances?.totalBalance || 0}
          icon={Wallet}
          variant="neutral"
          subtitle={`${accountBalances?.accounts.length || 0} active accounts`}
        />
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Income vs Expense */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Income vs Expenses
            </h2>
          </div>
          {loadingMonthly ? (
            <div className="h-[350px] flex items-center justify-center text-gray-500">
              Loading...
            </div>
          ) : monthlySummary ? (
            <MonthlyChart data={monthlySummary.data} />
          ) : (
            <div className="h-[350px] flex items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Spending by Category
            </h2>
          </div>
          {loadingCategory ? (
            <div className="h-[350px] flex items-center justify-center text-gray-500">
              Loading...
            </div>
          ) : categoryBreakdown ? (
            <CategoryPieChart data={categoryBreakdown.byCategory} />
          ) : (
            <div className="h-[350px] flex items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Daily Trend */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Daily Spending Trend
          </h2>
        </div>
        {loadingTrend ? (
          <div className="h-[350px] flex items-center justify-center text-gray-500">
            Loading...
          </div>
        ) : dailyTrend ? (
          <TrendChart data={dailyTrend.data} />
        ) : (
          <div className="h-[350px] flex items-center justify-center text-gray-500">
            No data available
          </div>
        )}
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Account Balances */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Account Balances
            </h2>
          </div>
          {loadingBalances ? (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              Loading...
            </div>
          ) : accountBalances ? (
            <AccountBalancesChart data={accountBalances.accounts} />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </div>

        {/* Spending by Day of Week */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Spending by Day
            </h2>
          </div>
          {loadingDayOfWeek ? (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              Loading...
            </div>
          ) : dayOfWeek ? (
            <DayOfWeekChart data={dayOfWeek.data} />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </div>

        {/* Top Expenses */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <ArrowDownRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Top Expenses
            </h2>
          </div>
          {loadingTopExpenses ? (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              Loading...
            </div>
          ) : topExpenses ? (
            <TopExpensesList expenses={topExpenses.expenses} />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
