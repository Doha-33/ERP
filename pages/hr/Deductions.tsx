import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  User,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  Filter,
  X,
  ChevronDown,
} from "lucide-react";
import {
  Card,
  Button,
  Input,
  Badge,
  ExportDropdown,
} from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { DeductionModal } from "../../components/hr/DeductionModal";
import { useData } from "../../context/DataContext";
import { DeductionRecord } from "../../types";
import { toast } from "sonner";

export const Deductions: React.FC = () => {
  const { t } = useTranslation();
  const {
    deductionRecords,
    addDeductionRecord,
    updateDeductionRecord,
    deleteDeductionRecord,
    fetchDeductionRecords,
    employees,
    companies,
    branches,
  } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DeductionRecord | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const extractId = useCallback((value: any): string => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      if (value._id && typeof value._id === "string") return value._id;
      if (value.id && typeof value.id === "string") return value.id;
    }
    return "";
  }, []);

  // تحديث handleSave
  const handleSave = async (record: Partial<DeductionRecord>) => {
    try {
      setIsLoading(true);

      if (editingRecord) {
        const recordId = extractId(editingRecord);

        if (!recordId) {
          toast.error(t("deduction_id_missing"));
          return;
        }

        const updateData = {
          ...record,
          _id: recordId,
          id: recordId,
        } as DeductionRecord;

        console.log("Updating deduction with ID:", recordId, updateData);
        await updateDeductionRecord(updateData);
        toast.success(t("deduction_updated_successfully"));
      } else {
        await addDeductionRecord(record as DeductionRecord);
        toast.success(t("deduction_created_successfully"));
      }

      await fetchDeductionRecords();
      setIsModalOpen(false);
      setEditingRecord(null);
    } catch (error: any) {
      console.error("Error saving deduction:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        t("failed_to_save_deduction");
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // تحديث handleEdit
  const handleEdit = useCallback(
    (record: DeductionRecord) => {
      const recordId = extractId(record);

      if (!recordId) {
        console.error("Deduction record ID not found", record);
        toast.error(t("deduction_id_not_found"));
        return;
      }

      const recordToEdit: DeductionRecord = {
        ...record,
        _id: recordId,
        id: recordId,
      };

      console.log("Editing deduction record:", recordToEdit);
      setEditingRecord(recordToEdit);
      setIsModalOpen(true);
    },
    [extractId, t],
  );

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      try {
        await deleteDeductionRecord(deleteId);
        toast.success(t("deduction_deleted_successfully"));
        setDeleteId(null);
        setSelectedIds((prev) => prev.filter((sid) => sid !== deleteId));
      } catch (error) {
        toast.error(t("failed_to_delete_deduction"));
      }
    }
  }, [deleteId, deleteDeductionRecord, t]);

  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      await Promise.all(selectedIds.map((id) => deleteDeductionRecord(id)));
      toast.success(
        t("deductions_deleted_successfully", { count: selectedIds.length }),
      );
      setSelectedIds([]);
      setIsBulkConfirmOpen(false);
    } catch (error) {
      console.error("Bulk delete failed", error);
      toast.error(t("failed_to_delete_deductions"));
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions
  const getEmployeeName = (record: DeductionRecord): string => {
    if (
      typeof record.employeeInfo === "object" &&
      record.employeeInfo !== null
    ) {
      return (record.employeeInfo as any)?.fullName || "-";
    }
    const employee = employees.find(
      (e) => (e._id || e.id) === record.employeeInfo,
    );
    return employee?.fullName || "-";
  };

  const getEmployeeCode = (record: DeductionRecord): string => {
    if (
      typeof record.employeeInfo === "object" &&
      record.employeeInfo !== null
    ) {
      return (record.employeeInfo as any)?.employeeCode || "-";
    }
    const employee = employees.find(
      (e) => (e._id || e.id) === record.employeeInfo,
    );
    return employee?.employeeCode || "-";
  };

  const getCompanyName = (record: DeductionRecord): string => {
    if (typeof record.company === "object" && record.company !== null) {
      return (record.company as any)?.name || "-";
    }
    const company = companies.find((c) => (c._id || c.id) === record.company);
    return company?.name || "-";
  };

  const getBranchName = (record: DeductionRecord): string => {
    if (typeof record.branch === "object" && record.branch !== null) {
      return (record.branch as any)?.name || "-";
    }
    const branch = branches.find((b) => (b._id || b.id) === record.branch);
    return branch?.name || "-";
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString();
  };

  // Apply filters
  const filteredRecords = useMemo(() => {
    return deductionRecords.filter((r) => {
      const employeeName = getEmployeeName(r).toLowerCase();
      const matchesSearch = employeeName.includes(searchTerm.toLowerCase());
      const matchesEmployee =
        !employeeFilter ||
        (typeof r.employeeInfo === "object"
          ? (r.employeeInfo as any)._id
          : r.employeeInfo) === employeeFilter;
      return matchesSearch && matchesEmployee;
    });
  }, [deductionRecords, searchTerm, employeeFilter]);

  // Statistics
  const totalRecords = filteredRecords.length;
  const totalAbsence = filteredRecords.reduce(
    (sum, r) => sum + (r.absence || 0),
    0,
  );
  const totalLateArrival = filteredRecords.reduce(
    (sum, r) => sum + (r.lateArrival || 0),
    0,
  );
  const totalLoan = filteredRecords.reduce((sum, r) => sum + (r.loan || 0), 0);
  const totalPenalties = filteredRecords.reduce(
    (sum, r) => sum + (r.penaltiesDeduction || 0),
    0,
  );

  const employeeOptions = [
    { value: "", label: t("all_employees") },
    ...employees.map((e) => ({
      value: e._id || e.id,
      label: e.fullName,
    })),
  ];

  const columns: Column<DeductionRecord>[] = useMemo(
    () => [
      {
        header: t("employee"),
        render: (r) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <User size={18} className="text-indigo-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">
                {getEmployeeName(r)}
              </span>
              <span className="text-xs text-gray-500">
                {getEmployeeCode(r)}
              </span>
            </div>
          </div>
        ),
      },
      {
        header: t("company_branch"),
        render: (r) => (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <Building2 size={14} className="text-gray-400" />
              <span className="text-sm text-gray-600">{getCompanyName(r)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin size={14} className="text-gray-400" />
              <span className="text-sm text-gray-500">{getBranchName(r)}</span>
            </div>
          </div>
        ),
      },
      {
        header: t("date"),
        render: (r) => (
          <div className="flex items-center gap-1.5">
            <Calendar size={14} className="text-gray-400" />
            <span className="text-sm text-gray-600">{formatDate(r.date)}</span>
          </div>
        ),
      },
      {
        header: t("deductions"),
        render: (r) => (
          <div className="flex flex-col gap-0.5">
            <div className="flex justify-between gap-4">
              <span className="text-xs text-gray-500">{t("absence")}:</span>
              <span className="text-sm font-medium">{r.absence || 0} EGP</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-xs text-gray-500">
                {t("late_arrival")}:
              </span>
              <span className="text-sm font-medium">
                {r.lateArrival || 0} EGP
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-xs text-gray-500">{t("early_leave")}:</span>
              <span className="text-sm font-medium">
                {r.earlyLeave || 0} EGP
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-xs text-gray-500">{t("loan")}:</span>
              <span className="text-sm font-medium">{r.loan || 0} EGP</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-xs text-gray-500">{t("penalties")}:</span>
              <span className="text-sm font-medium">
                {r.penaltiesDeduction || 0} EGP
              </span>
            </div>
          </div>
        ),
      },
      {
        header: t("total"),
        render: (r) => {
          const total =
            (r.absence || 0) +
            (r.lateArrival || 0) +
            (r.earlyLeave || 0) +
            (r.loan || 0) +
            (r.penaltiesDeduction || 0);
          return (
            <span className="text-sm font-bold text-red-600">
              {total.toLocaleString()} EGP
            </span>
          );
        },
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
        ),
      },
    ],
    [t, handleEdit, handleDelete],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("deductions")}
          </h1>
          <p className="text-gray-500 mt-1">{t("manage_deductions")}</p>
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
          <ExportDropdown data={filteredRecords} filename="deductions" />
          <Button
            variant="primary"
            onClick={() => {
              setEditingRecord(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_deductions")}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <DollarSign size={18} className="text-red-600" />
            <p className="text-xs text-gray-500">{t("total_deductions")}</p>
          </div>
          <p className="text-xl font-bold text-red-600 mt-1">
            {(
              totalAbsence +
              totalLateArrival +
              totalLoan +
              totalPenalties
            ).toLocaleString()}{" "}
            EGP
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <User size={18} className="text-indigo-600" />
            <p className="text-xs text-gray-500">{t("total_records")}</p>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">{totalRecords}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <DollarSign size={18} className="text-orange-600" />
            <p className="text-xs text-gray-500">{t("total_absence")}</p>
          </div>
          <p className="text-xl font-bold text-orange-600 mt-1">
            {totalAbsence.toLocaleString()} EGP
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <DollarSign size={18} className="text-purple-600" />
            <p className="text-xs text-gray-500">{t("total_loan")}</p>
          </div>
          <p className="text-xl font-bold text-purple-600 mt-1">
            {totalLoan.toLocaleString()} EGP
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder={t("search_by_employee")}
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
        data={filteredRecords}
        columns={columns}
        keyExtractor={(item) => item._id || item.id}
        isLoading={isLoading}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />

      {/* Modal */}
      <DeductionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRecord(null);
        }}
        onSave={handleSave}
        recordToEdit={editingRecord}
        isLoading={isLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t("delete_deduction")}
        message={t("are_you_sure_delete_deduction")}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationModal
        isOpen={isBulkConfirmOpen}
        onClose={() => setIsBulkConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title={t("delete_deductions")}
        message={t("are_you_sure_delete_deductions", {
          count: selectedIds.length,
        })}
      />
    </div>
  );
};
