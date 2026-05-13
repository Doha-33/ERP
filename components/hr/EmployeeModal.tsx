import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  UserPlus,
  Edit2,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  Building2,
  CreditCard,
  Hash,
  Flag,
  Heart,
} from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select } from "../../components/ui/Common";
import { Employee, Department, Job } from "../../types";
import { useData } from "../../context/DataContext";
import { toast } from "sonner";

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  employeeToEdit?: Employee | null;
  isLoading?: boolean;
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  employeeToEdit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const { companies, branches, departments, jobs } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    code: "",                    // Required by API
    employeeCode: "",            // Same as code
    fullName: "",
    email: "",
    phoneNumber: "",
    hireDate: "",
    employeeStatus: "ACTIVE",
    jobGrade: "",
    nationality: "",
    gender: "MALE",
    maritalStatus: "SINGLE",
    address: "",
    companyId: "",
    branchId: "",
    departmentId: "",
    jobId: "",
    // Additional fields from API response
    idNumber: "",
    gosiId: "",
    birthDate: "",
    contractType: "",
    contractStartDate: "",
    contractEndDate: "",
    internalEmployeeNumber: "",
    bankInfo: {
      bankName: "",
      accountNumber: "",
    },
  });

  // Helper function to extract ID
  const extractId = useCallback((value: any): string => {
    if (!value) return "";
    if (typeof value === "object") {
      return value._id || value.id || "";
    }
    return value;
  }, []);

  // Filtered branches based on selected company
  const filteredBranches = useMemo(() => {
    if (!formData.companyId) return [];
    return branches.filter((branch) => {
      const branchCompanyId = extractId(branch.companyId);
      return branchCompanyId === formData.companyId;
    });
  }, [branches, formData.companyId, extractId]);

  // Filtered departments based on selected company
  const filteredDepartments = useMemo(() => {
    if (!formData.companyId) return [];
    return departments.filter((dept) => {
      const deptCompanyId = extractId(dept.companyId);
      return deptCompanyId === formData.companyId;
    });
  }, [departments, formData.companyId, extractId]);

  // Filtered jobs based on selected department
  const filteredJobs = useMemo(() => {
    if (!formData.departmentId) return [];
    return jobs.filter((job) => {
      const jobDepartmentId = extractId(job.departmentId);
      return jobDepartmentId === formData.departmentId;
    });
  }, [jobs, formData.departmentId, extractId]);

  // Generate employee code automatically
  const generateEmployeeCode = useCallback(() => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `EMP-${timestamp}-${random}`;
  }, []);

  useEffect(() => {
    if (employeeToEdit && isOpen) {
      // Get IDs from objects safely using extractId
      const companyId = extractId(employeeToEdit.companyId);
      const branchId = extractId(employeeToEdit.branchId);
      const departmentId = extractId(employeeToEdit.departmentId);
      const jobId = extractId(employeeToEdit.jobId);
      
      // Get bank info
      const bankInfo = (employeeToEdit as any).bankInfo || { bankName: "", accountNumber: "" };

      setFormData({
        code: employeeToEdit.employeeCode || employeeToEdit.code || "",
        employeeCode: employeeToEdit.employeeCode || employeeToEdit.code || "",
        fullName: employeeToEdit.fullName || "",
        email: employeeToEdit.email || "",
        phoneNumber: employeeToEdit.phoneNumber || "",
        hireDate: employeeToEdit.hireDate ? employeeToEdit.hireDate.split('T')[0] : "",
        employeeStatus: employeeToEdit.employeeStatus || "ACTIVE",
        jobGrade: employeeToEdit.jobGrade || "",
        nationality: employeeToEdit.nationality || "",
        gender: employeeToEdit.gender || "MALE",
        maritalStatus: employeeToEdit.maritalStatus || "SINGLE",
        address: employeeToEdit.address || "",
        companyId: companyId,
        branchId: branchId,
        departmentId: departmentId,
        jobId: jobId,
        // Additional fields
        idNumber: (employeeToEdit as any).idNumber || "",
        gosiId: (employeeToEdit as any).gosiId || "",
        birthDate: (employeeToEdit as any).birthDate ? (employeeToEdit as any).birthDate.split('T')[0] : "",
        contractType: (employeeToEdit as any).contractType || "",
        contractStartDate: (employeeToEdit as any).contractStartDate ? (employeeToEdit as any).contractStartDate.split('T')[0] : "",
        contractEndDate: (employeeToEdit as any).contractEndDate ? (employeeToEdit as any).contractEndDate.split('T')[0] : "",
        internalEmployeeNumber: (employeeToEdit as any).internalEmployeeNumber || "",
        bankInfo: {
          bankName: bankInfo.bankName || "",
          accountNumber: bankInfo.accountNumber || "",
        },
      });
    } else if (!employeeToEdit && isOpen) {
      const newCode = generateEmployeeCode();
      setFormData({
        code: newCode,
        employeeCode: newCode,
        fullName: "",
        email: "",
        phoneNumber: "",
        hireDate: "",
        employeeStatus: "ACTIVE",
        jobGrade: "",
        nationality: "",
        gender: "MALE",
        maritalStatus: "SINGLE",
        address: "",
        companyId: "",
        branchId: "",
        departmentId: "",
        jobId: "",
        idNumber: "",
        gosiId: "",
        birthDate: "",
        contractType: "",
        contractStartDate: "",
        contractEndDate: "",
        internalEmployeeNumber: "",
        bankInfo: {
          bankName: "",
          accountNumber: "",
        },
      });
    }
  }, [employeeToEdit, isOpen, extractId, generateEmployeeCode]);

  // Reset branch, department, job when company changes
  const handleCompanyChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      companyId: value,
      branchId: "",
      departmentId: "",
      jobId: "",
    }));
  };

  // Reset job when department changes
  const handleDepartmentChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      departmentId: value,
      jobId: "",
    }));
  };

  const statusOptions = [
    { value: "ACTIVE", label: t("active") },
    { value: "INACTIVE", label: t("inactive") },
    { value: "ON_LEAVE", label: t("on_leave") },
    { value: "TERMINATED", label: t("terminated") },
  ];

  const genderOptions = [
    { value: "MALE", label: t("male") },
    { value: "FEMALE", label: t("female") },
  ];

  const maritalStatusOptions = [
    { value: "SINGLE", label: t("single") },
    { value: "MARRIED", label: t("married") },
    { value: "DIVORCED", label: t("divorced") },
    { value: "WIDOWED", label: t("widowed") },
  ];

  const contractTypeOptions = [
    { value: "", label: t("select_contract_type") },
    { value: "FULL_TIME", label: t("full_time") },
    { value: "PART_TIME", label: t("part_time") },
    { value: "CONTRACT", label: t("contract") },
    { value: "INTERN", label: t("intern") },
  ];

  const companyOptions = companies.map((c) => ({
    value: extractId(c),
    label: c.name,
  }));

  const branchOptions = filteredBranches.map((b) => ({
    value: extractId(b),
    label: b.name,
  }));

  const departmentOptions = filteredDepartments.map((d) => ({
    value: extractId(d),
    label: d.departmentName,
  }));

  const jobOptions = filteredJobs.map((j) => ({
    value: extractId(j),
    label: j.jobName,
  }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation for required fields
    if (!formData.fullName.trim()) {
      toast.error(t("full_name_required"));
      return;
    }
    if (!formData.email.trim()) {
      toast.error(t("email_required"));
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error(t("invalid_email_format"));
      return;
    }
    if (!formData.phoneNumber.trim()) {
      toast.error(t("phone_required"));
      return;
    }
    if (!formData.companyId) {
      toast.error(t("company_required"));
      return;
    }
    if (!formData.branchId) {
      toast.error(t("branch_required"));
      return;
    }
    if (!formData.jobId) {
      toast.error(t("job_required"));
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data for API - include code field
      const submitData = {
        code: formData.code,
        employeeCode: formData.employeeCode,
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        hireDate: formData.hireDate || undefined,
        employeeStatus: formData.employeeStatus,
        jobGrade: formData.jobGrade || undefined,
        nationality: formData.nationality || undefined,
        gender: formData.gender,
        maritalStatus: formData.maritalStatus,
        address: formData.address || undefined,
        companyId: formData.companyId,
        branchId: formData.branchId,
        departmentId: formData.departmentId || undefined,
        jobId: formData.jobId,
        // Additional fields
        idNumber: formData.idNumber || undefined,
        gosiId: formData.gosiId || undefined,
        birthDate: formData.birthDate || undefined,
        contractType: formData.contractType || undefined,
        contractStartDate: formData.contractStartDate || undefined,
        contractEndDate: formData.contractEndDate || undefined,
        internalEmployeeNumber: formData.internalEmployeeNumber || undefined,
        bankInfo: {
          bankName: formData.bankInfo.bankName || "",
          accountNumber: formData.bankInfo.accountNumber || "",
        },
      };

      console.log("Saving employee:", submitData);
      await onSave(submitData);
      onClose();
    } catch (error) {
      console.error("Error in form submission:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBankInfoChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      bankInfo: { ...prev.bankInfo, [field]: value },
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {employeeToEdit ? <Edit2 size={20} /> : <UserPlus size={20} />}
          {employeeToEdit ? t("edit_employee") : t("add_employee")}
        </div>
      }
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto px-2">
        {/* Basic Information Section */}
        <div className="border-b border-gray-100 pb-4">
          <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User size={18} className="text-indigo-600" />
            {t("basic_information")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("full_name")} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  placeholder={t("enter_full_name")}
                  required
                  fullWidth
                  className="pl-10"
                />
              </div>
            </div>

            {/* Employee Code */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("employee_code")}
              </label>
              <div className="relative">
                <Hash size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  value={formData.employeeCode}
                  onChange={(e) => handleChange("employeeCode", e.target.value)}
                  placeholder="EMP-001"
                  fullWidth
                  className="pl-10"
                  disabled={!!employeeToEdit}
                />
              </div>
              <p className="text-xs text-gray-500">{t("auto_generated")}</p>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("email")} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder={t("enter_email")}
                  required
                  fullWidth
                  className="pl-10"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("phone")} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  value={formData.phoneNumber}
                  onChange={(e) => handleChange("phoneNumber", e.target.value)}
                  placeholder={t("enter_phone")}
                  required
                  fullWidth
                  className="pl-10"
                />
              </div>
            </div>

            {/* ID Number */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("id_number")}
              </label>
              <Input
                value={formData.idNumber}
                onChange={(e) => handleChange("idNumber", e.target.value)}
                placeholder={t("enter_id_number")}
                fullWidth
              />
            </div>

            {/* GOSI ID */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("gosi_id")}
              </label>
              <Input
                value={formData.gosiId}
                onChange={(e) => handleChange("gosiId", e.target.value)}
                placeholder={t("enter_gosi_id")}
                fullWidth
              />
            </div>

            {/* Birth Date */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("birth_date")}
              </label>
              <div className="relative">
                <Calendar size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleChange("birthDate", e.target.value)}
                  fullWidth
                  className="pl-10"
                />
              </div>
            </div>

            {/* Nationality */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("nationality")}
              </label>
              <div className="relative">
                <Flag size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  value={formData.nationality}
                  onChange={(e) => handleChange("nationality", e.target.value)}
                  placeholder={t("enter_nationality")}
                  fullWidth
                  className="pl-10"
                />
              </div>
            </div>

            {/* Gender */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("gender")}
              </label>
              <Select
                value={formData.gender}
                onChange={(e) => handleChange("gender", e.target.value)}
                options={genderOptions}
                fullWidth
              />
            </div>

            {/* Marital Status */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("marital_status")}
              </label>
              <div className="relative">
                <Heart size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Select
                  value={formData.maritalStatus}
                  onChange={(e) => handleChange("maritalStatus", e.target.value)}
                  options={maritalStatusOptions}
                  fullWidth
                  className="pl-10"
                />
              </div>
            </div>

            {/* Hire Date */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("hire_date")}
              </label>
              <div className="relative">
                <Calendar size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="date"
                  value={formData.hireDate}
                  onChange={(e) => handleChange("hireDate", e.target.value)}
                  fullWidth
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("status")}
              </label>
              <Select
                value={formData.employeeStatus}
                onChange={(e) => handleChange("employeeStatus", e.target.value)}
                options={statusOptions}
                fullWidth
              />
            </div>
          </div>
        </div>

        {/* Employment Information Section */}
        <div className="border-b border-gray-100 pb-4">
          <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Briefcase size={18} className="text-indigo-600" />
            {t("employment_information")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {/* Company */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("company")} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Select
                  value={formData.companyId}
                  onChange={(e) => handleCompanyChange(e.target.value)}
                  options={companyOptions}
                  placeholder={t("select_company")}
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
                  value={formData.branchId}
                  onChange={(e) => handleChange("branchId", e.target.value)}
                  options={branchOptions}
                  placeholder={formData.companyId ? t("select_branch") : t("select_company_first")}
                  required
                  fullWidth
                  className="pl-10"
                  disabled={!formData.companyId || branchOptions.length === 0}
                />
              </div>
              {formData.companyId && branchOptions.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  {t("no_branches_available_for_this_company")}
                </p>
              )}
            </div>

            {/* Department */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("department")}
              </label>
              <div className="relative">
                <Briefcase size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Select
                  value={formData.departmentId}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  options={departmentOptions}
                  placeholder={formData.companyId ? t("select_department") : t("select_company_first")}
                  fullWidth
                  className="pl-10"
                  disabled={!formData.companyId || departmentOptions.length === 0}
                />
              </div>
              {formData.companyId && departmentOptions.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  {t("no_departments_available_for_this_company")}
                </p>
              )}
            </div>

            {/* Job */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("job")} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Briefcase size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Select
                  value={formData.jobId}
                  onChange={(e) => handleChange("jobId", e.target.value)}
                  options={jobOptions}
                  placeholder={formData.departmentId ? t("select_job") : t("select_department_first")}
                  required
                  fullWidth
                  className="pl-10"
                  disabled={!formData.departmentId || jobOptions.length === 0}
                />
              </div>
              {formData.departmentId && jobOptions.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  {t("no_jobs_available_for_this_department")}
                </p>
              )}
            </div>

            {/* Job Grade */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("job_grade")}
              </label>
              <Input
                value={formData.jobGrade}
                onChange={(e) => handleChange("jobGrade", e.target.value)}
                placeholder={t("enter_job_grade")}
                fullWidth
              />
            </div>

            {/* Internal Employee Number */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("internal_employee_number")}
              </label>
              <Input
                value={formData.internalEmployeeNumber}
                onChange={(e) => handleChange("internalEmployeeNumber", e.target.value)}
                placeholder={t("enter_internal_number")}
                fullWidth
              />
            </div>

            {/* Contract Type */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("contract_type")}
              </label>
              <Select
                value={formData.contractType}
                onChange={(e) => handleChange("contractType", e.target.value)}
                options={contractTypeOptions}
                fullWidth
              />
            </div>

            {/* Contract Start Date */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("contract_start_date")}
              </label>
              <Input
                type="date"
                value={formData.contractStartDate}
                onChange={(e) => handleChange("contractStartDate", e.target.value)}
                fullWidth
              />
            </div>

            {/* Contract End Date */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("contract_end_date")}
              </label>
              <Input
                type="date"
                value={formData.contractEndDate}
                onChange={(e) => handleChange("contractEndDate", e.target.value)}
                fullWidth
              />
            </div>
          </div>
        </div>

        {/* Bank Information Section */}
        <div className="border-b border-gray-100 pb-4">
          <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard size={18} className="text-indigo-600" />
            {t("bank_information")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {/* Bank Name */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("bank_name")}
              </label>
              <Input
                value={formData.bankInfo.bankName}
                onChange={(e) => handleBankInfoChange("bankName", e.target.value)}
                placeholder={t("enter_bank_name")}
                fullWidth
              />
            </div>

            {/* Account Number */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("account_number")}
              </label>
              <Input
                value={formData.bankInfo.accountNumber}
                onChange={(e) => handleBankInfoChange("accountNumber", e.target.value)}
                placeholder={t("enter_account_number")}
                fullWidth
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            {t("address")}
          </label>
          <div className="relative">
            <MapPin size={18} className="absolute left-3 top-3 text-gray-400" />
            <Input
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder={t("enter_address")}
              fullWidth
              className="pl-10"
            />
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
            {employeeToEdit ? t("update_employee") : t("add_employee")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};