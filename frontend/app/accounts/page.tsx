"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Wallet, XCircle, Calculator, RefreshCw } from "lucide-react";
import {
  useAccounts,
  useCreateAccount,
  useUpdateAccount,
  useDeleteAccount,
  useCloseAccount,
  useReconcileBalance,
  useBalanceAtDate,
  useRecalculateAllBalances,
} from "../_lib/api/accounts";
import { useOwners } from "../_lib/api/owners";
import { Button } from "../_components/Button";
import type { Account, AccountType } from "../_lib/types";
import { format } from "date-fns";

const ACCOUNT_TYPES: AccountType[] = [
  "EVERYDAY",
  "SAVINGS",
  "TRANSIT",
  "SECURITIES",
  "INVESTMENTS",
  "PROJECTS",
];

export default function AccountsPage() {
  const { data: accounts, isLoading } = useAccounts();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [reconcileAccount, setReconcileAccount] = useState<Account | null>(null);
  const recalculateAllBalances = useRecalculateAllBalances();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading accounts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Accounts</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your financial accounts
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="secondary"
            onClick={() => recalculateAllBalances.mutate()}
            disabled={recalculateAllBalances.isPending}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${recalculateAllBalances.isPending ? "animate-spin" : ""}`} />
            Recalculate All
          </Button>
          <Button
            onClick={() => {
              setEditingAccount(null);
              setIsDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Account
          </Button>
        </div>
      </div>

      {accounts && accounts.length === 0 ? (
        <div className="text-center py-12">
          <Wallet className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No accounts yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Get started by creating your first account.
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Account
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts?.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onEdit={() => {
                setEditingAccount(account);
                setIsDialogOpen(true);
              }}
              onReconcile={() => setReconcileAccount(account)}
            />
          ))}
        </div>
      )}

      {isDialogOpen && (
        <AccountDialog
          account={editingAccount}
          onClose={() => {
            setIsDialogOpen(false);
            setEditingAccount(null);
          }}
        />
      )}

      {reconcileAccount && (
        <ReconcileDialog
          account={reconcileAccount}
          onClose={() => setReconcileAccount(null)}
        />
      )}
    </div>
  );
}

function AccountCard({
  account,
  onEdit,
  onReconcile,
}: {
  account: Account;
  onEdit: () => void;
  onReconcile: () => void;
}) {
  const deleteAccount = useDeleteAccount();
  const closeAccount = useCloseAccount();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: account.currency,
    }).format(amount);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white"
            style={{ backgroundColor: account.color || "#3B82F6" }}
          >
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {account.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {account.type.replace("_", " ")}
              {account.accountNumber && ` • ${account.accountNumber}`}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onReconcile}
            className="p-2 text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400"
            title="Reconcile Balance"
          >
            <Calculator className="w-4 h-4" />
          </button>
          <button
            onClick={onEdit}
            className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
            title="Edit Account"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          {!account.closedAt && (
            <button
              onClick={() => {
                if (confirm("Are you sure you want to close this account?")) {
                  closeAccount.mutate({ id: account.id });
                }
              }}
              className="p-2 text-gray-600 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400"
              title="Close Account"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => {
              if (confirm("Are you sure you want to delete this account?")) {
                deleteAccount.mutate(account.id);
              }
            }}
            className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
            title="Delete Account"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(account.balance)}
          </span>
          {account.closedAt && (
            <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs rounded-full">
              Closed
            </span>
          )}
          {!account.isActive && !account.closedAt && (
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs rounded-full">
              Inactive
            </span>
          )}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Opened: {format(new Date(account.openAt), "MMM d, yyyy")}
          {account.closedAt && ` • Closed: ${format(new Date(account.closedAt), "MMM d, yyyy")}`}
        </div>
        {account.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {account.description}
          </p>
        )}
      </div>
    </div>
  );
}

function AccountDialog({ account, onClose }: { account: Account | null; onClose: () => void }) {
  const { data: owners } = useOwners();
  const [name, setName] = useState(account?.name || "");
  const [accountNumber, setAccountNumber] = useState(account?.accountNumber || "");
  const [type, setType] = useState<AccountType>(account?.type || "EVERYDAY");
  const [currency, setCurrency] = useState(account?.currency || "USD");
  const [initialBalance, setInitialBalance] = useState(account?.initialBalance.toString() || "0");
  const [description, setDescription] = useState(account?.description || "");
  const [color, setColor] = useState(account?.color || "#3B82F6");
  const [ownerIds, setOwnerIds] = useState<number[]>(account?.ownerIds || []);
  const [openAt, setOpenAt] = useState(account?.openAt || format(new Date(), "yyyy-MM-dd"));

  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const accountData = {
      name,
      accountNumber: accountNumber || undefined,
      type,
      currency,
      initialBalance: parseFloat(initialBalance),
      description: description || undefined,
      color,
      ownerIds,
      openAt,
      isActive: true,
      displayOrder: 0,
    };

    if (account) {
      await updateAccount.mutateAsync({ id: account.id, ...accountData });
    } else {
      await createAccount.mutateAsync(accountData);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md my-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          {account ? "Edit Account" : "Add Account"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Account Number
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Optional account number"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as AccountType)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            >
              {ACCOUNT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Currency *
              </label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Initial Balance *
              </label>
              <input
                type="number"
                step="0.01"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Color
            </label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full h-10 px-1 border border-gray-300 dark:border-gray-600 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Owners * (Select at least one)
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md p-2">
              {owners?.map((owner) => (
                <label key={owner.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={ownerIds.includes(owner.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setOwnerIds([...ownerIds, owner.id]);
                      } else {
                        setOwnerIds(ownerIds.filter((id) => id !== owner.id));
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{owner.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Open Date *
            </label>
            <input
              type="date"
              value={openAt}
              onChange={(e) => setOpenAt(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              className="flex-1"
              isLoading={createAccount.isPending || updateAccount.isPending}
              disabled={ownerIds.length === 0}
            >
              {account ? "Update" : "Create"}
            </Button>
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ReconcileDialog({ account, onClose }: { account: Account; onClose: () => void }) {
  const [asOfDate, setAsOfDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [knownBalance, setKnownBalance] = useState("");
  const reconcileBalance = useReconcileBalance();
  const { data: balancePreview, isLoading: previewLoading } = useBalanceAtDate(account.id, asOfDate);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: account.currency,
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await reconcileBalance.mutateAsync({
      id: account.id,
      asOfDate,
      knownBalance: parseFloat(knownBalance),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg my-8">
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
          Reconcile Balance
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Set the known balance at a specific date. The system will adjust the initial balance
          so that the calculated balance at that date matches your input.
        </p>

        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            {account.name}
          </h3>
          <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <div className="flex justify-between">
              <span>Current Balance:</span>
              <span className="font-mono">{formatCurrency(account.balance)}</span>
            </div>
            <div className="flex justify-between">
              <span>Initial Balance:</span>
              <span className="font-mono">{formatCurrency(account.initialBalance)}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              As of Date *
            </label>
            <input
              type="date"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          {balancePreview && !previewLoading && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Balance Preview at {asOfDate}
              </h4>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <div className="flex justify-between">
                  <span>Calculated Balance:</span>
                  <span className="font-mono font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(balancePreview.calculatedBalanceAtDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Transactions to date:</span>
                  <span>{balancePreview.transactionCountToDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Transactions after date:</span>
                  <span>{balancePreview.transactionCountAfterDate}</span>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Known Balance at Date *
            </label>
            <input
              type="number"
              step="0.01"
              value={knownBalance}
              onChange={(e) => setKnownBalance(e.target.value)}
              placeholder="Enter actual balance from bank statement"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Enter the actual balance from your bank statement at the selected date.
            </p>
          </div>

          {knownBalance && balancePreview && (
            <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                Adjustment Preview
              </h4>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Difference:{" "}
                <span className="font-mono font-semibold">
                  {formatCurrency(parseFloat(knownBalance) - balancePreview.calculatedBalanceAtDate)}
                </span>
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                The initial balance will be adjusted by this amount.
              </p>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              className="flex-1"
              isLoading={reconcileBalance.isPending}
              disabled={!knownBalance}
            >
              Reconcile
            </Button>
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
