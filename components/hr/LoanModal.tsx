import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Wallet, Calendar, DollarSign, FileText, User, AlertCircle, Hash, CreditCard } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { Loan } from "../../types";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

interface LoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Loan>) => Promise<void>;
  loanToEdit?: Loan | null;
  isLoading?: boolean;
}

export const LoanModal: React.FC<LoanModalProps> = ({
  isOpen,
  onClose,
  onSave,
  loanToEdit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { employees, currentUserEmployee } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    employeeInfo: "",      // Changed from employeeId to employeeInfo
    loanAmount: 0,
    installmentAmount: 0,
    numberOfInstallments: 1,
    remainingAmount: 0,
    date: new Date().toISOString().split("T")[0],
    reason: "",
    deductionType: "INSTALLMENTS",
    status: "Pending",
    startMonth: `${new Date().toLocaleString('default', { month: 'short' })} ${new Date().getFullYear()}`,
    approvalBy: "",
    rejectedReason: "",
  });

  const isAdmin = user?.role === "admin";

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

  // Generate loan ID
  const generateLoanId = useCallback(() => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `LOAN-${timestamp}`;
  }, []);

  useEffect(() => {
    if (loanToEdit && isOpen) {
      // Get employeeInfo - could be string ID or object with _id
      let employeeInfoValue = "";
      if (loanToEdit.employeeInfo) {
        if (typeof loanToEdit.employeeInfo === 'object') {
          employeeInfoValue = extractId(loanToEdit.employeeInfo);
        } else {
          employeeInfoValue = loanToEdit.employeeInfo;
        }
      } else if (loanToEdit.employeeId) {
        // Backward compatibility
        if (typeof loanToEdit.employeeId === 'object') {
          employeeInfoValue = extractId(loanToEdit.employeeId);
        } else {
          employeeInfoValue = loanToEdit.employeeId;
        }
      }
      
      setFormData({
        employeeInfo: employeeInfoValue,
        loanAmount: loanToEdit.loanAmount || 0,
        installmentAmount: loanToEdit.installmentAmount || 0,
        numberOfInstallments: (loanToEdit as any).numberOfInstallments || 1,
        remainingAmount: (loanToEdit as any).remainingAmount || loanToEdit.loanAmount || 0,
        date: loanToEdit.date
          ? new Date(loanToEdit.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        reason: loanToEdit.reason || "",
        deductionType: (loanToEdit as any).deductionType || "INSTALLMENTS",
        status: loanToEdit.status || "Pending",
        startMonth: (loanToEdit as any).startMonth || `${new Date().toLocaleString('default', { month: 'short' })} ${new Date().getFullYear()}`,
        approvalBy: (loanToEdit as any).approvalBy || "",
        rejectedReason: (loanToEdit as any).rejectedReason || "",
      });
    } else if (!loanToEdit && isOpen) {
      const currentId = extractId(currentUserEmployee);
      setFormData({
        employeeInfo: currentId || "",
        loanAmount: 0,
        installmentAmount: 0,
        numberOfInstallments: 1,
        remainingAmount: 0,
        date: new Date().toISOString().split("T")[0],
        reason: "",
        deductionType: "INSTALLMENTS",
        status: "Pending",
        startMonth: `${new Date().toLocaleString('default', { month: 'short' })} ${new Date().getFullYear()}`,
        approvalBy: "",
        rejectedReason: "",
      });
    }
  }, [loanToEdit, isOpen, currentUserEmployee, extractId]);

  // Calculate installment amount when loan amount or number of installments changes
  useEffect(() => {
    if (formData.loanAmount > 0 && formData.numberOfInstallments > 0) {
      const installment = formData.loanAmount / formData.numberOfInstallments;
      setFormData(prev => ({
        ...prev,
        installmentAmount: Math.round(installment * 100) / 100,
        remainingAmount: formData.loanAmount,
      }));
    }
  }, [formData.loanAmount, formData.numberOfInstallments]);

  const loanTypeOptions = [
    { value: "Cash", label: t("cash") },
    { value: "Bank Transfer", label: t("bank_transfer") },
    { value: "Salary Advance", label: t("salary_advance") },
    { value: "Emergency", label: t("emergency_loan") },
  ];

  // API expects "SINGLE" or "INSTALLMENTS"
  const deductionTypeOptions = [
    { value: "INSTALLMENTS", label: t("installments") },
    { value: "SINGLE", label: t("single_deduction") },
  ];

  const statusOptions = [
    { value: "Pending", label: t("pending") },
    { value: "Approved", label: t("approved") },
    { value: "Active", label: t("active") },
    { value: "Completed", label: t("completed") },
    { value: "Rejected", label: t("rejected") },
  ];

  const employeeOptions = employees.map(emp => ({
    value: extractId(emp),
    label: `${emp.fullName} (${emp.employeeCode})`,
  }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation
    if (!formData.employeeInfo) {
      toast.error(t("employee_required"));
      return;
    }
    if (formData.loanAmount <= 0) {
      toast.error(t("loan_amount_positive"));
      return;
    }
    if (formData.numberOfInstallments <= 0) {
      toast.error(t("installments_positive"));
      return;
    }
    if (!formData.reason.trim()) {
      toast.error(t("reason_required"));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare data according to API expectations
      const saveData: any = {
        employeeInfo: formData.employeeInfo,  // Send as string ID
        loanAmount: formData.loanAmount,
        installmentAmount: formData.installmentAmount,
        numberOfInstallments: formData.numberOfInstallments,
        remainingAmount: formData.loanAmount,
        date: formData.date,
        reason: formData.reason,
        deductionType: formData.deductionType, // "SINGLE" or "INSTALLMENTS"
        startMonth: formData.startMonth,
        status: formData.status,
      };
      
      // Add loanId for new loans
      if (!loanToEdit) {
        saveData.loanId = generateLoanId();
      }
      
      // Add approval fields if status is Approved
      if (formData.status === "Approved" && isAdmin) {
        saveData.approvalBy = user?.username || "Admin";
      }
      
      // Add rejection reason if status is Rejected
      if (formData.status === "Rejected" && formData.rejectedReason) {
        saveData.rejectedReason = formData.rejectedReason;
      }
      
      console.log("Saving loan:", saveData);
      
      // If editing, include the ID in the data
      if (loanToEdit) {
        const loanId = extractId(loanToEdit);
        if (loanId) {
          saveData._id = loanId;
          saveData.id = loanId;
        }
      }
      
      await onSave(saveData);
      onClose();
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error(t("failed_to_save_loan"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Get selected employee name for display
  const selectedEmployee = employees.find(e => extractId(e) === formData.employeeInfo);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {loanToEdit ? <Edit2 size={20} /> : <Plus size={20} />}
          {loanToEdit ? t("edit_loan") : t("add_loan")}
        </div>
      }
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto px-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Employee Selection */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("employee")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              {isAdmin ? (
                <Select
                  value={formData.employeeInfo}
                  onChange={(e) => handleChange("employeeInfo", e.target.value)}
                  options={employeeOptions}
                  placeholder={t("select_employee")}
                  required
                  fullWidth
                  className="pl-10"
                  disabled={!!loanToEdit}
                />
              ) : (
                <Input
                  value={selectedEmployee?.fullName || currentUserEmployee?.fullName || ""}
                  disabled
                  fullWidth
                  className="pl-10"
                />
              )}
            </div>
          </div>

          {/* Loan ID (readonly) */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("loan_id")}
            </label>
            <div className="relative">
              <Hash size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={loanToEdit ? (loanToEdit as any).loanId || generateLoanId() : generateLoanId()}
                disabled
                fullWidth
                className="pl-10 bg-gray-50"
              />
            </div>
          </div>

          {/* Date */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("date")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
                required
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Start Month */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("start_month")}
            </label>
            <div className="relative">
              <Calendar size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="month"
                value={formData.startMonth}
                onChange={(e) => handleChange("startMonth", e.target.value)}
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Loan Amount */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("loan_amount")} (EGP) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <DollarSign size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.loanAmount}
                onChange={(e) => handleChange("loanAmount", Number(e.target.value))}
                placeholder="0.00"
                required
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Number of Installments */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("number_of_installments")} <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              min="1"
              value={formData.numberOfInstallments}
              onChange={(e) => handleChange("numberOfInstallments", Number(e.target.value))}
              placeholder="1"
              required
              fullWidth
            />
          </div>

          {/* Installment Amount (Read-only) */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("installment_amount")} (EGP)
            </label>
            <div className="relative">
              <DollarSign size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="number"
                value={formData.installmentAmount}
                disabled
                className="bg-gray-50 pl-10"
                fullWidth
              />
            </div>
          </div>

          {/* Remaining Amount (Read-only) */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("remaining_amount")} (EGP)
            </label>
            <div className="relative">
              <DollarSign size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="number"
                value={formData.remainingAmount}
                disabled
                className="bg-gray-50 pl-10"
                fullWidth
              />
            </div>
          </div>

          {/* Deduction Type */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("deduction_type")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.deductionType}
              onChange={(e) => handleChange("deductionType", e.target.value)}
              options={deductionTypeOptions}
              required
              fullWidth
            />
            <p className="text-xs text-gray-500">{t("deduction_type_description")}</p>
          </div>

          {/* Status (only for edit) */}
          {loanToEdit && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("status")} <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
                options={statusOptions}
                required
                fullWidth
              />
            </div>
          )}

          {/* Rejection Reason (only when status is Rejected) */}
          {formData.status === "Rejected" && (
            <div className="col-span-2 space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("rejection_reason")}
              </label>
              <div className="relative">
                <AlertCircle size={18} className="absolute left-3 top-3 text-red-400" />
                <TextArea
                  value={formData.rejectedReason}
                  onChange={(e) => handleChange("rejectedReason", e.target.value)}
                  placeholder={t("enter_rejection_reason")}
                  rows={2}
                  fullWidth
                  className="pl-10"
                />
              </div>
            </div>
          )}

          {/* Reason */}
          <div className="col-span-2 space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("reason")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FileText size={18} className="absolute left-3 top-3 text-gray-400" />
              <TextArea
                value={formData.reason}
                onChange={(e) => handleChange("reason", e.target.value)}
                placeholder={t("enter_reason")}
                rows={2}
                required
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

        </div>

        {/* Summary Preview */}
        {formData.loanAmount > 0 && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Wallet size={16} className="text-indigo-600" />
              {t("loan_summary")}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500">{t("loan_amount")}</p>
                <p className="text-lg font-bold text-indigo-600">{formData.loanAmount.toLocaleString()} EGP</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">{t("installments")}</p>
                <p className="text-lg font-bold text-gray-700">{formData.numberOfInstallments}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">{t("monthly_installment")}</p>
                <p className="text-lg font-bold text-green-600">{formData.installmentAmount.toLocaleString()} EGP</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">{t("total_to_pay")}</p>
                <p className="text-lg font-bold text-purple-600">{formData.loanAmount.toLocaleString()} EGP</p>
              </div>
            </div>
            {formData.deductionType === "SINGLE" && (
              <div className="mt-3 pt-2 border-t border-indigo-200">
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {t("single_deduction_note")}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting || isLoading}
            type="button"
          >
            {t("cancel")}
          </Button>
          <Button
            variant="primary"
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 px-8"
            isLoading={isSubmitting || isLoading}
            disabled={isSubmitting || isLoading}
          >
            {loanToEdit ? t("update_loan") : t("add_loan")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};