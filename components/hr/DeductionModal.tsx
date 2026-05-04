import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, User, Building2, MapPin, Calendar, DollarSign, AlertCircle } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select } from "../../components/ui/Common";
import { DeductionRecord } from "../../types";
import { useData } from "../../context/DataContext";

interface DeductionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<DeductionRecord>) => Promise<void>;
  recordToEdit?: DeductionRecord | null;
  isLoading?: boolean;
}

export const DeductionModal: React.FC<DeductionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  recordToEdit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const { employees, companies, branches } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    employeeInfo: "",
    company: "",
    branch: "",
    date: new Date().toISOString().split("T")[0],
    absence: 0,
    lateArrival: 0,
    earlyLeave: 0,
    loan: 0,
    penaltiesDeduction: 0,
  });

  useEffect(() => {
    if (recordToEdit && isOpen) {
      const employeeId = typeof recordToEdit.employeeInfo === "object"
        ? (recordToEdit.employeeInfo as any)?._id
        : recordToEdit.employeeInfo;
      const companyId = typeof recordToEdit.company === "object"
        ? (recordToEdit.company as any)?._id
        : recordToEdit.company;
      const branchId = typeof recordToEdit.branch === "object"
        ? (recordToEdit.branch as any)?._id
        : recordToEdit.branch;

      setFormData({
        employeeInfo: employeeId || "",
        company: companyId || "",
        branch: branchId || "",
        date: recordToEdit.date
          ? new Date(recordToEdit.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        absence: recordToEdit.absence || 0,
        lateArrival: recordToEdit.lateArrival || 0,
        earlyLeave: recordToEdit.earlyLeave || 0,
        loan: recordToEdit.loan || 0,
        penaltiesDeduction: recordToEdit.penaltiesDeduction || 0,
      });
    } else if (!recordToEdit && isOpen) {
      setFormData({
        employeeInfo: "",
        company: "",
        branch: "",
        date: new Date().toISOString().split("T")[0],
        absence: 0,
        lateArrival: 0,
        earlyLeave: 0,
        loan: 0,
        penaltiesDeduction: 0,
      });
    }
  }, [recordToEdit, isOpen]);

  // Auto-fill company and branch when employee is selected
  const handleEmployeeChange = (employeeId: string) => {
    const employee = employees.find(e => (e._id || e.id) === employeeId);
    if (employee) {
      setFormData(prev => ({
        ...prev,
        employeeInfo: employeeId,
        company: typeof employee.companyId === "object"
          ? (employee.companyId as any)?._id || ""
          : employee.companyId || "",
        branch: typeof employee.branchId === "object"
          ? (employee.branchId as any)?._id || ""
          : employee.branchId || "",
      }));
    } else {
      setFormData(prev => ({ ...prev, employeeInfo: employeeId }));
    }
  };

  const employeeOptions = employees.map(emp => ({
    value: emp._id || emp.id,
    label: `${emp.fullName} (${emp.employeeCode})`,
  }));

  const companyOptions = companies.map(c => ({
    value: c._id || c.id,
    label: c.name,
  }));

  const branchOptions = branches.map(b => ({
    value: b._id || b.id,
    label: b.name,
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

  const totalDeductions = formData.absence + formData.lateArrival + formData.earlyLeave + formData.loan + formData.penaltiesDeduction;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {recordToEdit ? <Edit2 size={20} /> : <Plus size={20} />}
          {recordToEdit ? t("edit_deductions") : t("add_deductions")}
        </div>
      }
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Employee */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("employee")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.employeeInfo}
              onChange={(e) => handleEmployeeChange(e.target.value)}
              options={employeeOptions}
              placeholder={t("select_employee")}
              required
              fullWidth
            />
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

          {/* Company */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("company")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.company}
              onChange={(e) => handleChange("company", e.target.value)}
              options={companyOptions}
              placeholder={t("select_company")}
              required
              fullWidth
            />
          </div>

          {/* Branch */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("branch")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.branch}
              onChange={(e) => handleChange("branch", e.target.value)}
              options={branchOptions}
              placeholder={t("select_branch")}
              required
              fullWidth
            />
          </div>
        </div>

        {/* Deductions Section */}
        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign size={18} className="text-red-600" />
            {t("deduction_details")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
            <Input
              label={t("absence")}
              type="number"
              value={formData.absence}
              onChange={(e) => handleChange("absence", Number(e.target.value))}
              placeholder="0"
              fullWidth
            />
            <Input
              label={t("late_arrival")}
              type="number"
              value={formData.lateArrival}
              onChange={(e) => handleChange("lateArrival", Number(e.target.value))}
              placeholder="0"
              fullWidth
            />
            <Input
              label={t("early_leave")}
              type="number"
              value={formData.earlyLeave}
              onChange={(e) => handleChange("earlyLeave", Number(e.target.value))}
              placeholder="0"
              fullWidth
            />
            <Input
              label={t("loan")}
              type="number"
              value={formData.loan}
              onChange={(e) => handleChange("loan", Number(e.target.value))}
              placeholder="0"
              fullWidth
            />
            <Input
              label={t("penalties")}
              type="number"
              value={formData.penaltiesDeduction}
              onChange={(e) => handleChange("penaltiesDeduction", Number(e.target.value))}
              placeholder="0"
              fullWidth
            />
          </div>
        </div>

        {/* Total Summary */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 border border-red-100">
          <div className="flex justify-between items-center">
            <span className="text-base font-semibold text-gray-700">{t("total_deductions")}</span>
            <span className="text-2xl font-bold text-red-600">{totalDeductions.toLocaleString()} EGP</span>
          </div>
        </div>

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
            {recordToEdit ? t("save") : t("add_deductions")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};