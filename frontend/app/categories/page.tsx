"use client";

import { useState } from "react";
import { Plus, ChevronRight, ChevronDown, Edit2, Trash2 } from "lucide-react";
import { Button } from "../_components/Button";
import {
  useBuckets,
  useCreateBucket,
  useUpdateBucket,
  useDeleteBucket,
} from "../_lib/api/buckets";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "../_lib/api/categories";
import {
  useSubcategories,
  useCreateSubcategory,
  useUpdateSubcategory,
  useDeleteSubcategory,
} from "../_lib/api/subcategories";
import { Bucket, Category, Subcategory } from "../_lib/types";
import {DbIcon} from "@/app/_components/DbIcon";

type ModalType = "bucket" | "category" | "subcategory";

interface ModalState {
  type: ModalType;
  mode: "create" | "edit";
  data?: Bucket | Category | Subcategory;
  parentId?: number;
}

export default function CategoriesPage() {
  const [modal, setModal] = useState<ModalState | null>(null);
  const [expandedBuckets, setExpandedBuckets] = useState<Set<number>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  const { data: buckets = [], isLoading: bucketsLoading } = useBuckets();
  const { data: categories = [] } = useCategories();
  const { data: subcategories = [] } = useSubcategories();

  const toggleBucket = (id: number) => {
    const newExpanded = new Set(expandedBuckets);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedBuckets(newExpanded);
  };

  const toggleCategory = (id: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCategories(newExpanded);
  };

  const getCategoriesForBucket = (bucketId: number) =>
    categories.filter((c) => c.bucketId === bucketId);

  const getSubcategoriesForCategory = (categoryId: number) =>
    subcategories.filter((s) => s.categoryId === categoryId);

  if (bucketsLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Categories
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your spending categories (Bucket → Category → Subcategory)
          </p>
        </div>
        <Button
          onClick={() => setModal({ type: "bucket", mode: "create" })}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Bucket
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {buckets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              No buckets yet. Create one to get started.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {buckets.map((bucket) => (
              <BucketRow
                key={bucket.id}
                bucket={bucket}
                categories={getCategoriesForBucket(bucket.id)}
                subcategories={subcategories}
                isExpanded={expandedBuckets.has(bucket.id)}
                onToggle={() => toggleBucket(bucket.id)}
                onEdit={() => setModal({ type: "bucket", mode: "edit", data: bucket })}
                onAddCategory={() =>
                  setModal({
                    type: "category",
                    mode: "create",
                    parentId: bucket.id,
                  })
                }
                onEditCategory={(category) =>
                  setModal({ type: "category", mode: "edit", data: category })
                }
                onAddSubcategory={(categoryId) =>
                  setModal({
                    type: "subcategory",
                    mode: "create",
                    parentId: categoryId,
                  })
                }
                onEditSubcategory={(subcategory) =>
                  setModal({ type: "subcategory", mode: "edit", data: subcategory })
                }
                expandedCategories={expandedCategories}
                onToggleCategory={toggleCategory}
              />
            ))}
          </div>
        )}
      </div>

      {modal && (
        <EntityModal
          modal={modal}
          onClose={() => setModal(null)}
          categories={categories}
        />
      )}
    </div>
  );
}

interface BucketRowProps {
  bucket: Bucket;
  categories: Category[];
  subcategories: Subcategory[];
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onAddCategory: () => void;
  onEditCategory: (category: Category) => void;
  onAddSubcategory: (categoryId: number) => void;
  onEditSubcategory: (subcategory: Subcategory) => void;
  expandedCategories: Set<number>;
  onToggleCategory: (id: number) => void;
}

