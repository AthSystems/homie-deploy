"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wallet, TrendingUp, Upload, Tag, Users, Settings, ListChecks, Brain, Zap } from "lucide-react";

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Accounts", href: "/accounts", icon: Wallet },
  { name: "Transactions", href: "/transactions", icon: TrendingUp },
  { name: "Staging", href: "/staging", icon: Upload },
  { name: "Categories", href: "/categories", icon: Tag },
  { name: "Owners", href: "/owners", icon: Users },
  { name: "Rules", href: "/categorization-rules", icon: ListChecks },
  { name: "Rules V3", href: "/categorization-rules-v3", icon: Brain },
  { name: "Auto-Accept", href: "/auto-accept-mappings", icon: Zap },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              Homie
            </Link>
            <div className="hidden md:flex space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
