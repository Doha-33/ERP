import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Edit2, Trash2, Tag, Filter, X, TrendingUp, TrendingDown, Package, DollarSign } from "lucide-react";
import { Card, Button, Input, Badge, ExportDropdown } from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { CategoryModal } from "../../components/inventory/CategoryModal";
import { useData } from "../../context/DataContext";
import { Category, Account } from "../../types";
import { toast } from "sonner";

export const Categories: React.FC = () => {
  const { t } = useTranslation();
  const { categories, accounts, addCategory, updateCategory, deleteCategory, fetchCategories } = useData();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to extract ID
  const extractId = useCallback((value: any): string => {
    if (!value) return "";
    if (typeof value === "object") {
      return value._id || value.id || "";
    }
    return value;
  }, []);

  // Helper to get account display name
  const getAccountDisplay = useCallback((accountId: any): string => {
    if (!accountId) return "-";
    
    // If accountId is an object with account details
    if (typeof accountId === "object" && accountId !== null) {
      return `${accountId.accountCode} - ${accountId.accountName}`;
    }
    
    // If it's a string ID, find from accounts list
    const accountIdStr = typeof accountId === "string" ? accountId : extractId(accountId);
    const account = accounts.find(a => a._id === accountIdStr);
    
    if (account) {
      return `${account.accountCode} - ${account.accountName}`;
    }
    
    return "-";
  }, [accounts, extractId]);

  const handleSave = async (categoryData: Partial<Category>) => {
    try {
      setIsLoading(true);
      
      if (editingCategory) {
        const categoryId = extractId(editingCategory);
        
        if (!categoryId) {
          toast.error(t("category_id_missing"));
          return;
        }
        
        const updateData = {
          ...categoryData,
          _id: categoryId,
        } as Category;
        
        await updateCategory(updateData);
        toast.success(t("category_updated_successfully"));
      } else {
        await addCategory(categoryData as Category);
        toast.success(t("category_created_successfully"));
      }
      
      await fetchCategories();
      setIsModalOpen(false);
      setEditingCategory(null);
    } catch (error: any) {
      console.error("Error saving category:", error);
      const message = error?.response?.data?.message || error?.message || t("failed_to_save_category");
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = useCallback((category: Category) => {
    const categoryId = extractId(category);
    
    if (!categoryId) {
      console.error("Category ID not found", category);
      toast.error(t("category_id_not_found"));
      return;
    }
    
    const categoryToEdit: Category = {
      ...category,
      _id: categoryId,
    };
    
    setEditingCategory(categoryToEdit);
    setIsModalOpen(true);
  }, [extractId, t]);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      try {
        await deleteCategory(deleteId);
        toast.success(t("category_deleted_successfully"));
        setDeleteId(null);
        setSelectedIds(prev => prev.filter(sid => sid !== deleteId));
        await fetchCategories();
      } catch (error) {
        toast.error(t("failed_to_delete_category"));
      }
    }
  }, [deleteId, deleteCategory, fetchCategories, t]);

  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      await Promise.all(selectedIds.map(id => deleteCategory(id)));
      toast.success(t("categories_deleted_successfully", { count: selectedIds.length }));
      setSelectedIds([]);
      setIsBulkConfirmOpen(false);
      await fetchCategories();
    } catch (error) {
      console.error("Bulk delete failed", error);
      toast.error(t("failed_to_delete_categories"));
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase();
    return (
      <Badge variant={s === "ACTIVE" ? "success" : "danger"}>
        {s === "ACTIVE" ? t("active") : t("inactive")}
      </Badge>
    );
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString();
  };

  // Apply filters
  const filteredCategories = useMemo(() => {
    return categories.filter(c => {
      const matchesSearch = 
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !statusFilter || (c.status || '').toUpperCase() === statusFilter.toUpperCase();
      
      return matchesSearch && matchesStatus;
    });
  }, [categories, searchTerm, statusFilter]);

  // Statistics
  const totalCategories = filteredCategories.length;
  const activeCategories = filteredCategories.filter(c => (c.status || '').toUpperCase() === "ACTIVE").length;
  const inactiveCategories = filteredCategories.filter(c => (c.status || '').toUpperCase() === "INACTIVE").length;

  const statusOptions = [
    { value: "", label: t("all_statuses") },
    { value: "ACTIVE", label: t("active") },
    { value: "INACTIVE", label: t("inactive") },
  ];

  const columns: Column<Category>[] = useMemo(
    () => [
      {
        header: t("category_info"),
        render: (c) => {
          return (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Tag size={18} className="text-indigo-600" />
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">{c.name}</span>
                <span className="text-xs text-gray-500 line-clamp-1">{c.description || "-"}</span>
              </div>
            </div>
          );
        }
      },
      {
        header: t("income_account"),
        render: (c) => (
          <div className="flex items-center gap-1 text-sm">
            <TrendingUp size={14} className="text-green-600" />
            <span className="text-gray-600">{getAccountDisplay(c.incomeAccountId)}</span>
          </div>
        )
      },
      {
        header: t("expense_account"),
        render: (c) => (
          <div className="flex items-center gap-1 text-sm">
            <TrendingDown size={14} className="text-red-600" />
            <span className="text-gray-600">{getAccountDisplay(c.expenseAccountId)}</span>
          </div>
        )
      },
      {
        header: t("inventory_account"),
        render: (c) => (
          <div className="flex items-center gap-1 text-sm">
            <Package size={14} className="text-blue-600" />
            <span className="text-gray-600">{getAccountDisplay(c.inventoryValuationAccountId)}</span>
          </div>
        )
      },
      {
        header: t("created_at"),
        render: (c) => (
          <span className="text-sm text-gray-500">{formatDate(c.createdAt)}</span>
        )
      },
      {
        header: t("status"),
        render: (c) => getStatusBadge(c.status)
      },
      {
        header: t("actions"),
        className: "text-center",
        render: (c) => {
          const categoryId = extractId(c);
          return (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => handleEdit(c)}
                className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
                title={t("edit")}
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete(categoryId)}
                className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg border border-gray-200 transition-colors"
                title={t("delete")}
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        }
      }
    ],
    [t, handleEdit, handleDelete, extractId, getAccountDisplay]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("product_categories")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("manage_inventory_categories")}
          </p>
        </div>
        <div className="flex gap-3">
          {selectedIds.length > 0 && (
            <Button
              variant="danger"
              onClick={() => setIsBulkConfirmOpen(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 size={18} />
              {t("delete_selected")} ({selectedIds.length})
            </Button>
          )}
          <ExportDropdown data={filteredCategories} filename="categories" />
          <Button
            variant="primary"
            onClick={() => {
              setEditingCategory(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_category")}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Tag size={18} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("total_categories")}</p>
              <p className="text-xl font-bold text-gray-900">{totalCategories}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <Tag size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("active")}</p>
              <p className="text-xl font-bold text-green-600">{activeCategories}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <Tag size={18} className="text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("inactive")}</p>
              <p className="text-xl font-bold text-red-600">{inactiveCategories}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t("search_categories")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {(statusFilter || searchTerm) && (
          <button
            onClick={() => {
              setStatusFilter("");
              setSearchTerm("");
            }}
            className="text-sm text-red-600 hover:text-red-700"
          >
            {t("clear_filters")}
          </button>
        )}
      </div>

      {/* Table */}
      <Table
        data={filteredCategories}
        columns={columns}
        keyExtractor={(item) => extractId(item)}
        isLoading={isLoading}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />

      {/* Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        onSave={handleSave}
        categoryToEdit={editingCategory}
        accounts={accounts}
        isLoading={isLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t("delete_category")}
        message={t("are_you_sure_delete_category")}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationModal
        isOpen={isBulkConfirmOpen}
        onClose={() => setIsBulkConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title={t("delete_categories")}
        message={t("are_you_sure_delete_categories", { count: selectedIds.length })}
      />
    </div>
  );
};