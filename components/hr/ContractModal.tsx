import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, User, Building2, Calendar, DollarSign, FileText, Clock, Briefcase } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { Contract } from "../../types";
import { useData } from "../../context/DataContext";

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Contract>) => Promise<void>;
  contractToEdit?: Contract | null;
  isLoading?: boolean;
}

export const ContractModal: React.FC<ContractModalProps> = ({
  isOpen,
  onClose,
  onSave,
  contractToEdit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const { employees, branches } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: "",
    contractId: "",
    contractType: "Saudi",
    duration: "1 Year",
    jobTitle: "",
    branch: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    workingHours: "Full Time",
    allowances: 0,
    basicSalary: 0,
    state: "Active",
  });

  useEffect(() => {
    if (contractToEdit && isOpen) {
      const employeeId = typeof contractToEdit.employeeInfo === "object"
        ? (contractToEdit.employeeInfo as any)?._id
        : contractToEdit.employeeId;
      const branchId = typeof contractToEdit.branch === "object"
        ? (contractToEdit.branch as any)?._id
        : contractToEdit.branch;

      setFormData({
        employeeId: employeeId || "",
        contractId: contractToEdit.contractId || `CON-${Date.now().toString().slice(-5)}`,
        contractType: contractToEdit.contractType || "Saudi",
        duration: contractToEdit.duration || "1 Year",
        jobTitle: contractToEdit.jobTitle || "",
        branch: branchId || "",
        startDate: contractToEdit.startDate
          ? new Date(contractToEdit.startDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        endDate: contractToEdit.endDate
          ? new Date(contractToEdit.endDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        workingHours: contractToEdit.workingHours || "Full Time",
        allowances: contractToEdit.allowances || 0,
        basicSalary: contractToEdit.basicSalary || 0,
        state: contractToEdit.state || "Active",
      });
    } else if (!contractToEdit && isOpen) {
      const randomNum = Math.floor(Math.random() * 10000).toString().padStart(5, '0');
      setFormData({
        employeeId: "",
        contractId: `CON-${randomNum}`,
        contractType: "Saudi",
        duration: "1 Year",
        jobTitle: "",
        branch: branches.length > 0 ? (branches[0]._id || branches[0].id) : "",
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
        workingHours: "Full Time",
        allowances: 0,
        basicSalary: 0,
        state: "Active",
      });
    }
  }, [contractToEdit, isOpen, branches]);

  const contractTypeOptions = [
    { value: "Saudi", label: t("saudi_contract") },
    { value: "Expat", label: t("expat_contract") },
    { value: "Freelance", label: t("freelance_contract") },
    { value: "Part-time", label: t("part_time_contract") },
  ];

  const workingHoursOptions = [
    { value: "Full Time", label: t("full_time") },
    { value: "Part Time", label: t("part_time") },
    { value: "Flexible", label: t("flexible") },
  ];

  const stateOptions = [
    { value: "Active", label: t("active") },
    { value: "Expired", label: t("expired") },
    { value: "Under Renewal", label: t("under_renewal") },
    { value: "Renewal Pending", label: t("renewal_pending") },
  ];

  const durationOptions = [
    { value: "1 Year", label: "1 Year" },
    { value: "2 Years", label: "2 Years" },
    { value: "3 Years", label: "3 Years" },
    { value: "5 Years", label: "5 Years" },
    { value: "Indefinite", label: t("indefinite") },
  ];

  const employeeOptions = employees.map(emp => ({
    value: emp._id || emp.id,
    label: `${emp.fullName} (${emp.employeeCode})`,
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

  const totalSalary = (formData.basicSalary || 0) + (formData.allowances || 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {contractToEdit ? <Edit2 size={20} /> : <Plus size={20} />}
          {contractToEdit ? t("edit_contract") : t("add_contract")}
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
              value={formData.employeeId}
              onChange={(e) => handleChange("employeeId", e.target.value)}
              options={employeeOptions}
              placeholder={t("select_employee")}
              required
              fullWidth
            />
          </div>

          {/* Contract ID */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("contract_id")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.contractId}
              onChange={(e) => handleChange("contractId", e.target.value)}
              placeholder="CON-001"
              required
              fullWidth
            />
          </div>

          {/* Contract Type */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("contract_type")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.contractType}
              onChange={(e) => handleChange("contractType", e.target.value)}
              options={contractTypeOptions}
              required
              fullWidth
            />
          </div>

          {/* Duration */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("duration")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.duration}
              onChange={(e) => handleChange("duration", e.target.value)}
              options={durationOptions}
              required
              fullWidth
            />
          </div>

          {/* Job Title */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("job_title")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.jobTitle}
              onChange={(e) => handleChange("jobTitle", e.target.value)}
              placeholder={t("enter_job_title")}
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

          {/* Start Date */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("start_date")} <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleChange("startDate", e.target.value)}
              required
              fullWidth
            />
          </div>

          {/* End Date */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("end_date")} <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={formData.endDate}
              onChange={(e) => handleChange("endDate", e.target.value)}
              required
              fullWidth
            />
          </div>

          {/* Working Hours */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("working_hours")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.workingHours}
              onChange={(e) => handleChange("workingHours", e.target.value)}
              options={workingHoursOptions}
              required
              fullWidth
            />
          </div>

          {/* Basic Salary */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("basic_salary")} (EGP) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.basicSalary}
              onChange={(e) => handleChange("basicSalary", Number(e.target.value))}
              placeholder="0.00"
              required
              fullWidth
            />
          </div>

          {/* Allowances */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("allowances")} (EGP) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.allowances}
              onChange={(e) => handleChange("allowances", Number(e.target.value))}
              placeholder="0.00"
              required
              fullWidth
            />
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("status")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.state}
              onChange={(e) => handleChange("state", e.target.value)}
              options={stateOptions}
              required
              fullWidth
            />
          </div>
        </div>

        {/* Summary Preview */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <DollarSign size={16} className="text-indigo-600" />
            {t("salary_summary")}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-500">{t("basic_salary")}</p>
              <p className="text-sm font-bold text-indigo-600">{formData.basicSalary.toLocaleString()} EGP</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("allowances")}</p>
              <p className="text-sm font-bold text-green-600">{formData.allowances.toLocaleString()} EGP</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("total_salary")}</p>
              <p className="text-lg font-bold text-purple-600">{totalSalary.toLocaleString()} EGP</p>
            </div>
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
            {contractToEdit ? t("save") : t("add_contract")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};