import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, User, Building2, Calendar, DollarSign, FileText, Clock, Briefcase } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { Contract } from "../../types";
import { useData } from "../../context/DataContext";
import { toast } from "sonner";

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
    employeeInfo: "",      // Changed from employeeId to employeeInfo
    contractId: "",
    contractType: "Saudi",
    duration: "1 Year",
    jobTitle: "",
    branch: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    workingHours: "Full Time",
    allowances: "0",       // Changed to string
    basicSalary: 0,
    state: "Active",
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

  // Generate contract ID
  const generateContractId = useCallback(() => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `CON-${timestamp}`;
  }, []);

  useEffect(() => {
    if (contractToEdit && isOpen) {
      // Extract employee ID from employeeInfo or employeeId
      let employeeInfoValue = "";
      if (contractToEdit.employeeInfo) {
        if (typeof contractToEdit.employeeInfo === 'object') {
          employeeInfoValue = extractId(contractToEdit.employeeInfo);
        } else {
          employeeInfoValue = contractToEdit.employeeInfo;
        }
      } else if (contractToEdit.employeeId) {
        if (typeof contractToEdit.employeeId === 'object') {
          employeeInfoValue = extractId(contractToEdit.employeeId);
        } else {
          employeeInfoValue = contractToEdit.employeeId;
        }
      }
      
      // Extract branch ID
      let branchValue = "";
      if (contractToEdit.branch) {
        if (typeof contractToEdit.branch === 'object') {
          branchValue = extractId(contractToEdit.branch);
        } else {
          branchValue = contractToEdit.branch;
        }
      }
      
      // Convert allowances to string
      const allowancesValue = contractToEdit.allowances ? String(contractToEdit.allowances) : "0";

      setFormData({
        employeeInfo: employeeInfoValue || "",
        contractId: contractToEdit.contractId || generateContractId(),
        contractType: contractToEdit.contractType || "Saudi",
        duration: contractToEdit.duration || "1 Year",
        jobTitle: contractToEdit.jobTitle || "",
        branch: branchValue || "",
        startDate: contractToEdit.startDate
          ? new Date(contractToEdit.startDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        endDate: contractToEdit.endDate
          ? new Date(contractToEdit.endDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        workingHours: contractToEdit.workingHours || "Full Time",
        allowances: allowancesValue,
        basicSalary: contractToEdit.basicSalary || 0,
        state: contractToEdit.state || "Active",
      });
    } else if (!contractToEdit && isOpen) {
      setFormData({
        employeeInfo: "",
        contractId: generateContractId(),
        contractType: "Saudi",
        duration: "1 Year",
        jobTitle: "",
        branch: "",
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
        workingHours: "Full Time",
        allowances: "0",
        basicSalary: 0,
        state: "Active",
      });
    }
  }, [contractToEdit, isOpen, extractId, generateContractId]);

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
    value: extractId(emp),
    label: `${emp.fullName} (${emp.employeeCode})`,
  }));

  const branchOptions = branches.map(b => ({
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
    if (!formData.contractId) {
      toast.error(t("contract_id_required"));
      return;
    }
    if (!formData.jobTitle) {
      toast.error(t("job_title_required"));
      return;
    }
    if (!formData.branch) {
      toast.error(t("branch_required"));
      return;
    }
    if (formData.basicSalary <= 0) {
      toast.error(t("basic_salary_positive"));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare data according to API expectations
      const saveData: any = {
        employeeInfo: formData.employeeInfo,
        contractId: formData.contractId,
        contractType: formData.contractType,
        duration: formData.duration,
        jobTitle: formData.jobTitle,
        branch: formData.branch,
        startDate: formData.startDate,
        endDate: formData.endDate,
        workingHours: formData.workingHours,
        allowances: formData.allowances, // Send as string
        basicSalary: formData.basicSalary,
        state: formData.state,
      };
      
      // If editing, include the ID
      if (contractToEdit) {
        const contractId = extractId(contractToEdit);
        if (contractId) {
          saveData._id = contractId;
          saveData.id = contractId;
        }
      }
      
      console.log("Saving contract:", saveData);
      await onSave(saveData);
      onClose();
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error(t("failed_to_save_contract"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const totalSalary = (formData.basicSalary || 0) + (parseFloat(formData.allowances) || 0);

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
                onChange={(e) => handleChange("employeeInfo", e.target.value)}
                options={employeeOptions}
                placeholder={t("select_employee")}
                required
                fullWidth
                className="pl-10"
                disabled={!!contractToEdit}
              />
            </div>
          </div>

          {/* Contract ID */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("contract_id")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FileText size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={formData.contractId}
                onChange={(e) => handleChange("contractId", e.target.value)}
                placeholder="CON-001"
                required
                fullWidth
                className="pl-10"
                disabled={!!contractToEdit}
              />
            </div>
          </div>

          {/* Contract Type */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("contract_type")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FileText size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Select
                value={formData.contractType}
                onChange={(e) => handleChange("contractType", e.target.value)}
                options={contractTypeOptions}
                required
                fullWidth
                className="pl-10"
              />
            </div>
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
            <div className="relative">
              <Briefcase size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={formData.jobTitle}
                onChange={(e) => handleChange("jobTitle", e.target.value)}
                placeholder={t("enter_job_title")}
                required
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Branch */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("branch")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building2 size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Select
                value={formData.branch}
                onChange={(e) => handleChange("branch", e.target.value)}
                options={branchOptions}
                placeholder={t("select_branch")}
                required
                fullWidth
                className="pl-10"
                disabled={!!contractToEdit}
              />
            </div>
          </div>

          {/* Start Date */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("start_date")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
                required
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* End Date */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("end_date")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleChange("endDate", e.target.value)}
                required
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Working Hours */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("working_hours")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Clock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Select
                value={formData.workingHours}
                onChange={(e) => handleChange("workingHours", e.target.value)}
                options={workingHoursOptions}
                required
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Basic Salary */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("basic_salary")} (EGP) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <DollarSign size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.basicSalary}
                onChange={(e) => handleChange("basicSalary", Number(e.target.value))}
                placeholder="0.00"
                required
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Allowances (as string) */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("allowances")} (EGP) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <DollarSign size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.allowances}
                onChange={(e) => handleChange("allowances", e.target.value)}
                placeholder="0.00"
                required
                fullWidth
                className="pl-10"
              />
            </div>
            <p className="text-xs text-gray-500">{t("allowances_description")}</p>
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
              <p className="text-sm font-bold text-green-600">{parseFloat(formData.allowances).toLocaleString()} EGP</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("total_salary")}</p>
              <p className="text-lg font-bold text-purple-600">{totalSalary.toLocaleString()} EGP</p>
            </div>
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
            {contractToEdit ? t("update_contract") : t("add_contract")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};