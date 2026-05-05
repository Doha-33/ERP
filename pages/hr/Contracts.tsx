import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Edit2, Trash2, FileText, Calendar, DollarSign, Building2, Filter, X, ChevronDown, Briefcase, Clock, CheckCircle, XCircle } from "lucide-react";
import { Card, Button, Input, Badge, ExportDropdown } from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { ContractModal } from "../../components/hr/ContractModal";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import { Contract } from "../../types";
import { toast } from "sonner";

export const Contracts: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { contracts, branches, employees, addContract, updateContract, deleteContract, currentUserEmployee } = useData();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isAdmin = user?.role === "admin";

  const handleSave = async (contract: Partial<Contract>) => {
    try {
      setIsLoading(true);
      if (editingContract) {
        await updateContract({ ...contract, _id: editingContract._id, id: editingContract.id } as Contract);
        toast.success(t("contract_updated_successfully"));
      } else {
        await addContract(contract as Contract);
        toast.success(t("contract_created_successfully"));
      }
      setIsModalOpen(false);
      setEditingContract(null);
    } catch (error) {
      console.error("Error saving contract:", error);
      toast.error(t("failed_to_save_contract"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = useCallback((contract: Contract) => {
    setEditingContract(contract);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      try {
        await deleteContract(deleteId);
        toast.success(t("contract_deleted_successfully"));
        setDeleteId(null);
        setSelectedIds(prev => prev.filter(sid => sid !== deleteId));
      } catch (error) {
        toast.error(t("failed_to_delete_contract"));
      }
    }
  }, [deleteId, deleteContract, t]);

  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      await Promise.all(selectedIds.map(id => deleteContract(id)));
      toast.success(t("contracts_deleted_successfully", { count: selectedIds.length }));
      setSelectedIds([]);
      setIsBulkConfirmOpen(false);
    } catch (error) {
      console.error("Bulk delete failed", error);
      toast.error(t("failed_to_delete_contracts"));
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions
  const getEmployeeName = (contract: Contract): string => {
    if (typeof contract.employeeInfo === "object" && contract.employeeInfo !== null) {
      return (contract.employeeInfo as any)?.fullName || "-";
    }
    const employee = employees.find(e => (e._id || e.id) === contract.employeeId);
    return employee?.fullName || contract.employeeName || "-";
  };

  const getEmployeeCode = (contract: Contract): string => {
    if (typeof contract.employeeInfo === "object" && contract.employeeInfo !== null) {
      return (contract.employeeInfo as any)?.employeeCode || "-";
    }
    const employee = employees.find(e => (e._id || e.id) === contract.employeeId);
    return employee?.employeeCode || "-";
  };

  const getBranchName = (contract: Contract): string => {
    if (typeof contract.branch === "object" && contract.branch !== null) {
      return (contract.branch as any)?.name || "-";
    }
    const branch = branches.find(b => (b._id || b.id) === contract.branch);
    return branch?.name || contract.branch || "-";
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "success" | "warning" | "danger" | "info"; label: string }> = {
      Active: { variant: "success", label: t("active") },
      Expired: { variant: "danger", label: t("expired") },
      "Under Renewal": { variant: "warning", label: t("under_renewal") },
      "Renewal Pending": { variant: "info", label: t("renewal_pending") },
    };
    const config = statusMap[status] || { variant: "info", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString();
  };

  const isExpiringSoon = (endDateStr: string) => {
    if (!endDateStr) return false;
    const endDate = new Date(endDateStr);
    const today = new Date();
    const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 && daysLeft <= 30;
  };

  // Apply filters
  const accessibleContracts = useMemo(() => {
    if (isAdmin) return contracts;
    const currentId = currentUserEmployee?._id || currentUserEmployee?.id;
    return contracts.filter(c => {
      const empId = typeof c.employeeInfo === "object" ? (c.employeeInfo as any)._id : c.employeeId;
      return empId === currentId;
    });
  }, [isAdmin, contracts, currentUserEmployee]);

  const filteredContracts = useMemo(() => {
    return accessibleContracts.filter(c => {
      const employeeName = getEmployeeName(c).toLowerCase();
      const matchesSearch = 
        employeeName.includes(searchTerm.toLowerCase()) ||
        c.contractId?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesBranch = !branchFilter || getBranchName(c) === branchFilter;
      const matchesStatus = !statusFilter || c.state === statusFilter;
      
      return matchesSearch && matchesBranch && matchesStatus;
    });
  }, [accessibleContracts, searchTerm, branchFilter, statusFilter]);

  // Statistics
  const totalContracts = filteredContracts.length;
  const activeContracts = filteredContracts.filter(c => c.state === "Active").length;
  const expiredContracts = filteredContracts.filter(c => c.state === "Expired").length;
  const totalSalary = filteredContracts.reduce((sum, c) => sum + (c.basicSalary + c.allowances), 0);
  const expiringSoon = filteredContracts.filter(c => isExpiringSoon(c.endDate)).length;

  const branchOptions = [
    { value: "", label: t("all_branches") },
    ...branches.map(b => ({ 
      value: b.name, 
      label: b.name 
    }))
  ];

  const statusOptions = [
    { value: "", label: t("all_statuses") },
    { value: "Active", label: t("active") },
    { value: "Expired", label: t("expired") },
    { value: "Under Renewal", label: t("under_renewal") },
    { value: "Renewal Pending", label: t("renewal_pending") },
  ];

  const columns: Column<Contract>[] = useMemo(
    () => [
      {
        header: t("contract_info"),
        render: (c) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
              <FileText size={18} className="text-indigo-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">{c.contractId}</span>
              <span className="text-xs text-gray-500">{c.contractType}</span>
            </div>
          </div>
        )
      },
      {
        header: t("employee"),
        render: (c) => (
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{getEmployeeName(c)}</span>
            <span className="text-xs text-gray-500">{getEmployeeCode(c)}</span>
          </div>
        )
      },
      {
        header: t("job_branch"),
        render: (c) => (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <Briefcase size={14} className="text-gray-400" />
              <span className="text-sm text-gray-600">{c.jobTitle}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Building2 size={14} className="text-gray-400" />
              <span className="text-sm text-gray-500">{getBranchName(c)}</span>
            </div>
          </div>
        )
      },
      {
        header: t("period"),
        render: (c) => {
          const expiring = isExpiringSoon(c.endDate);
          return (
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <Calendar size={12} className="text-gray-400" />
                <span className="text-xs text-gray-600">{formatDate(c.startDate)} → {formatDate(c.endDate)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={12} className="text-gray-400" />
                <span className={`text-xs ${expiring ? "text-orange-600 font-medium" : "text-gray-500"}`}>
                  {c.duration}
                </span>
              </div>
            </div>
          );
        }
      },
      {
        header: t("salary"),
        render: (c) => (
          <div className="flex flex-col">
            <span className="text-sm font-bold text-green-600">{c.basicSalary.toLocaleString()} EGP</span>
            <span className="text-xs text-gray-500">{t("allowances")}: {c.allowances.toLocaleString()}</span>
          </div>
        )
      },
      {
        header: t("status"),
        render: (c) => getStatusBadge(c.state)
      },
      {
        header: t("actions"),
        className: "text-center",
        render: (c) => (
          <div className="flex items-center justify-center gap-2">
            {isAdmin && (
              <>
                <button
                  onClick={() => handleEdit(c)}
                  className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
                  title={t("edit")}
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(c._id || c.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg border border-gray-200 transition-colors"
                  title={t("delete")}
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>
        )
      }
    ],
    [t, handleEdit, handleDelete, isAdmin]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText size={24} className="text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              {t("contracts")}
            </h1>
          </div>
          <p className="text-gray-500 mt-1">
            {isAdmin ? t("manage_contracts") : t("view_your_contract_details")}
          </p>
        </div>
        <div className="flex gap-3">
          {isAdmin && selectedIds.length > 0 && (
            <Button
              variant="danger"
              onClick={() => setIsBulkConfirmOpen(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 size={18} />
              {t("delete_selected")} ({selectedIds.length})
            </Button>
          )}
          <ExportDropdown data={filteredContracts} filename="contracts" />
          {isAdmin && (
            <Button
              variant="primary"
              onClick={() => {
                setEditingContract(null);
                setIsModalOpen(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus size={18} />
              {t("add_contract")}
            </Button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-indigo-600" />
            <p className="text-xs text-gray-500">{t("total_contracts")}</p>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">{totalContracts}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <DollarSign size={18} className="text-green-600" />
            <p className="text-xs text-gray-500">{t("total_salary")}</p>
          </div>
          <p className="text-xl font-bold text-green-600 mt-1">{totalSalary.toLocaleString()} EGP</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} className="text-green-500" />
            <p className="text-xs text-gray-500">{t("active")}</p>
          </div>
          <p className="text-xl font-bold text-green-600 mt-1">{activeContracts}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-orange-600" />
            <p className="text-xs text-gray-500">{t("expiring_soon")}</p>
          </div>
          <p className="text-xl font-bold text-orange-600 mt-1">{expiringSoon}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <XCircle size={18} className="text-red-600" />
            <p className="text-xs text-gray-500">{t("expired")}</p>
          </div>
          <p className="text-xl font-bold text-red-600 mt-1">{expiredContracts}</p>
        </div>
      </div>

      {/* Filters */}
      {isAdmin && (
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t("search_contracts")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {branchOptions.map((option) => (
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

          {(branchFilter || statusFilter || searchTerm) && (
            <button
              onClick={() => {
                setBranchFilter("");
                setStatusFilter("");
                setSearchTerm("");
              }}
              className="text-sm text-red-600 hover:text-red-700"
            >
              {t("clear_filters")}
            </button>
          )}
        </div>
      )}

      {/* Table */}
        <Table
          data={filteredContracts}
          columns={columns}
          keyExtractor={(item) => item._id || item.id}
          isLoading={isLoading}
          selectable={isAdmin}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />

      {/* Modal */}
      <ContractModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingContract(null);
        }}
        onSave={handleSave}
        contractToEdit={editingContract}
        isLoading={isLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t("delete_contract")}
        message={t("are_you_sure_delete_contract")}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationModal
        isOpen={isBulkConfirmOpen}
        onClose={() => setIsBulkConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title={t("delete_contracts")}
        message={t("are_you_sure_delete_contracts", { count: selectedIds.length })}
      />
    </div>
  );
};
