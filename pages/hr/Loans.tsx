import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Calendar,
  FileText,
  X,
  History,
  CheckCircle2,
  Clock,
  Wallet,
  DollarSign,
  Filter,
} from "lucide-react";
import {
  Card,
  Button,
  Badge,
  ExportDropdown,
} from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { ResponsesHistoryModal } from "../../components/hr/ResponsesHistoryModal";
import { LoanModal } from "../../components/hr/LoanModal";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import { Loan } from "../../types";
import { toast } from "sonner";

export const LoansPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const {
    loans,
    addLoan,
    updateLoan,
    deleteLoan,
    toggleLoanWorkflow,
    currentUserEmployee,
    actionHistory,
    fetchLoans,
    fetchActionHistory,
  } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const isAdmin = user?.role === "admin";

  // في LoansPage component، قم بتحديث handleSave و handleEdit
  const extractId = useCallback((value: any): string => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      if (value._id && typeof value._id === "string") return value._id;
      if (value.id && typeof value.id === "string") return value.id;
    }
    return "";
  }, []);

  // في LoansPage component، تأكد من أن handleSave يمرر البيانات بشكل صحيح

  const handleSave = async (loanData: Partial<Loan>) => {
    try {
      setIsLoading(true);

      if (editingLoan) {
        const loanId = extractId(editingLoan);

        if (!loanId) {
          toast.error(t("loan_id_missing"));
          return;
        }

        const updateData = {
          ...loanData,
          _id: loanId,
          id: loanId,
        } as Loan;

        console.log("Updating loan with ID:", loanId, updateData);
        await updateLoan(updateData);
        toast.success(t("loan_updated_successfully"));
      } else {
        // For new loans, the API expects employeeInfo field
        await addLoan(loanData as Loan);
        toast.success(t("loan_created_successfully"));
      }

      await fetchLoans();
      setIsModalOpen(false);
      setEditingLoan(null);
    } catch (error: any) {
      console.error("Error saving loan:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        t("failed_to_save_loan");
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = useCallback(
    (loan: Loan) => {
      const loanId = extractId(loan);

      if (!loanId) {
        console.error("Loan ID not found", loan);
        toast.error(t("loan_id_not_found"));
        return;
      }

      const loanToEdit: Loan = {
        ...loan,
        _id: loanId,
        id: loanId,
      };

      console.log("Editing loan:", loanToEdit);
      setEditingLoan(loanToEdit);
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
        await deleteLoan(deleteId);
        toast.success(t("loan_deleted_successfully"));
        setDeleteId(null);
        setSelectedIds((prev) => prev.filter((sid) => sid !== deleteId));
      } catch (error) {
        toast.error(t("failed_to_delete_loan"));
      }
    }
  }, [deleteId, deleteLoan, t]);

  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      await Promise.all(selectedIds.map((id) => deleteLoan(id)));
      toast.success(
        t("loans_deleted_successfully", { count: selectedIds.length }),
      );
      setSelectedIds([]);
      setIsBulkConfirmOpen(false);
    } catch (error) {
      console.error("Bulk delete failed", error);
      toast.error(t("failed_to_delete_loans"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = useCallback(
    async (id: string) => {
      try {
        await toggleLoanWorkflow(id, "hr");
        toast.success(t("loan_approved_successfully"));
      } catch (error) {
        toast.error(t("failed_to_approve_loan"));
      }
    },
    [toggleLoanWorkflow, t],
  );

  const handleShowHistory = async (id: string) => {
    await fetchActionHistory();
    const filteredHistory = actionHistory.filter((h) => h.requestId === id);
    setSelectedHistory(filteredHistory);
    setIsHistoryOpen(true);
  };

  // Helper functions
  const getEmployeeName = (loan: Loan): string => {
    if (typeof loan.employeeInfo === "object" && loan.employeeInfo !== null) {
      return (loan.employeeInfo as any)?.fullName || "-";
    }
    return loan.employeeName || "-";
  };

  const getEmployeeCode = (loan: Loan): string => {
    if (typeof loan.employeeInfo === "object" && loan.employeeInfo !== null) {
      return (loan.employeeInfo as any)?.employeeCode || "-";
    }
    return "-";
  };

  // Apply filters
  const accessibleLoans = useMemo(() => {
    if (isAdmin) return loans;
    const currentId = currentUserEmployee?._id || currentUserEmployee?.id;
    return loans.filter((l) => {
      const empId =
        typeof l.employeeId === "object"
          ? (l.employeeId as any)._id
          : l.employeeId;
      return empId === currentId;
    });
  }, [isAdmin, loans, currentUserEmployee]);

  const filteredLoans = useMemo(() => {
    return accessibleLoans.filter((l) => {
      const employeeName = getEmployeeName(l).toLowerCase();
      const matchesSearch = employeeName.includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || l.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [accessibleLoans, searchTerm, statusFilter]);

  // Statistics
  const totalLoans = filteredLoans.length;
  const totalAmount = filteredLoans.reduce(
    (sum, l) => sum + (l.loanAmount || 0),
    0,
  );
  const pendingCount = filteredLoans.filter(
    (l) => l.status === "Pending",
  ).length;
  const activeCount = filteredLoans.filter(
    (l) => l.status === "Active" || l.status === "Approved",
  ).length;
  const completedCount = filteredLoans.filter(
    (l) => l.status === "Completed",
  ).length;

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      { variant: "warning" | "info" | "success" | "danger"; label: string }
    > = {
      Pending: { variant: "warning", label: t("pending") },
      Approved: { variant: "info", label: t("approved") },
      Active: { variant: "info", label: t("active") },
      Completed: { variant: "success", label: t("completed") },
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
    { value: "Active", label: t("active") },
    { value: "Completed", label: t("completed") },
    { value: "Rejected", label: t("rejected") },
  ];

  const columns: Column<Loan>[] = useMemo(
    () => [
      {
        header: t("employee"),
        render: (l) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <User size={18} className="text-indigo-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">
                {getEmployeeName(l)}
              </span>
              <span className="text-xs text-gray-500">
                {getEmployeeCode(l)}
              </span>
            </div>
          </div>
        ),
      },
      {
        header: t("loan_info"),
        render: (l) => (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <DollarSign size={14} className="text-green-600" />
              <span className="text-sm font-semibold text-green-600">
                {l.loanAmount?.toLocaleString()} EGP
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={12} className="text-gray-400" />
              <span className="text-xs text-gray-500">
                {formatDate(l.startMonth)}
              </span>
            </div>
          </div>
        ),
      },
      {
        header: t("installment"),
        render: (l) => (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-gray-600">
              {l.numberOfInstallments} {t("months")}
            </span>
            <span className="text-xs text-gray-500">
              {l.installmentAmount?.toLocaleString()} EGP / {t("month")}
            </span>
          </div>
        ),
      },
      {
        header: t("status"),
        render: (l) => getStatusBadge(l.status),
      },
      {
        header: t("actions"),
        className: "text-center",
        render: (l) => (
          <div className="flex items-center justify-center gap-2">
            {isAdmin && l.status === "Pending" && (
              <button
                onClick={() => handleApprove(l._id || l.id)}
                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg border border-green-200 transition-colors"
                title={t("approve")}
              >
                <CheckCircle2 size={16} />
              </button>
            )}
            <button
              onClick={() => handleShowHistory(l._id || l.id)}
              className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
              title={t("history")}
            >
              <History size={16} />
            </button>
            <button
              onClick={() => handleEdit(l)}
              className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
              title={t("edit")}
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => handleDelete(l._id || l.id)}
              className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg border border-gray-200 transition-colors"
              title={t("delete")}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ),
      },
    ],
    [t, handleEdit, handleDelete, handleApprove, handleShowHistory, isAdmin],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("loans")}</h1>
          <p className="text-gray-500 mt-1">
            {isAdmin ? t("manage_loans") : t("your_loan_records")}
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
          <ExportDropdown data={filteredLoans} filename="loans" />
          <Button
            variant="primary"
            onClick={() => {
              setEditingLoan(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_loan")}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Wallet size={18} className="text-indigo-600" />
            <p className="text-xs text-gray-500">{t("total_loans")}</p>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">{totalLoans}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <DollarSign size={18} className="text-green-600" />
            <p className="text-xs text-gray-500">{t("total_amount")}</p>
          </div>
          <p className="text-xl font-bold text-green-600 mt-1">
            {totalAmount.toLocaleString()} EGP
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-orange-600" />
            <p className="text-xs text-gray-500">{t("pending")}</p>
          </div>
          <p className="text-xl font-bold text-orange-600 mt-1">
            {pendingCount}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-green-500" />
            <p className="text-xs text-gray-500">{t("completed")}</p>
          </div>
          <p className="text-xl font-bold text-green-600 mt-1">
            {completedCount}
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

        {isAdmin && (
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
        )}

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
        data={filteredLoans}
        columns={columns}
        keyExtractor={(item) => item._id || item.id}
        isLoading={isLoading}
        selectable={isAdmin}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />

      {/* Modals */}
      <LoanModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingLoan(null);
        }}
        onSave={handleSave}
        loanToEdit={editingLoan}
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
        title={t("delete_loan")}
        message={t("are_you_sure_delete_loan")}
      />

      <ConfirmationModal
        isOpen={isBulkConfirmOpen}
        onClose={() => setIsBulkConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title={t("delete_loans")}
        message={t("are_you_sure_delete_loans", { count: selectedIds.length })}
      />
    </div>
  );
};

// Add missing imports
import { User } from "lucide-react";
