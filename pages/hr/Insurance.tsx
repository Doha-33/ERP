import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Edit2, Trash2, Shield, Building2, Calendar, DollarSign, Filter, X, ChevronDown, Users, Hash } from "lucide-react";
import { Card, Button, Input, Badge, ExportDropdown } from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { InsuranceModal } from "../../components/hr/InsuranceModal";
import { useData } from "../../context/DataContext";
import { Insurance } from "../../types";
import { toast } from "sonner";

export const InsurancePage: React.FC = () => {
  const { t } = useTranslation();
  const { insurancePolicies, addInsurance, updateInsurance, deleteInsurance, employees, fetchInsurancePolicies } = useData();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInsurance, setEditingInsurance] = useState<Insurance | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
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

  const handleSave = async (insuranceData: Partial<Insurance>) => {
    try {
      setIsLoading(true);
      
      if (editingInsurance) {
        const insuranceId = extractId(editingInsurance);
        
        if (!insuranceId) {
          toast.error(t("insurance_id_missing"));
          return;
        }
        
        const updateData = {
          ...insuranceData,
          _id: insuranceId,
          id: insuranceId
        } as Insurance;
        
        console.log("Updating insurance with ID:", insuranceId, updateData);
        await updateInsurance(updateData);
        toast.success(t("insurance_updated_successfully"));
      } else {
        await addInsurance(insuranceData as Insurance);
        toast.success(t("insurance_created_successfully"));
      }
      
      await fetchInsurancePolicies();
      setIsModalOpen(false);
      setEditingInsurance(null);
    } catch (error: any) {
      console.error("Error saving insurance:", error);
      const message = error?.response?.data?.message || error?.message || t("failed_to_save_insurance");
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = useCallback((insurance: Insurance) => {
    const insuranceId = extractId(insurance);
    
    if (!insuranceId) {
      console.error("Insurance ID not found", insurance);
      toast.error(t("insurance_id_not_found"));
      return;
    }
    
    const insuranceToEdit: Insurance = {
      ...insurance,
      _id: insuranceId,
      id: insuranceId,
    };
    
    console.log("Editing insurance:", insuranceToEdit);
    setEditingInsurance(insuranceToEdit);
    setIsModalOpen(true);
  }, [extractId, t]);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      try {
        await deleteInsurance(deleteId);
        toast.success(t("insurance_deleted_successfully"));
        setDeleteId(null);
        setSelectedIds(prev => prev.filter(sid => sid !== deleteId));
        await fetchInsurancePolicies();
      } catch (error) {
        toast.error(t("failed_to_delete_insurance"));
      }
    }
  }, [deleteId, deleteInsurance, fetchInsurancePolicies, t]);

  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      const validIds = selectedIds.filter(id => id && typeof id === 'string');
      if (validIds.length === 0) {
        toast.error(t("no_valid_ids_selected"));
        return;
      }
      await Promise.all(validIds.map(id => deleteInsurance(id)));
      toast.success(t("insurances_deleted_successfully", { count: validIds.length }));
      setSelectedIds([]);
      setIsBulkConfirmOpen(false);
      await fetchInsurancePolicies();
    } catch (error) {
      console.error("Bulk delete failed", error);
      toast.error(t("failed_to_delete_insurances"));
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions
  const getEmployeeName = (insurance: Insurance): string => {
    if (typeof insurance.employeeInfo === "object" && insurance.employeeInfo !== null) {
      return (insurance.employeeInfo as any)?.fullName || "-";
    }
    const employee = employees.find(e => extractId(e) === insurance.employeeInfo);
    return employee?.fullName || insurance.employeeName || "-";
  };

  const getEmployeeCode = (insurance: Insurance): string => {
    if (typeof insurance.employeeInfo === "object" && insurance.employeeInfo !== null) {
      return (insurance.employeeInfo as any)?.employeeCode || "-";
    }
    const employee = employees.find(e => extractId(e) === insurance.employeeInfo);
    return employee?.employeeCode || "-";
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString();
  };

  const isExpired = (dateStr: string) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  };

  // Apply filters
  const filteredPolicies = useMemo(() => {
    return insurancePolicies.filter(i => {
      const employeeName = getEmployeeName(i).toLowerCase();
      const matchesSearch = 
        employeeName.includes(searchTerm.toLowerCase()) ||
        i.policyNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.insuranceCompany?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesEmployee = !employeeFilter || extractId(i.employeeInfo) === employeeFilter;
      
      return matchesSearch && matchesEmployee;
    });
  }, [insurancePolicies, searchTerm, employeeFilter]);

  // Statistics
  const totalPolicies = filteredPolicies.length;
  const totalCost = filteredPolicies.reduce((sum, i) => sum + (i.totalCost || 0), 0);
  const expiredPolicies = filteredPolicies.filter(i => isExpired(i.coverageExpiryDate || i.coverageExpiry)).length;

  const employeeOptions = [
    { value: "", label: t("all_employees") },
    ...employees.map(e => ({ 
      value: extractId(e), 
      label: e.fullName 
    }))
  ];

  const columns: Column<Insurance>[] = useMemo(
    () => [
      {
        header: t("employee"),
        render: (i) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Shield size={18} className="text-blue-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">{getEmployeeName(i)}</span>
              <span className="text-xs text-gray-500">{getEmployeeCode(i)}</span>
            </div>
          </div>
        )
      },
      {
        header: t("policy_info"),
        render: (i) => (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-gray-900">{i.policyNumber}</span>
            <span className="text-xs text-gray-500">{i.insuranceCompany}</span>
          </div>
        )
      },
      {
        header: t("plan_details"),
        render: (i) => (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-gray-700">{i.planName}</span>
            <span className="text-xs text-gray-500">{i.policyPlan}</span>
          </div>
        )
      },
      {
        header: t("cost"),
        render: (i) => (
          <div className="flex items-center gap-1.5">
            <DollarSign size={14} className="text-green-600" />
            <span className="text-sm font-bold text-green-600">{i.totalCost?.toLocaleString()} EGP</span>
          </div>
        )
      },
      {
        header: t("period"),
        render: (i) => (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <Calendar size={12} className="text-gray-400" />
              <span className="text-xs text-gray-600">Start: {formatDate(i.policyStartDate || i.startDate)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={12} className="text-gray-400" />
              <span className="text-xs text-gray-600">End: {formatDate(i.policyEndDate || i.endDate)}</span>
            </div>
          </div>
        )
      },
      {
        header: t("coverage"),
        render: (i) => {
          const expired = isExpired(i.coverageExpiryDate || i.coverageExpiry);
          return (
            <div className="flex flex-col gap-0.5">
              <span className={`text-xs font-medium ${expired ? "text-red-600" : "text-green-600"}`}>
                {expired ? t("expired") : t("active")}
              </span>
              <span className="text-xs text-gray-500">{formatDate(i.coverageExpiryDate || i.coverageExpiry)}</span>
            </div>
          );
        }
      },
      {
        header: t("family"),
        render: (i) => (
          <div className="flex items-center gap-1.5">
            <Users size={14} className="text-gray-400" />
            <span className="text-sm text-gray-600">{i.familyMembers || "-"}</span>
          </div>
        )
      },
      {
        header: t("membership"),
        render: (i) => (
          <div className="flex items-center gap-1.5">
            <Hash size={14} className="text-gray-400" />
            <span className="text-xs font-mono text-gray-500">{i.membershipId || "-"}</span>
          </div>
        )
      },
      {
        header: t("actions"),
        className: "text-center",
        render: (i) => {
          const insuranceId = extractId(i);
          return (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => handleEdit(i)}
                className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
                title={t("edit")}
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete(insuranceId)}
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
    [t, handleEdit, handleDelete, extractId]
  );

  const getKeyExtractor = useCallback((item: Insurance) => {
    const id = extractId(item);
    return id || Math.random().toString();
  }, [extractId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("insurance")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("manage_insurance")}
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
          <ExportDropdown data={filteredPolicies} filename="insurance-policies" />
          <Button
            variant="primary"
            onClick={() => {
              setEditingInsurance(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_insurance")}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Shield size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("total_policies")}</p>
              <p className="text-xl font-bold text-gray-900">{totalPolicies}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <DollarSign size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("total_cost")}</p>
              <p className="text-xl font-bold text-green-600">{totalCost.toLocaleString()} EGP</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <Calendar size={18} className="text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("expired_policies")}</p>
              <p className="text-xl font-bold text-red-600">{expiredPolicies}</p>
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
            placeholder={t("search_insurance")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={employeeFilter}
          onChange={(e) => setEmployeeFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {employeeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {(employeeFilter || searchTerm) && (
          <button
            onClick={() => {
              setEmployeeFilter("");
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
        data={filteredPolicies}
        columns={columns}
        keyExtractor={getKeyExtractor}
        isLoading={isLoading}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />

      {/* Modal */}
      <InsuranceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingInsurance(null);
        }}
        onSave={handleSave}
        insuranceToEdit={editingInsurance}
        isLoading={isLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t("delete_insurance")}
        message={t("are_you_sure_delete_insurance")}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationModal
        isOpen={isBulkConfirmOpen}
        onClose={() => setIsBulkConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title={t("delete_insurances")}
        message={t("are_you_sure_delete_insurances", { count: selectedIds.length })}
      />
    </div>
  );
};