"use client";

import { ReactNode, useState } from "react";

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
  className?: string;
  headerClassName?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T, index: number) => string | number;
  loading?: boolean;
  emptyMessage?: string;

  // Pagination
  enablePagination?: boolean;
  pageSize?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;

  // Filtering
  filterComponent?: ReactNode;

  // Footer (receives paginated data)
  footerComponent?: ReactNode;

  // Styling
  maxHeight?: string;
  rowClassName?: (row: T) => string;
  containerClassName?: string;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  loading = false,
  emptyMessage = "No data available",
  enablePagination = false,
  pageSize = 50,
  currentPage: externalPage,
  onPageChange,
  filterComponent,
  footerComponent,
  maxHeight = "600px",
  rowClassName,
  containerClassName = "",
}: DataTableProps<T>) {
  const [internalPage, setInternalPage] = useState(1);

  const currentPage = externalPage ?? internalPage;
  const handlePageChange = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    } else {
      setInternalPage(page);
    }
  };

  // Pagination logic
  const totalPages = enablePagination ? Math.ceil(data.length / pageSize) : 1;
  const paginatedData = enablePagination
    ? data.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : data;

  const pagination = enablePagination ? getPaginationRange(currentPage, totalPages, 1) : [];

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow ${containerClassName}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600 dark:text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClassName}>
      {filterComponent && <div className="mb-4">{filterComponent}</div>}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {data.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">{emptyMessage}</p>
          </div>
        ) : (
          <>
            {enablePagination && pagination.length > 0 && (
              <div className="flex gap-1 items-center p-4 border-b border-gray-200 dark:border-gray-700">
                {pagination.map((item, i) =>
                  item === "..." ? (
                    <span
                      key={`ellipsis-${i}`}
                      className="px-3 py-1 text-gray-400 select-none"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => handlePageChange(item)}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        item === currentPage
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}
              </div>
            )}

            <div style={{ maxHeight }} className="overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0 z-10">
                  <tr>
                    {columns.map((column, index) => (
                      <th
                        key={index}
                        className={
                          column.headerClassName ||
                          "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        }
                      >
                        {column.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedData.map((row, rowIndex) => (
                    <tr
                      key={keyExtractor(row, rowIndex)}
                      className={
                        rowClassName
                          ? rowClassName(row)
                          : "hover:bg-gray-50 dark:hover:bg-gray-700"
                      }
                    >
                      {columns.map((column, colIndex) => (
                        <td
                          key={colIndex}
                          className={
                            column.className ||
                            "px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white"
                          }
                        >
                          {typeof column.accessor === "function"
                            ? column.accessor(row)
                            : String(row[column.accessor] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {footerComponent && (
              <div className="border-t border-gray-200 dark:border-gray-700">
                {footerComponent}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function getPaginationRange(
  current: number,
  total: number,
  delta = 1
): (number | "...")[] {
  const range: (number | "...")[] = [];
  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);

  range.push(1);

  if (left > 2) range.push("...");

  for (let i = left; i <= right; i++) {
    range.push(i);
  }

  if (right < total - 1) range.push("...");

  if (total > 1) range.push(total);

  return range;
}
