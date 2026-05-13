import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, User, Building2, MapPin, Calendar, DollarSign, AlertCircle } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select } from "../../components/ui/Common";
import { DeductionRecord } from "../../types";
import { useData } from "../../context/DataContext";
import { toast } from "sonner";

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

  // Filter branches based on selected company
  const filteredBranches = useMemo(() => {
    if (!formData.company) return [];
    return branches.filter(branch => {
      const branchCompanyId = extractId(branch.companyId);
      return branchCompanyId === formData.company;
    });
  }, [branches, formData.company, extractId]);

  useEffect(() => {
    if (recordToEdit && isOpen) {
      const employeeId = extractId(recordToEdit.employeeInfo);
      const companyId = extractId(recordToEdit.company);
      const branchId = extractId(recordToEdit.branch);

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
  }, [recordToEdit, isOpen, extractId]);

  // Auto-fill company and branch when employee is selected
  const handleEmployeeChange = (employeeId: string) => {
    const employee = employees.find(e => extractId(e) === employeeId);
    if (employee) {
      const companyId = extractId(employee.companyId);
      const branchId = extractId(employee.branchId);
      
      setFormData(prev => ({
        ...prev,
        employeeInfo: employeeId,
        company: companyId || "",
        branch: branchId || "",
      }));
    } else {
      setFormData(prev => ({ ...prev, employeeInfo: employeeId }));
    }
  };

  // Reset branch when company changes
  const handleCompanyChange = (companyId: string) => {
    setFormData(prev => ({
      ...prev,
      company: companyId,
      branch: "", // Reset branch when company changes
    }));
  };

  const employeeOptions = employees.map(emp => ({
    value: extractId(emp),
    label: `${emp.fullName} (${emp.employeeCode})`,
  }));

  const companyOptions = companies.map(c => ({
    value: extractId(c),
    label: c.name,
  }));

  const branchOptions = filteredBranches.map(b => ({
    value: extractId(b),
    label: b.name,
  }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation
    if (!formData.employeeInfo) {
      toast.error(t("employee_required"));
      return;
    }
    if (!formData.company) {
      toast.error(t("company_required"));
      return;
    }
    if (!formData.branch) {
      toast.error(t("branch_required"));
      return;
    }
    if (!formData.date) {
      toast.error(t("date_required"));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const saveData = {
        employeeInfo: formData.employeeInfo,
        company: formData.company,
        branch: formData.branch,
        date: formData.date,
        absence: formData.absence,
        lateArrival: formData.lateArrival,
        earlyLeave: formData.earlyLeave,
        loan: formData.loan,
        penaltiesDeduction: formData.penaltiesDeduction,
      };
      
      console.log("Saving deduction:", saveData);
      await onSave(saveData);
      onClose();
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error(t("failed_to_save_deduction"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const totalDeductions = formData.absence + formData.lateArrival + formData.earlyLeave + formData.loan + formData.penaltiesDeduction;

  // Get selected employee details for display
  const selectedEmployee = employees.find(e => extractId(e) === formData.employeeInfo);
  const selectedCompany = companies.find(c => extractId(c) === formData.company);
  const selectedBranch = branches.find(b => extractId(b) === formData.branch);

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
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto px-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Employee */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("employee")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Select
                value={formData.employeeInfo}
                onChange={(e) => handleEmployeeChange(e.target.value)}
                options={employeeOptions}
                placeholder={t("select_employee")}
                required
                fullWidth
                className="pl-10"
                disabled={!!recordToEdit}
              />
            </div>
            {selectedEmployee && (
              <p className="text-xs text-gray-500 mt-1">
                {selectedEmployee.jobId?.jobName || ""}
              </p>
            )}
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

          {/* Company */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("company")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building2 size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Select
                value={formData.company}
                onChange={(e) => handleCompanyChange(e.target.value)}
                options={companyOptions}
                placeholder={t("select_company")}
                required
                fullWidth
                className="pl-10"
                disabled={!!recordToEdit}
              />
            </div>
          </div>

          {/* Branch - Filtered by company */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("branch")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Select
                value={formData.branch}
                onChange={(e) => handleChange("branch", e.target.value)}
                options={branchOptions}
                placeholder={formData.company ? t("select_branch") : t("select_company_first")}
                required
                fullWidth
                className="pl-10"
                disabled={!formData.company || !!recordToEdit}
              />
            </div>
            {formData.company && branchOptions.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                {t("no_branches_available_for_this_company")}
              </p>
            )}
          </div>
        </div>

        {/* Deductions Section */}
        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign size={18} className="text-red-600" />
            {t("deduction_details")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("absence")} (EGP)
              </label>
              <div className="relative">
                <DollarSign size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="number"
                  min="0"
                  value={formData.absence}
                  onChange={(e) => handleChange("absence", Number(e.target.value))}
                  placeholder="0"
                  fullWidth
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("late_arrival")} (EGP)
              </label>
              <div className="relative">
                <DollarSign size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="number"
                  min="0"
                  value={formData.lateArrival}
                  onChange={(e) => handleChange("lateArrival", Number(e.target.value))}
                  placeholder="0"
                  fullWidth
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("early_leave")} (EGP)
              </label>
              <div className="relative">
                <DollarSign size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="number"
                  min="0"
                  value={formData.earlyLeave}
                  onChange={(e) => handleChange("earlyLeave", Number(e.target.value))}
                  placeholder="0"
                  fullWidth
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("loan")} (EGP)
              </label>
              <div className="relative">
                <DollarSign size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="number"
                  min="0"
                  value={formData.loan}
                  onChange={(e) => handleChange("loan", Number(e.target.value))}
                  placeholder="0"
                  fullWidth
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("penalties")} (EGP)
              </label>
              <div className="relative">
                <DollarSign size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="number"
                  min="0"
                  value={formData.penaltiesDeduction}
                  onChange={(e) => handleChange("penaltiesDeduction", Number(e.target.value))}
                  placeholder="0"
                  fullWidth
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Total Summary */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 border border-red-100">
          <div className="flex justify-between items-center">
            <span className="text-base font-semibold text-gray-700">{t("total_deductions")}</span>
            <span className="text-2xl font-bold text-red-600">{totalDeductions.toLocaleString()} EGP</span>
          </div>
        </div>

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
            {recordToEdit ? t("update_deductions") : t("add_deductions")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};