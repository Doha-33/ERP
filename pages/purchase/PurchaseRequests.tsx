import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Edit2, Trash2, Package, Calendar, Building2, Users, Filter, X, FileText, DollarSign } from "lucide-react";
import { Card, Button, Input, Badge, ExportDropdown } from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { PurchaseRequestModal } from "../../components/purchase/PurchaseRequestModal";
import { useData } from "../../context/DataContext";
import { PurchaseRequest } from "../../types";
import { toast } from "sonner";

export const PurchaseRequests: React.FC = () => {
  const { t } = useTranslation();
  const { purchaseRequests, addPurchaseRequest, updatePurchaseRequest, deletePurchaseRequest } = useData();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<PurchaseRequest | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (request: Partial<PurchaseRequest>) => {
    try {
      setIsLoading(true);
      if (editingRequest) {
        await updatePurchaseRequest({ ...request, _id: editingRequest._id, id: editingRequest.id } as PurchaseRequest);
        toast.success(t("purchase_request_updated_successfully"));
      } else {
        await addPurchaseRequest(request as PurchaseRequest);
        toast.success(t("purchase_request_created_successfully"));
      }
      setIsModalOpen(false);
      setEditingRequest(null);
    } catch (error) {
      console.error("Error saving purchase request:", error);
      toast.error(t("failed_to_save_purchase_request"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = useCallback((request: PurchaseRequest) => {
    setEditingRequest(request);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      try {
        await deletePurchaseRequest(deleteId);
        toast.success(t("purchase_request_deleted_successfully"));
        setDeleteId(null);
        setSelectedIds(prev => prev.filter(sid => sid !== deleteId));
      } catch (error) {
        toast.error(t("failed_to_delete_purchase_request"));
      }
    }
  }, [deleteId, deletePurchaseRequest, t]);

  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      await Promise.all(selectedIds.map(id => deletePurchaseRequest(id)));
      toast.success(t("purchase_requests_deleted_successfully", { count: selectedIds.length }));
      setSelectedIds([]);
      setIsBulkConfirmOpen(false);
    } catch (error) {
      console.error("Bulk delete failed", error);
      toast.error(t("failed_to_delete_purchase_requests"));
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get requester name
  const getRequesterName = (request: PurchaseRequest): string => {
    if (!request.requestedBy) return "-";
    if (typeof request.requestedBy === 'object') {
      return (request.requestedBy as any)?.fullName || (request.requestedBy as any)?.username || "-";
    }
    return request.requestedBy || "-";
  };

  // Helper function to get company name
  const getCompanyName = (request: PurchaseRequest): string => {
    if (!request.companyId) return "-";
    if (typeof request.companyId === 'object') {
      return (request.companyId as any)?.name || "-";
    }
    return request.companyId || "-";
  };

  // Helper function to get branch name
  const getBranchName = (request: PurchaseRequest): string => {
    if (!request.branchId) return "-";
    if (typeof request.branchId === 'object') {
      return (request.branchId as any)?.name || "-";
    }
    return request.branchId || "-";
  };

  // Calculate total value of request
  const getTotalValue = (request: PurchaseRequest): number => {
    if (!request.items) return 0;
    return request.items.reduce((sum, item) => sum + (item.totalCost || item.requiredQuantity * item.estimatedUnitCost || 0), 0);
  };

  // Apply filters
  const filteredRequests = useMemo(() => {
    return purchaseRequests.filter(r => {
      const matchesSearch = 
        r.prNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.items?.some(item => item.itemName?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = !statusFilter || r.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [purchaseRequests, searchTerm, statusFilter]);

  // Statistics
  const totalRequests = filteredRequests.length;
  const pendingRequests = filteredRequests.filter(r => r.status === "PENDING").length;
  const approvedRequests = filteredRequests.filter(r => r.status === "APPROVED").length;
  const rejectedRequests = filteredRequests.filter(r => r.status === "REJECTED").length;
  const totalValue = filteredRequests.reduce((sum, r) => sum + getTotalValue(r), 0);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "warning" | "success" | "danger"; label: string }> = {
      PENDING: { variant: "warning", label: t("pending") },
      APPROVED: { variant: "success", label: t("approved") },
      REJECTED: { variant: "danger", label: t("rejected") },
    };
    const config = statusMap[status] || { variant: "info", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const statusOptions = [
    { value: "", label: t("all_statuses") },
    { value: "PENDING", label: t("pending") },
    { value: "APPROVED", label: t("approved") },
    { value: "REJECTED", label: t("rejected") },
  ];

  const columns: Column<PurchaseRequest>[] = useMemo(
    () => [
      {
        header: t("request_info"),
        render: (r) => (
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-indigo-500" />
              <span className="font-medium text-gray-900">{r.prNumber}</span>
            </div>
            <span className="text-xs text-gray-500 ml-6">
              {new Date(r.requestDate).toLocaleDateString()}
            </span>
          </div>
        )
      },
      {
        header: t("department_requester"),
        render: (r) => (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <Building2 size={14} className="text-gray-400" />
              <span className="text-sm text-gray-600">{r.department || "-"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={14} className="text-gray-400" />
              <span className="text-sm text-gray-500">{getRequesterName(r)}</span>
            </div>
          </div>
        )
      },
      {
        header: t("items"),
        render: (r) => (
          <div className="flex flex-col gap-0.5">
            {r.items?.slice(0, 2).map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <Package size={12} className="text-gray-400" />
                <span className="text-gray-600">{item.itemName}</span>
                <span className="text-gray-400">x{item.requiredQuantity}</span>
              </div>
            ))}
            {r.items && r.items.length > 2 && (
              <span className="text-xs text-gray-400">+{r.items.length - 2} more</span>
            )}
          </div>
        )
      },
      {
        header: t("total_value"),
        render: (r) => (
          <div className="flex items-center gap-1.5">
            <DollarSign size={14} className="text-green-600" />
            <span className="font-semibold text-green-600">{getTotalValue(r).toLocaleString()} EGP</span>
          </div>
        )
      },
      {
        header: t("company_branch"),
        render: (r) => (
          <div className="flex flex-col gap-1">
            <span className="text-sm text-gray-600">{getCompanyName(r)}</span>
            <span className="text-xs text-gray-500">{getBranchName(r)}</span>
          </div>
        )
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
            {t("purchase_request")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("manage_your_purchase_request")}
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
          <ExportDropdown data={filteredRequests} filename="purchase-requests" />
          <Button
            variant="primary"
            onClick={() => {
              setEditingRequest(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_purchase_request")}
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
            <p className="text-xs text-gray-500">{t("total_value")}</p>
          </div>
          <p className="text-xl font-bold text-green-600 mt-1">{totalValue.toLocaleString()} EGP</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-orange-600" />
            <p className="text-xs text-gray-500">{t("pending")}</p>
          </div>
          <p className="text-xl font-bold text-orange-600 mt-1">{pendingRequests}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} className="text-green-500" />
            <p className="text-xs text-gray-500">{t("approved")}</p>
          </div>
          <p className="text-xl font-bold text-green-600 mt-1">{approvedRequests}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <XCircle size={18} className="text-red-600" />
            <p className="text-xs text-gray-500">{t("rejected")}</p>
          </div>
          <p className="text-xl font-bold text-red-600 mt-1">{rejectedRequests}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t("search_purchase_requests")}
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
          data={filteredRequests}
          columns={columns}
          keyExtractor={(item) => item._id || item.id}
          isLoading={isLoading}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />

      {/* Modal */}
      <PurchaseRequestModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRequest(null);
        }}
        onSave={handleSave}
        requestToEdit={editingRequest}
        isLoading={isLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t("delete_purchase_request")}
        message={t("are_you_sure_delete_purchase_request")}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationModal
        isOpen={isBulkConfirmOpen}
        onClose={() => setIsBulkConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title={t("delete_purchase_requests")}
        message={t("are_you_sure_delete_purchase_requests", { count: selectedIds.length })}
      />
    </div>
  );
};

// Add missing imports
import { Clock, CheckCircle, XCircle } from "lucide-react";