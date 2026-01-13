"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DailyData } from "@/app/_lib/api/analytics";

interface TrendChartProps {
  data: DailyData[];
  showRunningTotal?: boolean;
}

export function TrendChart({ data, showRunningTotal = false }: TrendChartProps) {
  const chartData = data.map((item) => ({
    date: item.date.slice(5), // Show MM-DD
    dayOfWeek: item.dayOfWeek,
    Income: Number(item.income),
    Expense: Number(item.expense),
    Net: Number(item.net),
    RunningTotal: Number(item.runningTotal),
  }));

  return (
    <div className="w-full h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorRunning" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis
            dataKey="date"
            tick={{ fill: "currentColor", fontSize: 11 }}
            tickLine={{ stroke: "currentColor" }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: "currentColor", fontSize: 12 }}
            tickLine={{ stroke: "currentColor" }}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--tooltip-bg, #fff)",
              borderColor: "var(--tooltip-border, #e5e7eb)",
              borderRadius: "8px",
            }}
            formatter={(value, name) => [`$${Number(value).toLocaleString()}`, name]}
            labelFormatter={(label) => `Date: ${label}`}
          />
          {showRunningTotal ? (
            <Area
              type="monotone"
              dataKey="RunningTotal"
              stroke="#3b82f6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRunning)"
              name="Running Total"
            />
          ) : (
            <>
              <Area
                type="monotone"
                dataKey="Income"
                stroke="#22c55e"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorIncome)"
              />
              <Area
                type="monotone"
                dataKey="Expense"
                stroke="#ef4444"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorExpense)"
              />
            </>
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
