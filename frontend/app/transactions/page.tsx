"use client";

import {useEffect, useState, useMemo, useCallback} from "react";
import {Plus, ArrowDownCircle, ArrowUpCircle, ArrowRightLeft, Edit2, Trash2, CheckCircle, Filter, X, ChevronDown, ChevronUp} from "lucide-react";
import {Button} from "../_components/Button";
import {DataTable, Column} from "../_components/DataTable";
import {
    useTransactions,
    useCreateTransaction,
    useCreateTransfer,
    useUpdateTransaction,
    useDeleteTransaction,
    useReconcileTransaction,
} from "../_lib/api/transactions";
import {useAccounts} from "../_lib/api/accounts";
import {useSubcategories} from "../_lib/api/subcategories";
import {Transaction, TransactionType, TransactionStatus} from "../_lib/types";

type ModalMode = "create" | "edit" | "transfer";

interface ModalState {
    mode: ModalMode;
    data?: Transaction;
}

interface TransactionFilters {
    accountId?: number;
    type?: TransactionType;
    status?: TransactionStatus;
    subcategoryId?: number;
    dateFrom?: string;
    dateTo?: string;
    amountMin?: number;
    amountMax?: number;
    searchText?: string;
}

export default function TransactionsPage() {
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(50);
    const [modal, setModal] = useState<ModalState | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<TransactionFilters>({});

    const {data: allTransactions = [], isLoading} = useTransactions();

    useEffect(() => {
        setPage(1);
    }, [filters]);

    const {data: accounts = []} = useAccounts();
    const {data: subcategories = []} = useSubcategories();

    const reconcile = useReconcileTransaction();
    const deleteTransaction = useDeleteTransaction();

    const getAccountName = useCallback((id: number) =>
        accounts.find((a) => a.id === id)?.name || `Account ${id}`,
        [accounts]
    );

    const getSubcategoryName = useCallback((id?: number) =>
        id ? subcategories.find((s) => s.id === id)?.name || `Subcategory ${id}` : "-",
        [subcategories]
    );

    // Apply filters to transactions
    const transactions = useMemo(() => {
        return allTransactions.filter((tx) => {
            // Account filter
            if (filters.accountId && tx.accountId !== filters.accountId) {
                return false;
            }

            // Type filter
            if (filters.type && tx.type !== filters.type) {
                return false;
            }

            // Status filter
            if (filters.status && tx.status !== filters.status) {
                return false;
            }

            // Subcategory filter
            if (filters.subcategoryId !== undefined) {
                if (filters.subcategoryId === 0 && tx.subcategoryId !== undefined) {
                    return false; // Filter for uncategorized
                } else if (filters.subcategoryId > 0 && tx.subcategoryId !== filters.subcategoryId) {
                    return false;
                }
            }

            // Date from filter
            if (filters.dateFrom && tx.date < filters.dateFrom) {
                return false;
            }

            // Date to filter
            if (filters.dateTo && tx.date > filters.dateTo) {
                return false;
            }

            // Amount min filter
            if (filters.amountMin !== undefined && Math.abs(tx.amount) < filters.amountMin) {
                return false;
            }

            // Amount max filter
            if (filters.amountMax !== undefined && Math.abs(tx.amount) > filters.amountMax) {
                return false;
            }

            // Text search filter
            if (filters.searchText) {
                const searchLower = filters.searchText.toLowerCase();
                const description = (tx.description || "").toLowerCase();
                const notes = (tx.notes || "").toLowerCase();
                const accountName = getAccountName(tx.accountId).toLowerCase();
                const subcategoryName = getSubcategoryName(tx.subcategoryId).toLowerCase();

                if (
                    !description.includes(searchLower) &&
                    !notes.includes(searchLower) &&
                    !accountName.includes(searchLower) &&
                    !subcategoryName.includes(searchLower)
                ) {
                    return false;
                }
            }

            return true;
        });
    }, [allTransactions, filters, getAccountName, getSubcategoryName]);

    const clearFilters = () => {
        setFilters({});
    };

    const hasActiveFilters = Object.keys(filters).length > 0;

    // Calculate paginated data for footer
    const paginatedTransactions = useMemo(() => {
        const startIndex = (page - 1) * pageSize;
        return transactions.slice(startIndex, startIndex + pageSize);
    }, [transactions, page, pageSize]);

    // Calculate sum of amounts on current page
    const pageAmountSum = useMemo(() => {
        return paginatedTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    }, [paginatedTransactions]);

    // Calculate sum of all filtered transactions
    const totalAmountSum = useMemo(() => {
        return transactions.reduce((sum, tx) => sum + tx.amount, 0);
    }, [transactions]);

    const formatAmount = (amount: number, type: TransactionType) => {
        const formatted = Math.abs(amount).toFixed(2);
        const color =
            type === "INCOME"
                ? "text-green-600 dark:text-green-400"
                : type === "EXPENSE"
                    ? "text-red-600 dark:text-red-400"
                    : "text-blue-600 dark:text-blue-400";
        const sign = amount >= 0 ? "+" : "-";
        return <span className={color}>{sign}${formatted}</span>;
    };

    const getTypeIcon = (type: TransactionType) => {
        switch (type) {
            case "INCOME":
                return <ArrowDownCircle className="w-5 h-5 text-green-600 dark:text-green-400"/>;
            case "EXPENSE":
                return <ArrowUpCircle className="w-5 h-5 text-red-600 dark:text-red-400"/>;
            case "TRANSFER":
                return <ArrowRightLeft className="w-5 h-5 text-blue-600 dark:text-blue-400"/>;
        }
    };

    const columns: Column<Transaction>[] = [
        {
            header: "Type",
            accessor: (row) => getTypeIcon(row.type),
            className: "px-6 py-4 whitespace-nowrap",
        },
        {
            header: "Date",
            accessor: "date",
            className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white",
        },
        {
            header: "Account",
            accessor: (row) => getAccountName(row.accountId),
            className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white",
        },
        {
            header: "Description",
            accessor: (row) => row.description || "-",
            className: "px-6 py-4 text-sm text-gray-900 dark:text-white",
        },
        {
            header: "Category",
            accessor: (row) => getSubcategoryName(row.subcategoryId),
            className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white",
        },
        {
            header: "Amount",
            accessor: (row) => formatAmount(row.amount, row.type),
            className: "px-6 py-4 whitespace-nowrap text-sm font-medium text-right",
            headerClassName: "px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider",
        },
        {
            header: "Status",
            accessor: (row) => (
                <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        row.status === "RECONCILED"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : row.status === "CLEARED"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    }`}
                >
                  {row.status}
                </span>
            ),
            className: "px-6 py-4 whitespace-nowrap text-center",
            headerClassName: "px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider",
        },
        {
            header: "Actions",
            accessor: (row) => (
                <div className="flex justify-end gap-2">
                    {row.status !== "RECONCILED" && (
                        <button
                            onClick={() => reconcile.mutate(row.id)}
                            className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900 dark:text-green-400 rounded"
                            title="Reconcile"
                        >
                            <CheckCircle className="w-4 h-4"/>
                        </button>
                    )}
                    {row.type !== "TRANSFER" && (
                        <button
                            onClick={() => setModal({mode: "edit", data: row})}
                            className="p-1 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-400 rounded"
                            title="Edit"
                        >
                            <Edit2 className="w-4 h-4"/>
                        </button>
                    )}
                    <button
                        onClick={() => {
                            if (confirm(`Delete this ${row.type.toLowerCase()} transaction?${row.type === "TRANSFER" ? " This will delete both sides of the transfer." : ""}`)) {
                                deleteTransaction.mutate(row.id);
                            }
                        }}
                        className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 dark:text-red-400 rounded"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4"/>
                    </button>
                </div>
            ),
            className: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium",
            headerClassName: "px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider",
        },
    ];

    if (isLoading) {
        return <div className="p-6">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Transactions
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Track your income, expenses, and transfers
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => setModal({mode: "create"})}
                        className="flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4"/>
                        New Transaction
                    </Button>
                    <Button
                        onClick={() => setModal({mode: "transfer"})}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                    >
                        <ArrowRightLeft className="w-4 h-4"/>
                        Transfer
                    </Button>
                </div>
            </div>

            <DataTable
                data={transactions}
                columns={columns}
                keyExtractor={(row) => row.id.toString()}
                loading={isLoading}
                emptyMessage="No transactions matching the current filters."
                enablePagination={true}
                pageSize={pageSize}
                currentPage={page}
                onPageChange={setPage}
                filterComponent={
                    <div className="space-y-3">
                        <div className="flex items-center justify-between gap-4">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
                            >
                                <Filter className="w-4 h-4"/>
                                <span className="font-medium">
                                    Filters
                                    {hasActiveFilters && ` (${Object.keys(filters).length} active)`}
                                </span>
                                {showFilters ? (
                                    <ChevronUp className="w-4 h-4"/>
                                ) : (
                                    <ChevronDown className="w-4 h-4"/>
                                )}
                            </button>

                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-md transition-colors"
                                >
                                    <X className="w-4 h-4"/>
                                    Clear All Filters
                                </button>
                            )}
                        </div>

                        {showFilters && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                                {/* Search */}
                                <div className="lg:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Search
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Search description, notes, account, or category..."
                                        value={filters.searchText || ""}
                                        onChange={(e) =>
                                            setFilters({...filters, searchText: e.target.value || undefined})
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                    />
                                </div>

                                {/* Account */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Account
                                    </label>
                                    <select
                                        value={filters.accountId || ""}
                                        onChange={(e) =>
                                            setFilters({
                                                ...filters,
                                                accountId: e.target.value ? Number(e.target.value) : undefined,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    >
                                        <option value="">All Accounts</option>
                                        {accounts.map((account) => (
                                            <option key={account.id} value={account.id}>
                                                {account.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Type
                                    </label>
                                    <select
                                        value={filters.type || ""}
                                        onChange={(e) =>
                                            setFilters({
                                                ...filters,
                                                type: e.target.value as TransactionType | undefined,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    >
                                        <option value="">All Types</option>
                                        <option value="INCOME">Income</option>
                                        <option value="EXPENSE">Expense</option>
                                        <option value="TRANSFER">Transfer</option>
                                    </select>
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Status
                                    </label>
                                    <select
                                        value={filters.status || ""}
                                        onChange={(e) =>
                                            setFilters({
                                                ...filters,
                                                status: e.target.value as TransactionStatus | undefined,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="PENDING">Pending</option>
                                        <option value="CLEARED">Cleared</option>
                                        <option value="RECONCILED">Reconciled</option>
                                    </select>
                                </div>

                                {/* Category/Subcategory */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Category
                                    </label>
                                    <select
                                        value={filters.subcategoryId !== undefined ? filters.subcategoryId : ""}
                                        onChange={(e) =>
                                            setFilters({
                                                ...filters,
                                                subcategoryId: e.target.value ? Number(e.target.value) : undefined,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    >
                                        <option value="">All Categories</option>
                                        <option value="0">Uncategorized</option>
                                        {subcategories.map((sub) => (
                                            <option key={sub.id} value={sub.id}>
                                                {sub.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Date From */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Date From
                                    </label>
                                    <input
                                        type="date"
                                        value={filters.dateFrom || ""}
                                        onChange={(e) =>
                                            setFilters({...filters, dateFrom: e.target.value || undefined})
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    />
                                </div>

                                {/* Date To */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Date To
                                    </label>
                                    <input
                                        type="date"
                                        value={filters.dateTo || ""}
                                        onChange={(e) =>
                                            setFilters({...filters, dateTo: e.target.value || undefined})
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    />
                                </div>

                                {/* Amount Min */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Min Amount
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={filters.amountMin !== undefined ? filters.amountMin : ""}
                                        onChange={(e) =>
                                            setFilters({
                                                ...filters,
                                                amountMin: e.target.value ? Number(e.target.value) : undefined,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    />
                                </div>

                                {/* Amount Max */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Max Amount
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={filters.amountMax !== undefined ? filters.amountMax : ""}
                                        onChange={(e) =>
                                            setFilters({
                                                ...filters,
                                                amountMax: e.target.value ? Number(e.target.value) : undefined,
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                }
                footerComponent={
                    <div className="flex items-center justify-between px-6 py-3 bg-gray-50 dark:bg-gray-900">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Showing {paginatedTransactions.length} of {transactions.length} transactions
                        </div>
                        <div className="flex items-center gap-6 text-sm font-medium">
                            <div>
                                <span className="text-gray-600 dark:text-gray-400 mr-2">Page Total:</span>
                                <span className={pageAmountSum >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                                    {pageAmountSum >= 0 ? "+$" : "-$"}{Math.abs(pageAmountSum).toFixed(2)}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600 dark:text-gray-400 mr-2">Filtered Total:</span>
                                <span className={totalAmountSum >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                                    {totalAmountSum >= 0 ? "+$" : "-$"}{Math.abs(totalAmountSum).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                }
            />

            {modal && (
                <TransactionModal
                    modal={modal}
                    accounts={accounts}
                    subcategories={subcategories}
                    onClose={() => setModal(null)}
                />
            )}
        </div>
    );
}

interface TransactionModalProps {
    modal: ModalState;
    accounts: any[];
    subcategories: any[];
    onClose: () => void;
}

function TransactionModal({
                              modal,
                              accounts,
                              subcategories,
                              onClose,
                          }: TransactionModalProps) {
    const [formData, setFormData] = useState<any>(() => {
        if (modal.mode === "edit" && modal.data) {
            return {
                ...modal.data,
                date: modal.data.date.split("T")[0],
            };
        }
        return {
            accountId: "",
            amount: "",
            type: "EXPENSE" as TransactionType,
            subcategoryId: "",
            date: new Date().toISOString().split("T")[0],
            description: "",
            notes: "",
            tags: [],
            status: "PENDING" as TransactionStatus,
            fromAccountId: "",
            toAccountId: "",
        };
    });

    const createTransaction = useCreateTransaction();
    const createTransfer = useCreateTransfer();
    const updateTransaction = useUpdateTransaction();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (modal.mode === "transfer") {
                await createTransfer.mutateAsync({
                    fromAccountId: Number(formData.fromAccountId),
                    toAccountId: Number(formData.toAccountId),
                    amount: Number(formData.amount),
                    date: formData.date,
                    description: formData.description || undefined,
                    notes: formData.notes || undefined,
                });
            } else if (modal.mode === "create") {
                await createTransaction.mutateAsync({
                    accountId: Number(formData.accountId),
                    amount: Number(formData.amount),
                    type: formData.type,
                    subcategoryId: formData.subcategoryId
                        ? Number(formData.subcategoryId)
                        : undefined,
                    date: formData.date,
                    description: formData.description || undefined,
                    notes: formData.notes || undefined,
                    tags: formData.tags || [],
                    status: formData.status,
                });
            } else {
                // For update, only send fields that should be updated
                await updateTransaction.mutateAsync({
                    id: formData.id,
                    accountId: Number(formData.accountId),
                    amount: Number(formData.amount),
                    type: formData.type,
                    subcategoryId: formData.subcategoryId
                        ? Number(formData.subcategoryId)
                        : undefined,
                    date: formData.date,
                    description: formData.description || undefined,
                    notes: formData.notes || undefined,
                    tags: formData.tags || [],
                    status: formData.status,
                });
            }
            onClose();
        } catch (error: any) {
            console.error("Error saving transaction:", error);
            console.error("Error response:", error.response?.data);
            alert(`Error saving transaction: ${error.response?.data?.message || error.response?.data?.error || error.message}`);
        }
    };

    const title =
        modal.mode === "transfer"
            ? "Create Transfer"
            : modal.mode === "edit"
                ? "Edit Transaction"
                : "Create Transaction";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        {title}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {modal.mode === "transfer" ? (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        From Account *
                                    </label>
                                    <select
                                        value={formData.fromAccountId}
                                        onChange={(e) =>
                                            setFormData({...formData, fromAccountId: e.target.value})
                                        }
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    >
                                        <option value="">Select account...</option>
                                        {accounts.map((account) => (
                                            <option key={account.id} value={account.id}>
                                                {account.name} (${account.balance.toFixed(2)})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        To Account *
                                    </label>
                                    <select
                                        value={formData.toAccountId}
                                        onChange={(e) =>
                                            setFormData({...formData, toAccountId: e.target.value})
                                        }
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    >
                                        <option value="">Select account...</option>
                                        {accounts.map((account) => (
                                            <option key={account.id} value={account.id}>
                                                {account.name} (${account.balance.toFixed(2)})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Account *
                                    </label>
                                    <select
                                        value={formData.accountId}
                                        onChange={(e) =>
                                            setFormData({...formData, accountId: e.target.value})
                                        }
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    >
                                        <option value="">Select account...</option>
                                        {accounts.map((account) => (
                                            <option key={account.id} value={account.id}>
                                                {account.name} (${account.balance.toFixed(2)})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Type *
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) =>
                                            setFormData({...formData, type: e.target.value})
                                        }
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    >
                                        <option value="INCOME">Income</option>
                                        <option value="EXPENSE">Expense</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Category
                                    </label>
                                    <select
                                        value={formData.subcategoryId}
                                        onChange={(e) =>
                                            setFormData({...formData, subcategoryId: e.target.value})
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    >
                                        <option value="">Uncategorized</option>
                                        {subcategories.map((sub) => (
                                            <option key={sub.id} value={sub.id}>
                                                {sub.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Amount *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.amount}
                                onChange={(e) =>
                                    setFormData({...formData, amount: e.target.value})
                                }
                                required
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Date *
                            </label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) =>
                                    setFormData({...formData, date: e.target.value})
                                }
                                required
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Description
                            </label>
                            <input
                                type="text"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({...formData, description: e.target.value})
                                }
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Notes
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) =>
                                    setFormData({...formData, notes: e.target.value})
                                }
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button type="submit" className="flex-1">
                                {modal.mode === "create" || modal.mode === "transfer"
                                    ? "Create"
                                    : "Save"}
                            </Button>
                            <Button
                                type="button"
                                onClick={onClose}
                                className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500"
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}