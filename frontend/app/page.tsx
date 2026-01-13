import Link from "next/link";
import { Wallet, TrendingUp, Upload, Tag, Users } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Welcome to Homie
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Your personal finance tracking and management application
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <DashboardCard
          title="Accounts"
          description="Manage your financial accounts"
          icon={<Wallet className="w-8 h-8" />}
          href="/accounts"
          color="bg-blue-500"
        />
        <DashboardCard
          title="Transactions"
          description="Track income and expenses"
          icon={<TrendingUp className="w-8 h-8" />}
          href="/transactions"
          color="bg-green-500"
        />
        <DashboardCard
          title="Staging"
          description="Import and review transactions"
          icon={<Upload className="w-8 h-8" />}
          href="/staging"
          color="bg-cyan-500"
        />
        <DashboardCard
          title="Categories"
          description="Organize your spending"
          icon={<Tag className="w-8 h-8" />}
          href="/categories"
          color="bg-purple-500"
        />
        <DashboardCard
          title="Owners"
          description="Manage household members"
          icon={<Users className="w-8 h-8" />}
          href="/owners"
          color="bg-orange-500"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Quick Stats
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Total Balance" value="$0.00" />
          <StatCard label="This Month" value="$0.00" />
          <StatCard label="Transactions" value="0" />
        </div>
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  description,
  icon,
  href,
  color,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}) {
  return (
    <Link href={href}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div className={`${color} text-white p-3 rounded-lg w-fit mb-4`}>
          {icon}
        </div>
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          {description}
        </p>
      </div>
    </Link>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}
