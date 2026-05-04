import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Edit2, Trash2, Calendar, AlertCircle, Filter, X, History, DollarSign } from "lucide-react";
import { Card, Button, Input, Badge, ExportDropdown } from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { ResponsesHistoryModal } from "../../components/hr/ResponsesHistoryModal";
import { PenaltyModal } from "../../components/hr/PenaltyModal";
import { useData } from "../../context/DataContext";
import { Penalty } from "../../types";
import { toast } from "sonner";

export const Penalties: React.FC = () => {
  const { t } = useTranslation();
  const { penalties, addPenalty, updatePenalty, deletePenalty, actionHistory, fetchActionHistory } = useData();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPenalty, setEditingPenalty] = useState<Penalty | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (penalty: Partial<Penalty>) => {
    try {
      setIsLoading(true);
      if (editingPenalty) {
        await updatePenalty({ ...penalty, _id: editingPenalty._id, id: editingPenalty.id } as Penalty);
        toast.success(t("penalty_updated_successfully"));
      } else {
        await addPenalty(penalty as Penalty);
        toast.success(t("penalty_created_successfully"));
      }
      setIsModalOpen(false);
      setEditingPenalty(null);
    } catch (error) {
      console.error("Error saving penalty:", error);
      toast.error(t("failed_to_save_penalty"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = useCallback((penalty: Penalty) => {
    setEditingPenalty(penalty);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      try {
        await deletePenalty(deleteId);
        toast.success(t("penalty_deleted_successfully"));
        setDeleteId(null);
        setSelectedIds(prev => prev.filter(sid => sid !== deleteId));
      } catch (error) {
        toast.error(t("failed_to_delete_penalty"));
      }
    }
  }, [deleteId, deletePenalty, t]);

  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      await Promise.all(selectedIds.map(id => deletePenalty(id)));
      toast.success(t("penalties_deleted_successfully", { count: selectedIds.length }));
      setSelectedIds([]);
      setIsBulkConfirmOpen(false);
    } catch (error) {
      console.error("Bulk delete failed", error);
      toast.error(t("failed_to_delete_penalties"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowHistory = async (id: string) => {
    await fetchActionHistory();
    const filteredHistory = actionHistory.filter(h => h.requestId === id);
    setSelectedHistory(filteredHistory);
    setIsHistoryOpen(true);
  };

  // Helper functions
  const getEmployeeName = (penalty: Penalty): string => {
    if (typeof penalty.employeeInfo === "object" && penalty.employeeInfo !== null) {
      return (penalty.employeeInfo as any)?.fullName || "-";
    }
    return penalty.employeeName || "-";
  };

  const getEmployeeCode = (penalty: Penalty): string => {
    if (typeof penalty.employeeInfo === "object" && penalty.employeeInfo !== null) {
      return (penalty.employeeInfo as any)?.employeeCode || "-";
    }
    return "-";
  };

  // Apply filters
  const filteredPenalties = useMemo(() => {
    return penalties.filter(p => {
      const employeeName = getEmployeeName(p).toLowerCase();
      const matchesSearch = employeeName.includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || p.status === statusFilter;
      
      const penaltyDate = new Date(p.date);
      const matchesDateFrom = !dateFrom || penaltyDate >= new Date(dateFrom);
      const matchesDateTo = !dateTo || penaltyDate <= new Date(dateTo);
      
      return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
    });
  }, [penalties, searchTerm, statusFilter, dateFrom, dateTo]);

  // Statistics
  const totalPenalties = filteredPenalties.length;
  const totalAmount = filteredPenalties.reduce((sum, p) => sum + (p.penaltyAmount || 0), 0);
  const pendingCount = filteredPenalties.filter(p => p.status === "Pending").length;
  const approvedCount = filteredPenalties.filter(p => p.status === "Approved").length;
  const rejectedCount = filteredPenalties.filter(p => p.status === "Rejected").length;

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "warning" | "success" | "danger"; label: string }> = {
      Pending: { variant: "warning", label: t("pending") },
      Approved: { variant: "success", label: t("approved") },
      Rejected: { variant: "danger", label: t("rejected") },
    };
    const config = statusMap[status] || { variant: "info", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString();
  };

  const statusOptions = [
    { value: "", label: t("all_statuses") },
    { value: "Pending", label: t("pending") },
    { value: "Approved", label: t("approved") },
    { value: "Rejected", label: t("rejected") },
  ];

  const columns: Column<Penalty>[] = useMemo(
    () => [
      {
        header: t("employee"),
        render: (p) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle size={18} className="text-red-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">{getEmployeeName(p)}</span>
              <span className="text-xs text-gray-500">{getEmployeeCode(p)}</span>
            </div>
          </div>
        )
      },
      {
        header: t("penalty_info"),
        render: (p) => (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-gray-700">{p.penaltyType}</span>
            <span className="text-xs text-gray-500">{formatDate(p.date)}</span>
          </div>
        )
      },
      {
        header: t("amount"),
        render: (p) => (
          <div className="flex items-center gap-1.5">
            <DollarSign size={14} className="text-red-600" />
            <span className="text-sm font-bold text-red-600">{p.penaltyAmount?.toLocaleString()} EGP</span>
          </div>
        )
      },
      {
        header: t("reason"),
        render: (p) => (
          <span className="text-sm text-gray-500 line-clamp-1">{p.reason || "-"}</span>
        )
      },
      {
        header: t("status"),
        render: (p) => getStatusBadge(p.status)
      },
      {
        header: t("actions"),
        className: "text-center",
        render: (p) => (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleShowHistory(p._id || p.id)}
              className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
              title={t("history")}
            >
              <History size={16} />
            </button>
            <button
              onClick={() => handleEdit(p)}
              className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
              title={t("edit")}
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => handleDelete(p._id || p.id)}
              className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg border border-gray-200 transition-colors"
              title={t("delete")}
            >
              <Trash2 size={16} />
            </button>
          </div>
        )
      }
    ],
    [t, handleEdit, handleDelete, handleShowHistory]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("penalties")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("manage_penalties")}
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
          <ExportDropdown data={filteredPenalties} filename="penalties" />
          <Button
            variant="primary"
            onClick={() => {
              setEditingPenalty(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_penalty")}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-red-600" />
            <p className="text-xs text-gray-500">{t("total_penalties")}</p>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">{totalPenalties}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <DollarSign size={18} className="text-red-600" />
            <p className="text-xs text-gray-500">{t("total_amount")}</p>
          </div>
          <p className="text-xl font-bold text-red-600 mt-1">{totalAmount.toLocaleString()} EGP</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-orange-600" />
            <p className="text-xs text-gray-500">{t("pending")}</p>
          </div>
          <p className="text-xl font-bold text-orange-600 mt-1">{pendingCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} className="text-green-500" />
            <p className="text-xs text-gray-500">{t("approved")}</p>
          </div>
          <p className="text-xl font-bold text-green-600 mt-1">{approvedCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <XCircle size={18} className="text-red-600" />
            <p className="text-xs text-gray-500">{t("rejected")}</p>
          </div>
          <p className="text-xl font-bold text-red-600 mt-1">{rejectedCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t("search_by_employee")}
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
              setDateFrom("");
              setDateTo("");
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
          data={filteredPenalties}
          columns={columns}
          keyExtractor={(item) => item._id || item.id}
          isLoading={isLoading}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />

      {/* Modals */}
      <PenaltyModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPenalty(null);
        }}
        onSave={handleSave}
        penaltyToEdit={editingPenalty}
        isLoading={isLoading}
      />

      <ResponsesHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={selectedHistory}
      />

      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t("delete_penalty")}
        message={t("are_you_sure_delete_penalty")}
      />

      <ConfirmationModal
        isOpen={isBulkConfirmOpen}
        onClose={() => setIsBulkConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title={t("delete_penalties")}
        message={t("are_you_sure_delete_penalties", { count: selectedIds.length })}
      />
    </div>
  );
};

// Add missing imports
import { Clock, CheckCircle, XCircle } from "lucide-react";