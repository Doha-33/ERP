import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { PlusCircle, Edit2, Users, Calculator, DollarSign } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { Payroll, Employee } from "../../types";
import { useData } from "../../context/DataContext";
import { toast } from "sonner";

interface PayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: Partial<Payroll>) => Promise<void>;
  recordToEdit?: Payroll | null;
  isLoading?: boolean;
}

interface Deductions {
  absence: number;
  lateArrival: number;
  earlyLeave: number;
  loan: number;
  penalties: number;
  other: number;
}

export const PayrollModal: React.FC<PayrollModalProps> = ({
  isOpen,
  onClose,
  onSave,
  recordToEdit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const { employees } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: "",
    payrollMonth: new Date().getMonth() + 1,
    payrollYear: new Date().getFullYear(),
    basicSalary: 0,
    housingAllowance: 0,
    transportAllowance: 0,
    workNatureAllowance: 0,
    medicalAllowance: 0,
    commissions: 0,
    bonus: 0,
    overtimeHours: 0,
    overtimeRate: 50,
    overtimeAmount: 0,
    deductions: {
      absence: 0,
      lateArrival: 0,
      earlyLeave: 0,
      loan: 0,
      penalties: 0,
      other: 0,
    },
    totalDeductions: 0,
    totalAllowances: 0,
    grossSalary: 0,
    netSalary: 0,
    status: "DRAFT",
    notes: "",
  });
  const extractId = useCallback((value: any): string => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      if (value._id && typeof value._id === "string") return value._id;
      if (value.id && typeof value.id === "string") return value.id;
    }
    return "";
  }, []);
  useEffect(() => {
    if (recordToEdit && isOpen) {
      const employeeId = extractId(recordToEdit.employeeId);
      setFormData({
        employeeId: employeeId || "",
        payrollMonth: recordToEdit.payrollMonth,
        payrollYear: recordToEdit.payrollYear,
        basicSalary: recordToEdit.basicSalary || 0,
        housingAllowance: recordToEdit.housingAllowance || 0,
        transportAllowance: recordToEdit.transportAllowance || 0,
        workNatureAllowance: recordToEdit.workNatureAllowance || 0,
        medicalAllowance: recordToEdit.medicalAllowance || 0,
        commissions: recordToEdit.commissions || 0,
        bonus: recordToEdit.bonus || 0,
        overtimeHours: recordToEdit.overtimeHours || 0,
        overtimeRate: recordToEdit.overtimeRate || 50,
        overtimeAmount: recordToEdit.overtimeAmount || 0,
        deductions: recordToEdit.deductions || {
          absence: 0,
          lateArrival: 0,
          earlyLeave: 0,
          loan: 0,
          penalties: 0,
          other: 0,
        },
        totalDeductions: recordToEdit.totalDeductions || 0,
        totalAllowances: recordToEdit.totalAllowances || 0,
        grossSalary: recordToEdit.grossSalary || 0,
        netSalary: recordToEdit.netSalary || 0,
        status: recordToEdit.status || "DRAFT",
        notes: recordToEdit.notes || "",
      });
    } else if (!recordToEdit && isOpen) {
      setFormData({
        employeeId: "",
        payrollMonth: new Date().getMonth() + 1,
        payrollYear: new Date().getFullYear(),
        basicSalary: 0,
        housingAllowance: 0,
        transportAllowance: 0,
        workNatureAllowance: 0,
        medicalAllowance: 0,
        commissions: 0,
        bonus: 0,
        overtimeHours: 0,
        overtimeRate: 50,
        overtimeAmount: 0,
        deductions: {
          absence: 0,
          lateArrival: 0,
          earlyLeave: 0,
          loan: 0,
          penalties: 0,
          other: 0,
        },
        totalDeductions: 0,
        totalAllowances: 0,
        grossSalary: 0,
        netSalary: 0,
        status: "DRAFT",
        notes: "",
      });
    }
  }, [recordToEdit, isOpen]);

  // Calculate totals whenever relevant fields change
  useEffect(() => {
    const totalAllowances =
      formData.housingAllowance +
      formData.transportAllowance +
      formData.workNatureAllowance +
      formData.medicalAllowance +
      formData.commissions +
      formData.bonus +
      formData.overtimeAmount;

    const totalDeductions = Object.values(formData.deductions).reduce(
      (sum, val) => sum + val,
      0,
    );
    const grossSalary = formData.basicSalary + totalAllowances;
    const netSalary = grossSalary - totalDeductions;

    setFormData((prev) => ({
      ...prev,
      totalAllowances,
      totalDeductions,
      grossSalary,
      netSalary,
    }));
  }, [
    formData.basicSalary,
    formData.housingAllowance,
    formData.transportAllowance,
    formData.workNatureAllowance,
    formData.medicalAllowance,
    formData.commissions,
    formData.bonus,
    formData.overtimeAmount,
    formData.deductions,
  ]);

  // Calculate overtime amount when hours or rate changes
  useEffect(() => {
    const overtimeAmount = formData.overtimeHours * formData.overtimeRate;
    setFormData((prev) => ({ ...prev, overtimeAmount }));
  }, [formData.overtimeHours, formData.overtimeRate]);

  const employeeOptions = [
    { value: "", label: t("all_active_employees") },
    ...employees.map((emp) => ({
      value: extractId(emp),
      label: `${emp.fullName} (${emp.employeeCode})`,
    })),
  ];

  const monthOptions = [
    { value: 1, label: t("january") },
    { value: 2, label: t("february") },
    { value: 3, label: t("march") },
    { value: 4, label: t("april") },
    { value: 5, label: t("may") },
    { value: 6, label: t("june") },
    { value: 7, label: t("july") },
    { value: 8, label: t("august") },
    { value: 9, label: t("september") },
    { value: 10, label: t("october") },
    { value: 11, label: t("november") },
    { value: 12, label: t("december") },
  ];

  const yearOptions = [2023, 2024, 2025, 2026, 2027].map((y) => ({
    value: y,
    label: String(y),
  }));
  const statusOptions = [
    { value: "DRAFT", label: t("draft") },
    { value: "PAID", label: t("paid") },
  ];

  // في PayrollModal، تحديث handleSubmit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // If editing, ensure we have the ID
      if (recordToEdit) {
        const recordId = extractId(recordToEdit);
        if (!recordId) {
          toast.error(t("payroll_id_missing"));
          return;
        }
        await onSave({ ...formData, _id: recordId });
      } else {
        await onSave(formData);
      }
      onClose();
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error(t("failed_to_save_payroll"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDeductionChange = (field: keyof Deductions, value: number) => {
    setFormData((prev) => ({
      ...prev,
      deductions: { ...prev.deductions, [field]: value },
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {recordToEdit ? <Edit2 size={20} /> : <PlusCircle size={20} />}
          {recordToEdit ? t("edit_payroll") : t("generate_payroll")}
        </div>
      }
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {!recordToEdit && (
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">
                  {t("batch_generation_mode")}
                </p>
                <p className="text-xs text-blue-700 mt-0.5">
                  {t("batch_generation_description")}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Employee */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("employee")}{" "}
              {!recordToEdit && <span className="text-red-500">*</span>}
            </label>
            <Select
              value={formData.employeeId}
              onChange={(e) => handleChange("employeeId", e.target.value)}
              options={employeeOptions}
              placeholder={t("select_employee")}
              disabled={!!recordToEdit}
              required={!recordToEdit}
              fullWidth
            />
          </div>

          {/* Month & Year */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("month")} <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.payrollMonth}
                onChange={(e) =>
                  handleChange("payrollMonth", Number(e.target.value))
                }
                options={monthOptions}
                required
                fullWidth
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("year")} <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.payrollYear}
                onChange={(e) =>
                  handleChange("payrollYear", Number(e.target.value))
                }
                options={yearOptions}
                required
                fullWidth
              />
            </div>
          </div>
        </div>

        {recordToEdit && (
          <>
            {/* Allowances Section */}
            <div className="border-t border-gray-100 pt-4">
              <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign size={18} className="text-green-600" />
                {t("allowances")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
                <Input
                  label={t("basic_salary")}
                  type="number"
                  value={formData.basicSalary}
                  onChange={(e) =>
                    handleChange("basicSalary", Number(e.target.value))
                  }
                  fullWidth
                />
                <Input
                  label={t("housing_allowance")}
                  type="number"
                  value={formData.housingAllowance}
                  onChange={(e) =>
                    handleChange("housingAllowance", Number(e.target.value))
                  }
                  fullWidth
                />
                <Input
                  label={t("transport_allowance")}
                  type="number"
                  value={formData.transportAllowance}
                  onChange={(e) =>
                    handleChange("transportAllowance", Number(e.target.value))
                  }
                  fullWidth
                />
                <Input
                  label={t("work_nature_allowance")}
                  type="number"
                  value={formData.workNatureAllowance}
                  onChange={(e) =>
                    handleChange("workNatureAllowance", Number(e.target.value))
                  }
                  fullWidth
                />
                <Input
                  label={t("medical_allowance")}
                  type="number"
                  value={formData.medicalAllowance}
                  onChange={(e) =>
                    handleChange("medicalAllowance", Number(e.target.value))
                  }
                  fullWidth
                />
                <Input
                  label={t("commissions")}
                  type="number"
                  value={formData.commissions}
                  onChange={(e) =>
                    handleChange("commissions", Number(e.target.value))
                  }
                  fullWidth
                />
                <Input
                  label={t("bonus")}
                  type="number"
                  value={formData.bonus}
                  onChange={(e) =>
                    handleChange("bonus", Number(e.target.value))
                  }
                  fullWidth
                />
                <Input
                  label={t("overtime_hours")}
                  type="number"
                  value={formData.overtimeHours}
                  onChange={(e) =>
                    handleChange("overtimeHours", Number(e.target.value))
                  }
                  fullWidth
                />
                <Input
                  label={t("overtime_rate")}
                  type="number"
                  value={formData.overtimeRate}
                  onChange={(e) =>
                    handleChange("overtimeRate", Number(e.target.value))
                  }
                  fullWidth
                />
                <Input
                  label={t("overtime_amount")}
                  type="number"
                  value={formData.overtimeAmount}
                  disabled
                  fullWidth
                />
              </div>
            </div>

            {/* Deductions Section */}
            <div className="border-t border-gray-100 pt-4">
              <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calculator size={18} className="text-red-600" />
                {t("deductions")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
                <Input
                  label={t("absence_deduction")}
                  type="number"
                  value={formData.deductions.absence}
                  onChange={(e) =>
                    handleDeductionChange("absence", Number(e.target.value))
                  }
                  fullWidth
                />
                <Input
                  label={t("late_arrival_deduction")}
                  type="number"
                  value={formData.deductions.lateArrival}
                  onChange={(e) =>
                    handleDeductionChange("lateArrival", Number(e.target.value))
                  }
                  fullWidth
                />
                <Input
                  label={t("early_leave_deduction")}
                  type="number"
                  value={formData.deductions.earlyLeave}
                  onChange={(e) =>
                    handleDeductionChange("earlyLeave", Number(e.target.value))
                  }
                  fullWidth
                />
                <Input
                  label={t("loan_deduction")}
                  type="number"
                  value={formData.deductions.loan}
                  onChange={(e) =>
                    handleDeductionChange("loan", Number(e.target.value))
                  }
                  fullWidth
                />
                <Input
                  label={t("penalties_deduction")}
                  type="number"
                  value={formData.deductions.penalties}
                  onChange={(e) =>
                    handleDeductionChange("penalties", Number(e.target.value))
                  }
                  fullWidth
                />
                <Input
                  label={t("other_deductions")}
                  type="number"
                  value={formData.deductions.other}
                  onChange={(e) =>
                    handleDeductionChange("other", Number(e.target.value))
                  }
                  fullWidth
                />
              </div>
            </div>

            {/* Summary Section */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {t("total_allowances")}
                </span>
                <span className="text-sm font-semibold text-green-600">
                  {formData.totalAllowances.toLocaleString()} EGP
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {t("total_deductions")}
                </span>
                <span className="text-sm font-semibold text-red-600">
                  {formData.totalDeductions.toLocaleString()} EGP
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-base font-bold text-gray-900">
                  {t("gross_salary")}
                </span>
                <span className="text-base font-bold text-gray-900">
                  {formData.grossSalary.toLocaleString()} EGP
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-indigo-600">
                  {t("net_salary")}
                </span>
                <span className="text-lg font-bold text-indigo-600">
                  {formData.netSalary.toLocaleString()} EGP
                </span>
              </div>
            </div>

            {/* Status & Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <Select
                label={t("status")}
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
                options={statusOptions}
                fullWidth
              />
              <TextArea
                label={t("notes")}
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder={t("enter_notes")}
                rows={2}
                fullWidth
              />
            </div>
          </>
        )}

        <div className="flex justify-end gap-3 mt-8">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting || isLoading}
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
            {recordToEdit ? t("save") : t("generate_payroll")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
