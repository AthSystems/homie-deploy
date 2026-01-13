"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { CategoryData } from "@/app/_lib/api/analytics";

interface CategoryPieChartProps {
  data: CategoryData[];
  showLegend?: boolean;
}

const COLORS = [
  "#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6",
  "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1",
  "#14b8a6", "#a855f7", "#eab308", "#10b981", "#f43f5e",
];

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
  percentage: number;
  [key: string]: string | number;
}

export function CategoryPieChart({ data, showLegend = true }: CategoryPieChartProps) {
  const chartData: ChartDataItem[] = data.map((item, index) => ({
    name: item.categoryName,
    value: Number(item.amount),
    color: item.color || COLORS[index % COLORS.length],
    percentage: item.percentage,
  }));

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: ChartDataItem }[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartDataItem;
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white">{data.name}</p>
          <p className="text-gray-600 dark:text-gray-300">${data.value.toLocaleString()}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{data.percentage.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div className="w-full h-[350px] flex items-center justify-center text-gray-500 dark:text-gray-400">
        No data available
      </div>
    );
  }

  return (
    <div className="w-full h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ paddingTop: "20px" }}
              formatter={(value) => (
                <span className="text-sm text-gray-600 dark:text-gray-300">{value}</span>
              )}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
