import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Edit2, Trash2, Package, Building2, Filter, X, FileText, Calendar } from "lucide-react";
import { Card, Button, Input, Badge, ExportDropdown } from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { ReturnToSupplierModal } from "../../components/purchase/ReturnToSupplierModal";
import { useData } from "../../context/DataContext";
import { ReturnToSupplier } from "../../types";
import { toast } from "sonner";

export const ReturnsToSupplier: React.FC = () => {
  const { t } = useTranslation();
  const { returnsToSupplier, addReturnToSupplier, updateReturnToSupplier, deleteReturnToSupplier, suppliers } = useData();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReturn, setEditingReturn] = useState<ReturnToSupplier | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (returnData: Partial<ReturnToSupplier>) => {
    try {
      setIsLoading(true);
      if (editingReturn) {
        await updateReturnToSupplier({ ...returnData, id: editingReturn._id || editingReturn.id } as ReturnToSupplier);
        toast.success(t("return_updated_successfully"));
      } else {
        await addReturnToSupplier(returnData as ReturnToSupplier);
        toast.success(t("return_created_successfully"));
      }
      setIsModalOpen(false);
      setEditingReturn(null);
    } catch (error) {
      console.error("Error saving return:", error);
      toast.error(t("failed_to_save_return"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = useCallback((returnData: ReturnToSupplier) => {
    setEditingReturn(returnData);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      try {
        await deleteReturnToSupplier(deleteId);
        toast.success(t("return_deleted_successfully"));
        setDeleteId(null);
        setSelectedIds(prev => prev.filter(sid => sid !== deleteId));
      } catch (error) {
        toast.error(t("failed_to_delete_return"));
      }
    }
  }, [deleteId, deleteReturnToSupplier, t]);

  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      await Promise.all(selectedIds.map(id => deleteReturnToSupplier(id)));
      toast.success(t("returns_deleted_successfully", { count: selectedIds.length }));
      setSelectedIds([]);
      setIsBulkConfirmOpen(false);
    } catch (error) {
      console.error("Bulk delete failed", error);
      toast.error(t("failed_to_delete_returns"));
    } finally {
      setIsLoading(false);
    }
  };

  const getSupplierName = (returnData: ReturnToSupplier): string => {
    if (typeof returnData.supplierId === "object" && returnData.supplierId !== null) {
      return (returnData.supplierId as any)?.supplierName || "-";
    }
    const supplier = suppliers.find(s => (s._id || s.id) === returnData.supplierId);
    return supplier?.supplierName || "-";
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "warning" | "success" | "danger"; label: string }> = {
      PENDING: { variant: "warning", label: t("pending") },
      APPROVED: { variant: "success", label: t("approved") },
      REJECTED: { variant: "danger", label: t("rejected") },
    };
    const config = statusMap[status] || { variant: "info", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString();
  };

  // Apply filters
  const filteredReturns = useMemo(() => {
    return returnsToSupplier.filter(r => {
      const supplierName = getSupplierName(r).toLowerCase();
      const matchesSearch = 
        r.returnNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplierName.includes(searchTerm.toLowerCase());
      
      const matchesStatus = !statusFilter || r.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [returnsToSupplier, searchTerm, statusFilter]);

  // Statistics
  const totalReturns = filteredReturns.length;
  const pendingReturns = filteredReturns.filter(r => r.status === "PENDING").length;
  const approvedReturns = filteredReturns.filter(r => r.status === "APPROVED").length;
  const rejectedReturns = filteredReturns.filter(r => r.status === "REJECTED").length;
  const totalReturnQty = filteredReturns.reduce((sum, r) => 
    sum + (r.items?.reduce((itemSum, item) => itemSum + (item.returnQuantity || 0), 0) || 0), 0);

  const statusOptions = [
    { value: "", label: t("all_statuses") },
    { value: "PENDING", label: t("pending") },
    { value: "APPROVED", label: t("approved") },
    { value: "REJECTED", label: t("rejected") },
  ];

  const columns: Column<ReturnToSupplier>[] = useMemo(
    () => [
      {
        header: t("return_info"),
        render: (r) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
              <FileText size={18} className="text-indigo-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">{r.returnNumber}</span>
              <span className="text-xs text-gray-500">{formatDate(r.returnDate || r.createdAt)}</span>
            </div>
          </div>
        )
      },
      {
        header: t("supplier"),
        render: (r) => (
          <div className="flex items-center gap-1.5">
            <Building2 size={14} className="text-gray-400" />
            <span className="text-sm text-gray-600">{getSupplierName(r)}</span>
          </div>
        )
      },
      {
        header: t("items"),
        render: (r) => (
          <div className="flex flex-col gap-0.5">
            {r.items?.slice(0, 2).map((item, idx) => {
              const productName = typeof item.productId === "object" ? (item.productId as any)?.productName : item.sku;
              return (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <Package size={12} className="text-gray-400" />
                  <span className="text-gray-600">{productName}</span>
                  <span className="text-gray-400">x{item.returnQuantity}</span>
                </div>
              );
            })}
            {r.items && r.items.length > 2 && (
              <span className="text-xs text-gray-400">+{r.items.length - 2} more</span>
            )}
          </div>
        )
      },
      {
        header: t("total_qty"),
        render: (r) => {
          const total = r.items?.reduce((sum, item) => sum + (item.returnQuantity || 0), 0) || 0;
          return <span className="text-sm font-medium">{total}</span>;
        }
      },
      {
        header: t("status"),
        render: (r) => getStatusBadge(r.status)
      },
      {
        header: t("actions"),
        className: "text-center",
        render: (r) => (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleEdit(r)}
              className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
              title={t("edit")}
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => handleDelete(r._id || r.id)}
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
            {t("return_to_supplier")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("manage_your_returns")}
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
          <ExportDropdown data={filteredReturns} filename="returns-to-supplier" />
          <Button
            variant="primary"
            onClick={() => {
              setEditingReturn(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_return_to_supplier")}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-indigo-600" />
            <p className="text-xs text-gray-500">{t("total_returns")}</p>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">{totalReturns}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Package size={18} className="text-blue-600" />
            <p className="text-xs text-gray-500">{t("total_quantity")}</p>
          </div>
          <p className="text-xl font-bold text-blue-600 mt-1">{totalReturnQty}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-orange-600" />
            <p className="text-xs text-gray-500">{t("pending")}</p>
          </div>
          <p className="text-xl font-bold text-orange-600 mt-1">{pendingReturns}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} className="text-green-500" />
            <p className="text-xs text-gray-500">{t("approved")}</p>
          </div>
          <p className="text-xl font-bold text-green-600 mt-1">{approvedReturns}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <XCircle size={18} className="text-red-600" />
            <p className="text-xs text-gray-500">{t("rejected")}</p>
          </div>
          <p className="text-xl font-bold text-red-600 mt-1">{rejectedReturns}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t("search_returns")}
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
          data={filteredReturns}
          columns={columns}
          keyExtractor={(item) => item._id || item.id}
          isLoading={isLoading}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />

      {/* Modal */}
      <ReturnToSupplierModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingReturn(null);
        }}
        onSave={handleSave}
        returnToEdit={editingReturn}
        isLoading={isLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t("delete_return")}
        message={t("are_you_sure_delete_return")}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationModal
        isOpen={isBulkConfirmOpen}
        onClose={() => setIsBulkConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title={t("delete_returns")}
        message={t("are_you_sure_delete_returns", { count: selectedIds.length })}
      />
    </div>
  );
};

// Add missing imports
import { Clock, CheckCircle, XCircle } from "lucide-react";