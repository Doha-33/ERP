import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Wallet, Calendar, DollarSign, FileText, User, AlertCircle } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { Loan } from "../../types";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";

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
    employeeId: "",
    employeeInfo: "",
    loanAmount: 0,
    installmentAmount: 0,
    numberOfInstallments: 1,
    remainingAmount: 0,
    date: new Date().toISOString().split("T")[0],
    loanDetails: "",
    loanType: "Cash",
    reason: "",
    deductionType: "MONTHLY",
    status: "Pending",
  });

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (loanToEdit && isOpen) {
      const employeeId = typeof loanToEdit.employeeId === "object"
        ? (loanToEdit.employeeId as any)?._id
        : loanToEdit.employeeId || loanToEdit.employeeInfo;

      setFormData({
        employeeId: employeeId || "",
        employeeInfo: loanToEdit.employeeInfo || "",
        loanAmount: loanToEdit.loanAmount || 0,
        installmentAmount: loanToEdit.installmentAmount || 0,
        numberOfInstallments: loanToEdit.numberOfInstallments || 1,
        remainingAmount: loanToEdit.remainingAmount || loanToEdit.loanAmount || 0,
        date: loanToEdit.date
          ? new Date(loanToEdit.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        loanDetails: loanToEdit.loanDetails || "",
        loanType: loanToEdit.loanType || "Cash",
        reason: loanToEdit.reason || "",
        deductionType: loanToEdit.deductionType || "MONTHLY",
        status: loanToEdit.status || "Pending",
      });
    } else if (!loanToEdit && isOpen) {
      setFormData({
        employeeId: currentUserEmployee?._id || currentUserEmployee?.id || "",
        employeeInfo: "",
        loanAmount: 0,
        installmentAmount: 0,
        numberOfInstallments: 1,
        remainingAmount: 0,
        date: new Date().toISOString().split("T")[0],
        loanDetails: "",
        loanType: "Cash",
        reason: "",
        deductionType: "MONTHLY",
        status: "Pending",
      });
    }
  }, [loanToEdit, isOpen, currentUserEmployee]);

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

  const deductionTypeOptions = [
    { value: "MONTHLY", label: t("monthly_deduction") },
    { value: "ONE_TIME", label: t("one_time_deduction") },
  ];

  const employeeOptions = employees.map(emp => ({
    value: emp._id || emp.id,
    label: `${emp.fullName} (${emp.employeeCode})`,
  }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error in form submission:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Get selected employee name for display
  const selectedEmployee = employees.find(e => (e._id || e.id) === formData.employeeId);

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
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Employee Selection */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("employee")} <span className="text-red-500">*</span>
            </label>
            {isAdmin ? (
              <Select
                value={formData.employeeId}
                onChange={(e) => handleChange("employeeId", e.target.value)}
                options={employeeOptions}
                placeholder={t("select_employee")}
                required
                fullWidth
              />
            ) : (
              <>
                <Input
                  value={selectedEmployee?.fullName || currentUserEmployee?.fullName || ""}
                  disabled
                  fullWidth
                />
                <input type="hidden" value={formData.employeeId} />
              </>
            )}
          </div>

          {/* Date */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("date")} <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => handleChange("date", e.target.value)}
              required
              fullWidth
            />
          </div>

          {/* Loan Amount */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("loan_amount")} (EGP) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.loanAmount}
              onChange={(e) => handleChange("loanAmount", Number(e.target.value))}
              placeholder="0.00"
              required
              fullWidth
            />
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
            <Input
              type="number"
              value={formData.installmentAmount}
              disabled
              className="bg-gray-50"
              fullWidth
            />
          </div>

          {/* Loan Type */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("loan_type")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.loanType}
              onChange={(e) => handleChange("loanType", e.target.value)}
              options={loanTypeOptions}
              required
              fullWidth
            />
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
                options={[
                  { value: "Pending", label: t("pending") },
                  { value: "Approved", label: t("approved") },
                  { value: "Active", label: t("active") },
                  { value: "Completed", label: t("completed") },
                  { value: "Rejected", label: t("rejected") },
                ]}
                required
                fullWidth
              />
            </div>
          )}

          {/* Reason */}
          <div className="col-span-2 space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("reason")} <span className="text-red-500">*</span>
            </label>
            <TextArea
              value={formData.reason}
              onChange={(e) => handleChange("reason", e.target.value)}
              placeholder={t("enter_reason")}
              rows={2}
              required
              fullWidth
            />
          </div>

          {/* Loan Details */}
          <div className="col-span-2 space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("loan_details")}
            </label>
            <TextArea
              value={formData.loanDetails}
              onChange={(e) => handleChange("loanDetails", e.target.value)}
              placeholder={t("enter_loan_details")}
              rows={2}
              fullWidth
            />
          </div>
        </div>

        {/* Summary Preview */}
        {formData.loanAmount > 0 && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
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
          </div>
        )}

        <div className="flex justify-end gap-3 mt-8">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting || isLoading}>
            {t("cancel")}
          </Button>
          <Button
            variant="primary"
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 px-8"
            isLoading={isSubmitting || isLoading}
            disabled={isSubmitting || isLoading}
          >
            {loanToEdit ? t("save") : t("add_loan")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};