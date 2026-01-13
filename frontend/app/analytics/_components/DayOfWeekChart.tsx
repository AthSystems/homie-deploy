"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { DayOfWeekData } from "@/app/_lib/api/analytics";

interface DayOfWeekChartProps {
  data: DayOfWeekData[];
}

const COLORS = ["#6366f1", "#8b5cf6", "#a855f7", "#c084fc", "#d8b4fe", "#f472b6", "#fb7185"];

export function DayOfWeekChart({ data }: DayOfWeekChartProps) {
  const chartData = data.map((item, index) => ({
    name: item.dayName,
    total: Number(item.total),
    color: COLORS[index % COLORS.length],
  }));

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis
            dataKey="name"
            tick={{ fill: "currentColor", fontSize: 12 }}
            tickLine={{ stroke: "currentColor" }}
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
            formatter={(value) => [`$${Number(value).toLocaleString()}`, "Spent"]}
          />
          <Bar dataKey="total" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
