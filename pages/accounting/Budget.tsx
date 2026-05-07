import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Edit2,
  Trash2,
  DollarSign,
  CreditCard,
  Building2,
  Search,
  Filter,
  X,
  TrendingUp,
  Wallet,
  Calendar,
} from "lucide-react";
import {
  Card,
  Button,
  Input,
  Select,
  Badge,
  ExportDropdown,
} from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { BudgetModal } from "../../components/accounting/BudgetModal";
import { useData } from "../../context/DataContext";
import { Budget as BudgetType } from "../../types";
import { toast } from "sonner";

export const Budget: React.FC = () => {
  const { t } = useTranslation();
  const { budgets, accountingLoading, addBudget, updateBudget, deleteBudget } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetType | null>(null);
  const [budgetIdToDelete, setBudgetIdToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (budget: Partial<BudgetType>) => {
    try {
      setIsLoading(true);
      if (editingBudget) {
        await updateBudget(editingBudget._id || editingBudget.id, budget);
        toast.success(t("budget_updated_successfully"));
      } else {
        await addBudget(budget);
        toast.success(t("budget_created_successfully"));
      }
      setIsModalOpen(false);
      setEditingBudget(null);
    } catch (error) {
      console.error("Error saving budget:", error);
      toast.error(t("failed_to_save_budget"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = useCallback((budget: BudgetType) => {
    setEditingBudget(budget);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setBudgetIdToDelete(id);
    setIsDeleteModalOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (budgetIdToDelete) {
      try {
        await deleteBudget(budgetIdToDelete);
        toast.success(t("budget_deleted_successfully"));
        setBudgetIdToDelete(null);
        setIsDeleteModalOpen(false);
        setSelectedIds(prev => prev.filter(sid => sid !== budgetIdToDelete));
      } catch (error) {
        console.error("Error deleting budget:", error);
        toast.error(t("failed_to_delete_budget"));
      }
    }
  }, [budgetIdToDelete, deleteBudget, t]);

  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      await Promise.all(selectedIds.map(id => deleteBudget(id)));
      toast.success(t("budgets_deleted_successfully", { count: selectedIds.length }));
      setSelectedIds([]);
      setIsBulkConfirmOpen(false);
    } catch (error) {
      console.error("Bulk delete failed", error);
      toast.error(t("failed_to_delete_budgets"));
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "success" | "danger" | "warning" | "info"; label: string }> = {
      OPEN: { variant: "success", label: t("open") },
      CLOSED: { variant: "danger", label: t("closed") },
      FROZEN: { variant: "warning", label: t("frozen") },
    };
    const config = statusMap[status] || { variant: "info", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization > 90) return "text-red-600";
    if (utilization > 75) return "text-yellow-600";
    return "text-green-600";
  };

  // Apply filters
  const filteredBudgets = useMemo(() => {
    return budgets.filter(b => {
      const matchesSearch = 
        b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.departmentName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesYear = !yearFilter || b.fiscalYear === parseInt(yearFilter);
      const matchesStatus = !statusFilter || b.status === statusFilter;
      
      return matchesSearch && matchesYear && matchesStatus;
    });
  }, [budgets, searchTerm, yearFilter, statusFilter]);

  // Statistics
  const totalAllocated = filteredBudgets.reduce((sum, b) => sum + (b.allocatedAmount || 0), 0);
  const totalSpent = filteredBudgets.reduce((sum, b) => sum + (b.spentAmount || 0), 0);
  const totalVariance = totalAllocated - totalSpent;
  const openBudgets = filteredBudgets.filter(b => b.status === "OPEN").length;
  const avgUtilization = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

  const yearOptions = [
    { value: "", label: t("all_years") },
    { value: "2023", label: "2023" },
    { value: "2024", label: "2024" },
    { value: "2025", label: "2025" },
    { value: "2026", label: "2026" },
    { value: "2027", label: "2027" },
    { value: "2028", label: "2028" },
  ];

  const statusOptions = [
    { value: "", label: t("all_statuses") },
    { value: "OPEN", label: t("open") },
    { value: "CLOSED", label: t("closed") },
    { value: "FROZEN", label: t("frozen") },
  ];

  const columns: Column<BudgetType>[] = useMemo(
    () => [
      {
        header: t("budget_info"),
        render: (b) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Wallet size={18} className="text-indigo-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">{b.name}</span>
              <span className="text-xs text-gray-500">{b.departmentName}</span>
            </div>
          </div>
        )
      },
      {
        header: t("fiscal_year"),
        render: (b) => (
          <div className="flex items-center gap-1.5">
            <Calendar size={14} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-700">{b.fiscalYear}</span>
          </div>
        )
      },
      {
        header: t("allocated"),
        render: (b) => (
          <div className="flex items-center gap-1.5">
            <DollarSign size={14} className="text-blue-600" />
            <span className="text-sm font-medium text-blue-600">{b.allocatedAmount?.toLocaleString()} EGP</span>
          </div>
        )
      },
      {
        header: t("spent"),
        render: (b) => (
          <div className="flex items-center gap-1.5">
            <CreditCard size={14} className="text-orange-600" />
            <span className="text-sm text-orange-600">{b.spentAmount?.toLocaleString()} EGP</span>
          </div>
        )
      },
      {
        header: t("variance"),
        render: (b) => {
          const variance = (b.allocatedAmount || 0) - (b.spentAmount || 0);
          return (
            <div className="flex items-center gap-1.5">
              <TrendingUp size={14} className="text-green-600" />
              <span className="text-sm font-semibold text-green-600">{variance.toLocaleString()} EGP</span>
            </div>
          );
        }
      },
      {
        header: t("utilization"),
        render: (b) => {
          const utilization = b.allocatedAmount > 0 ? (b.spentAmount / b.allocatedAmount) * 100 : 0;
          return (
            <div className="flex flex-col gap-1 min-w-[120px]">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium ${getUtilizationColor(utilization)}`}>
                  {utilization.toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    utilization > 90 ? "bg-red-500" : utilization > 75 ? "bg-yellow-500" : "bg-green-500"
                  }`}
                  style={{ width: `${Math.min(utilization, 100)}%` }}
                />
              </div>
            </div>
          );
        }
      },
      {
        header: t("status"),
        render: (b) => getStatusBadge(b.status)
      },
      {
        header: t("actions"),
        className: "text-center",
        render: (b) => (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleEdit(b)}
              className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
              title={t("edit")}
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => handleDelete(b._id || b.id)}
              className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg border border-gray-200 transition-colors"
              title={t("delete")}
            >
              <Trash2 size={16} />
            </button>
          </div>
        )
      }
    ],
    [t, handleEdit, handleDelete]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("budget")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("manage_your_budgets")}
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
          <ExportDropdown data={filteredBudgets} filename="budgets" />
          <Button
            variant="primary"
            onClick={() => {
              setEditingBudget(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_budget")}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <DollarSign size={18} className="text-blue-600" />
            <p className="text-xs text-gray-500">{t("total_allocated")}</p>
          </div>
          <p className="text-xl font-bold text-blue-600 mt-1">{totalAllocated.toLocaleString()} EGP</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <CreditCard size={18} className="text-orange-600" />
            <p className="text-xs text-gray-500">{t("total_spent")}</p>
          </div>
          <p className="text-xl font-bold text-orange-600 mt-1">{totalSpent.toLocaleString()} EGP</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-green-600" />
            <p className="text-xs text-gray-500">{t("total_variance")}</p>
          </div>
          <p className="text-xl font-bold text-green-600 mt-1">{totalVariance.toLocaleString()} EGP</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Building2 size={18} className="text-purple-600" />
            <p className="text-xs text-gray-500">{t("open_budgets")}</p>
          </div>
          <p className="text-xl font-bold text-purple-600 mt-1">{openBudgets}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-indigo-600" />
            <p className="text-xs text-gray-500">{t("avg_utilization")}</p>
          </div>
          <p className="text-xl font-bold text-indigo-600 mt-1">{avgUtilization.toFixed(1)}%</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t("search_budgets")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {yearOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

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

        {(yearFilter || statusFilter || searchTerm) && (
          <button
            onClick={() => {
              setYearFilter("");
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
          data={filteredBudgets}
          columns={columns}
          keyExtractor={(item) => item._id || item.id}
          isLoading={accountingLoading || isLoading}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />

      {/* Modal */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBudget(null);
        }}
        onSave={handleSave}
        budgetToEdit={editingBudget}
        isLoading={accountingLoading || isLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title={t("delete_budget")}
        message={t("are_you_sure_delete_budget")}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationModal
        isOpen={isBulkConfirmOpen}
        onClose={() => setIsBulkConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title={t("delete_budgets")}
        message={t("are_you_sure_delete_budgets", { count: selectedIds.length })}
      />
    </div>
  );
};