function BucketRow({
  bucket,
  categories,
  subcategories,
  isExpanded,
  onToggle,
  onEdit,
  onAddCategory,
  onEditCategory,
  onAddSubcategory,
  onEditSubcategory,
  expandedCategories,
  onToggleCategory,
}: BucketRowProps) {
  const deleteBucket = useDeleteBucket();

  return (
    <div>
      <div className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
        <button onClick={onToggle} className="p-1">
          {isExpanded ? (
            <ChevronDown className="w-5 h-5" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
        </button>
          {bucket.icon && <DbIcon svg={bucket.icon} color={bucket.color} className={"w-6 h-6"}/>}
        <div className="flex-1">
          <div className="font-medium text-gray-900 dark:text-white">
            {bucket.name}
          </div>
          {bucket.description && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {bucket.description}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onAddCategory}
            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={onEdit}
            className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (
                confirm(
                  "Delete this bucket? All categories and subcategories will also be deleted."
                )
              ) {
                deleteBucket.mutate(bucket.id);
              }
            }}
            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="pl-8 bg-gray-50 dark:bg-gray-900">
          {categories.length === 0 ? (
            <div className="p-4 text-sm text-gray-600 dark:text-gray-400">
              No categories. Add one to get started.
            </div>
          ) : (
            categories.map((category) => (
              <CategoryRow
                key={category.id}
                category={category}
                subcategories={subcategories.filter(
                  (s) => s.categoryId === category.id
                )}
                isExpanded={expandedCategories.has(category.id)}
                onToggle={() => onToggleCategory(category.id)}
                onEdit={() => onEditCategory(category)}
                onAddSubcategory={() => onAddSubcategory(category.id)}
                onEditSubcategory={onEditSubcategory}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

interface CategoryRowProps {
  category: Category;
  subcategories: Subcategory[];
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onAddSubcategory: () => void;
  onEditSubcategory: (subcategory: Subcategory) => void;
}

function CategoryRow({
  category,
  subcategories,
  isExpanded,
  onToggle,
  onEdit,
  onAddSubcategory,
  onEditSubcategory,
}: CategoryRowProps) {
  const deleteCategory = useDeleteCategory();

  return (
    <div className="border-l-2 border-gray-300 dark:border-gray-600">
      <div className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800">
        <button onClick={onToggle} className="p-1">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
          {category.icon && <DbIcon svg={category.icon} color={category.color} className={"w-6 h-6"}/>}
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {category.name}
          </div>
          {category.description && (
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {category.description}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onAddSubcategory}
            className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
          >
            <Plus className="w-3 h-3" />
          </button>
          <button
            onClick={onEdit}
            className="p-1 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button
            onClick={() => {
              if (
                confirm(
                  "Delete this category? All subcategories will also be deleted."
                )
              ) {
                deleteCategory.mutate(category.id);
              }
            }}
            className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="pl-8">
          {subcategories.length === 0 ? (
            <div className="p-3 text-xs text-gray-600 dark:text-gray-400">
              No subcategories. Add one to get started.
            </div>
          ) : (
            subcategories.map((subcategory) => (
              <SubcategoryRow
                key={subcategory.id}
                subcategory={subcategory}
                onEdit={() => onEditSubcategory(subcategory)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

interface SubcategoryRowProps {
  subcategory: Subcategory;
  onEdit: () => void;
}

function SubcategoryRow({ subcategory, onEdit }: SubcategoryRowProps) {
  const deleteSubcategory = useDeleteSubcategory();

  return (
    <div className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 border-l-2 border-gray-300 dark:border-gray-600">
      <div className="w-4" />
      <div className="flex-1">
        <div className="text-xs font-medium text-gray-900 dark:text-white">
          {subcategory.name}
        </div>
        {subcategory.description && (
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {subcategory.description}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onEdit}
          className="p-1 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
        >
          <Edit2 className="w-3 h-3" />
        </button>
        <button
          onClick={() => {
            if (confirm("Delete this subcategory?")) {
              deleteSubcategory.mutate(subcategory.id);
            }
          }}
          className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

interface EntityModalProps {
  modal: ModalState;
  onClose: () => void;
  categories: Category[];
}

function EntityModal({ modal, onClose, categories }: EntityModalProps) {
  const [formData, setFormData] = useState<any>(() => {
    if (modal.mode === "edit" && modal.data) {
      return modal.data;
    }
    return {
      name: "",
      description: "",
      color: "",
      icon: "",
      displayOrder: 0,
      isActive: true,
    };
  });

  const createBucket = useCreateBucket();
  const updateBucket = useUpdateBucket();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const createSubcategory = useCreateSubcategory();
  const updateSubcategory = useUpdateSubcategory();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (modal.type === "bucket") {
        if (modal.mode === "create") {
          await createBucket.mutateAsync(formData);
        } else {
          await updateBucket.mutateAsync({ id: formData.id, ...formData });
        }
      } else if (modal.type === "category") {
        const data =
          modal.mode === "create"
            ? { ...formData, bucketId: modal.parentId }
            : formData;
        if (modal.mode === "create") {
          await createCategory.mutateAsync(data);
        } else {
          await updateCategory.mutateAsync({ id: data.id, ...data });
        }
      } else if (modal.type === "subcategory") {
        const data =
          modal.mode === "create"
            ? { ...formData, categoryId: modal.parentId }
            : formData;
        if (modal.mode === "create") {
          await createSubcategory.mutateAsync(data);
        } else {
          await updateSubcategory.mutateAsync({ id: data.id, ...data });
        }
      }
      onClose();
    } catch (error) {
      console.error("Error saving:", error);
    }
  };

  const title =
    modal.mode === "create"
      ? `Create ${modal.type}`
      : `Edit ${modal.type}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {title}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
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
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="rounded"
              />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Active
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {modal.mode === "create" ? "Create" : "Save"}
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
