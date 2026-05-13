import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Edit2, Trash2, Calendar, FileText, Filter, X, UserMinus, CheckCircle2, XCircle, History, DollarSign, Clock } from "lucide-react";
import { Card, Button, Input, Badge, ExportDropdown } from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { EndOfServiceModal } from "../../components/hr/EndOfServiceModal";
import { ResponseRejectModal } from "../../components/hr/ResponseRejectModal";
import { ResponsesHistoryModal } from "../../components/hr/ResponsesHistoryModal";
import { useData } from "../../context/DataContext";
import { EndOfService } from "../../types";
import { toast } from "sonner";

export const EndOfServicePage: React.FC = () => {
  const { t } = useTranslation();
  const { 
    endOfServices, 
    addEndOfService, 
    updateEndOfService, 
    deleteEndOfService, 
    approveEndOfService, 
    rejectEndOfService,
    actionHistory,
    fetchActionHistory,
    fetchEndOfServices
  } = useData();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEos, setEditingEos] = useState<EndOfService | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to extract ID
  const extractId = useCallback((value: any): string => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      if (value._id && typeof value._id === "string") return value._id;
      if (value.id && typeof value.id === "string") return value.id;
    }
    return "";
  }, []);

  const handleSave = async (eosData: Partial<EndOfService>) => {
    try {
      setIsLoading(true);
      
      if (editingEos) {
        const eosId = extractId(editingEos);
        
        if (!eosId) {
          toast.error(t("end_of_service_id_missing"));
          return;
        }
        
        const updateData = {
          ...eosData,
          _id: eosId,
          id: eosId
        } as EndOfService;
        
        console.log("Updating end of service with ID:", eosId, updateData);
        await updateEndOfService(updateData);
        toast.success(t("end_of_service_updated_successfully"));
      } else {
        await addEndOfService(eosData as EndOfService);
        toast.success(t("end_of_service_created_successfully"));
      }
      
      await fetchEndOfServices();
      setIsModalOpen(false);
      setEditingEos(null);
    } catch (error: any) {
      console.error("Error saving end of service:", error);
      const message = error?.response?.data?.message || error?.message || t("failed_to_save_end_of_service");
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = useCallback((eos: EndOfService) => {
    const eosId = extractId(eos);
    
    if (!eosId) {
      console.error("End of service ID not found", eos);
      toast.error(t("end_of_service_id_not_found"));
      return;
    }
    
    const eosToEdit: EndOfService = {
      ...eos,
      _id: eosId,
      id: eosId,
    };
    
    console.log("Editing end of service:", eosToEdit);
    setEditingEos(eosToEdit);
    setIsModalOpen(true);
  }, [extractId, t]);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      try {
        await deleteEndOfService(deleteId);
        toast.success(t("end_of_service_deleted_successfully"));
        setDeleteId(null);
        setSelectedIds(prev => prev.filter(sid => sid !== deleteId));
        await fetchEndOfServices();
      } catch (error) {
        toast.error(t("failed_to_delete_end_of_service"));
      }
    }
  }, [deleteId, deleteEndOfService, fetchEndOfServices, t]);

  const handleApprove = useCallback(async (id: string) => {
    try {
      await approveEndOfService(id);
      toast.success(t("end_of_service_approved_successfully"));
      await fetchEndOfServices();
    } catch (error) {
      toast.error(t("failed_to_approve_end_of_service"));
    }
  }, [approveEndOfService, fetchEndOfServices, t]);

  const handleReject = useCallback((id: string) => {
    setRejectId(id);
  }, []);

  const handleRejectConfirm = useCallback(async (reason: string) => {
    if (rejectId) {
      try {
        await rejectEndOfService(rejectId, reason);
        toast.success(t("end_of_service_rejected_successfully"));
        setRejectId(null);
        await fetchEndOfServices();
      } catch (error) {
        toast.error(t("failed_to_reject_end_of_service"));
      }
    }
  }, [rejectId, rejectEndOfService, fetchEndOfServices, t]);

  const handleShowHistory = async (id: string) => {
    await fetchActionHistory();
    const filteredHistory = actionHistory.filter(h => extractId(h.requestId) === id);
    setSelectedHistory(filteredHistory);
    setIsHistoryOpen(true);
  };

  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      const validIds = selectedIds.filter(id => id && typeof id === 'string');
      if (validIds.length === 0) {
        toast.error(t("no_valid_ids_selected"));
        return;
      }
      await Promise.all(validIds.map(id => deleteEndOfService(id)));
      toast.success(t("end_of_services_deleted_successfully", { count: validIds.length }));
      setSelectedIds([]);
      setIsBulkConfirmOpen(false);
      await fetchEndOfServices();
    } catch (error) {
      console.error("Bulk delete failed", error);
      toast.error(t("failed_to_delete_end_of_services"));
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions
  const getEmployeeName = (eos: EndOfService): string => {
    if (typeof eos.employeeId === "object" && eos.employeeId !== null) {
      return (eos.employeeId as any)?.fullName || "-";
    }
    if (typeof eos.employeeInfo === "object" && eos.employeeInfo !== null) {
      return (eos.employeeInfo as any)?.fullName || "-";
    }
    return eos.employeeName || "-";
  };

  const getEmployeeCode = (eos: EndOfService): string => {
    if (typeof eos.employeeId === "object" && eos.employeeId !== null) {
      return (eos.employeeId as any)?.employeeCode || "-";
    }
    if (typeof eos.employeeInfo === "object" && eos.employeeInfo !== null) {
      return (eos.employeeInfo as any)?.employeeCode || "-";
    }
    return eos.empCode || "-";
  };

  // Apply filters
  const filteredEos = useMemo(() => {
    return endOfServices.filter(e => {
      const employeeName = getEmployeeName(e).toLowerCase();
      const matchesSearch = employeeName.includes(searchTerm.toLowerCase());
      
      const matchesStatus = !statusFilter || e.status === statusFilter;
      
      const recordDate = new Date(e.lastWorkingDay);
      const matchesDateFrom = !dateFrom || recordDate >= new Date(dateFrom);
      const matchesDateTo = !dateTo || recordDate <= new Date(dateTo);
      
      return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
    });
  }, [endOfServices, searchTerm, statusFilter, dateFrom, dateTo]);

  // Statistics
  const totalRequests = filteredEos.length;
  const pendingCount = filteredEos.filter(e => e.status === "Pending").length;
  const approvedCount = filteredEos.filter(e => e.status === "Approved").length;
  const rejectedCount = filteredEos.filter(e => e.status === "Rejected").length;
  const totalBenefits = filteredEos.reduce((sum, e) => sum + (e.endOfServiceBenefits || 0), 0);

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
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return "-";
    }
  };

  const statusOptions = [
    { value: "", label: t("all_statuses") },
    { value: "Pending", label: t("pending") },
    { value: "Approved", label: t("approved") },
    { value: "Rejected", label: t("rejected") },
  ];

  const columns: Column<EndOfService>[] = useMemo(
    () => [
      {
        header: t("employee"),
        render: (e) => {
          const employeeName = getEmployeeName(e);
          const employeeCode = getEmployeeCode(e);
          const initial = employeeName.charAt(0).toUpperCase();
          return (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <UserMinus size={18} className="text-indigo-600" />
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">{employeeName}</span>
                <span className="text-xs text-gray-500">{employeeCode}</span>
              </div>
            </div>
          );
        }
      },
      {
        header: t("last_working_day"),
        render: (e) => (
          <div className="flex items-center gap-1.5">
            <Calendar size={14} className="text-gray-400" />
            <span className="text-sm text-gray-600">{formatDate(e.lastWorkingDay)}</span>
          </div>
        )
      },
      {
        header: t("eos_type"),
        render: (e) => (
          <span className="text-sm text-gray-600">{e.eosType || e.reasonForLeaving || "-"}</span>
        )
      },
      {
        header: t("reason"),
        render: (e) => (
          <span className="text-sm text-gray-600">{e.reason || "-"}</span>
        )
      },
      {
        header: t("benefits"),
        render: (e) => (
          <div className="flex items-center gap-1.5">
            <DollarSign size={14} className="text-green-600" />
            <span className="text-sm font-semibold text-green-600">{e.endOfServiceBenefits?.toLocaleString()} EGP</span>
          </div>
        )
      },
      {
        header: t("status"),
        render: (e) => getStatusBadge(e.status)
      },
      {
        header: t("actions"),
        className: "text-center",
        render: (e) => {
          const eosId = extractId(e);
          return (
            <div className="flex items-center justify-center gap-2">
              {e.status === "Pending" && (
                <>
                  <button
                    onClick={() => handleApprove(eosId)}
                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg border border-green-200 transition-colors"
                    title={t("approve")}
                  >
                    <CheckCircle2 size={16} />
                  </button>
                  <button
                    onClick={() => handleReject(eosId)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
                    title={t("reject")}
                  >
                    <XCircle size={16} />
                  </button>
                </>
              )}
              <button
                onClick={() => handleShowHistory(eosId)}
                className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
                title={t("history")}
              >
                <History size={16} />
              </button>
              <button
                onClick={() => handleEdit(e)}
                className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
                title={t("edit")}
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete(eosId)}
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
    [t, handleEdit, handleDelete, handleApprove, handleReject, handleShowHistory, extractId]
  );

  const getKeyExtractor = useCallback((item: EndOfService) => {
    const id = extractId(item);
    return id || Math.random().toString();
  }, [extractId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("end_of_service")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("manage_end_of_service")}
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
          <ExportDropdown data={filteredEos} filename="end-of-service" />
          <Button
            variant="primary"
            onClick={() => {
              setEditingEos(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_end_of_service")}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-indigo-600" />
            <p className="text-xs text-gray-500">{t("total_requests")}</p>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">{totalRequests}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <DollarSign size={18} className="text-green-600" />
            <p className="text-xs text-gray-500">{t("total_benefits")}</p>
          </div>
          <p className="text-xl font-bold text-green-600 mt-1">{totalBenefits.toLocaleString()} EGP</p>
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
            <CheckCircle2 size={18} className="text-green-500" />
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
        data={filteredEos}
        columns={columns}
        keyExtractor={getKeyExtractor}
        isLoading={isLoading}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />

      {/* Modal */}
      <EndOfServiceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEos(null);
        }}
        onSave={handleSave}
        eosToEdit={editingEos}
        isLoading={isLoading}
      />

      {/* Reject Modal */}
      <ResponseRejectModal
        isOpen={!!rejectId}
        onClose={() => setRejectId(null)}
        onSave={handleRejectConfirm}
      />

      {/* History Modal */}
      <ResponsesHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={selectedHistory}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t("delete_end_of_service")}
        message={t("are_you_sure_delete_end_of_service")}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationModal
        isOpen={isBulkConfirmOpen}
        onClose={() => setIsBulkConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title={t("delete_end_of_services")}
        message={t("are_you_sure_delete_end_of_services", { count: selectedIds.length })}
      />
    </div>
  );
};