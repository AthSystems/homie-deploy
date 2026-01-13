"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, User } from "lucide-react";
import { useOwners, useCreateOwner, useUpdateOwner, useDeleteOwner } from "../_lib/api/owners";
import { Button } from "../_components/Button";
import type { Owner } from "../_lib/types";

export default function OwnersPage() {
  const { data: owners, isLoading } = useOwners();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOwner, setEditingOwner] = useState<Owner | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading owners...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Owners</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage household members and account owners
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingOwner(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Owner
        </Button>
      </div>

      {owners && owners.length === 0 ? (
        <div className="text-center py-12">
          <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No owners yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Get started by creating your first owner.
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Owner
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {owners?.map((owner) => (
            <OwnerCard
              key={owner.id}
              owner={owner}
              onEdit={() => {
                setEditingOwner(owner);
                setIsDialogOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {isDialogOpen && (
        <OwnerDialog
          owner={editingOwner}
          onClose={() => {
            setIsDialogOpen(false);
            setEditingOwner(null);
          }}
        />
      )}
    </div>
  );
}

function OwnerCard({ owner, onEdit }: { owner: Owner; onEdit: () => void }) {
  const deleteOwner = useDeleteOwner();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
            style={{ backgroundColor: owner.color || "#3B82F6" }}
          >
            {owner.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {owner.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {owner.isActive ? "Active" : "Inactive"}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (confirm("Are you sure you want to delete this owner?")) {
                deleteOwner.mutate(owner.id);
              }
            }}
            className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function OwnerDialog({ owner, onClose }: { owner: Owner | null; onClose: () => void }) {
  const [name, setName] = useState(owner?.name || "");
  const [color, setColor] = useState(owner?.color || "#3B82F6");
  const [isActive, setIsActive] = useState(owner?.isActive ?? true);

  const createOwner = useCreateOwner();
  const updateOwner = useUpdateOwner();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const ownerData = { name, color, isActive };

    if (owner) {
      await updateOwner.mutateAsync({ id: owner.id, ...ownerData });
    } else {
      await createOwner.mutateAsync(ownerData);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          {owner ? "Edit Owner" : "Add Owner"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name
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
              Color
            </label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full h-10 px-1 border border-gray-300 dark:border-gray-600 rounded-md"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="mr-2"
            />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Active
            </label>
          </div>
          <div className="flex space-x-3 pt-4">
            <Button type="submit" className="flex-1" isLoading={createOwner.isPending || updateOwner.isPending}>
              {owner ? "Update" : "Create"}
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
