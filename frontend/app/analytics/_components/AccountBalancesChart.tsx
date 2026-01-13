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
import { AccountBalance } from "@/app/_lib/api/analytics";

interface AccountBalancesChartProps {
  data: AccountBalance[];
}

export function AccountBalancesChart({ data }: AccountBalancesChartProps) {
  const chartData = data.map((item) => ({
    name: item.accountName,
    balance: Number(item.balance),
    color: item.color,
    type: item.type,
  }));

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: typeof chartData[0] }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white">{data.name}</p>
          <p className="text-gray-600 dark:text-gray-300">${data.balance.toLocaleString()}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{data.type}</p>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
        No accounts available
      </div>
    );
  }

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis
            type="number"
            tick={{ fill: "currentColor", fontSize: 12 }}
            tickLine={{ stroke: "currentColor" }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: "currentColor", fontSize: 12 }}
            tickLine={{ stroke: "currentColor" }}
            width={70}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="balance" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
