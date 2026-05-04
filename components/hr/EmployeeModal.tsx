import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { UserPlus, Edit2, User, Mail, Phone, Calendar, MapPin, Briefcase, Building2, CreditCard } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select } from "../../components/ui/Common";
import { Employee, Department, Job } from "../../types";
import { useData } from "../../context/DataContext";

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
    fullName: "",
    employeeCode: "",
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
  });

  // Debug: Log departments and jobs
  useEffect(() => {
    if (isOpen) {
      console.log("Departments available:", departments);
      console.log("Jobs available:", jobs);
      console.log("Companies available:", companies);
      console.log("Branches available:", branches);
    }
  }, [isOpen, departments, jobs, companies, branches]);

  // Filtered branches based on selected company
  const filteredBranches = useMemo(() => {
    if (!formData.companyId) return [];
    console.log("Filtering branches for company:", formData.companyId);
    const filtered = branches.filter(branch => {
      const branchCompanyId = typeof branch.companyId === "object" 
        ? (branch.companyId as any)?._id || (branch.companyId as any)?.id
        : branch.companyId;
      console.log(`Branch ${branch.name} companyId: ${branchCompanyId}, comparing with: ${formData.companyId}`);
      return branchCompanyId === formData.companyId;
    });
    console.log("Filtered branches:", filtered);
    return filtered;
  }, [branches, formData.companyId]);

  // Filtered departments based on selected company
  const filteredDepartments = useMemo(() => {
    if (!formData.companyId) return [];
    console.log("Filtering departments for company:", formData.companyId);
    const filtered = departments.filter(dept => {
      const deptCompanyId = typeof dept.companyId === "object" 
        ? (dept.companyId as any)?._id || (dept.companyId as any)?.id
        : dept.companyId;
      console.log(`Department ${dept.departmentName} companyId: ${deptCompanyId}, comparing with: ${formData.companyId}`);
      return deptCompanyId === formData.companyId;
    });
    console.log("Filtered departments:", filtered);
    return filtered;
  }, [departments, formData.companyId]);

  // Filtered jobs based on selected department
  const filteredJobs = useMemo(() => {
    if (!formData.departmentId) {
      console.log("No department selected, showing all jobs?");
      return jobs;
    }
    console.log("Filtering jobs for department:", formData.departmentId);
    const filtered = jobs.filter(job => {
      const jobDepartmentId = typeof job.departmentId === "object" 
        ? (job.departmentId as any)?._id || (job.departmentId as any)?.id
        : job.departmentId;
      console.log(`Job ${job.jobName} departmentId: ${jobDepartmentId}, comparing with: ${formData.departmentId}`);
      return jobDepartmentId === formData.departmentId;
    });
    console.log("Filtered jobs:", filtered);
    return filtered;
  }, [jobs, formData.departmentId]);

  useEffect(() => {
    if (employeeToEdit && isOpen) {
      // Get IDs from objects safely
      const companyId = typeof employeeToEdit.companyId === "object" 
        ? (employeeToEdit.companyId as any)?._id || (employeeToEdit.companyId as any)?.id || "" 
        : employeeToEdit.companyId || "";
      const branchId = typeof employeeToEdit.branchId === "object" 
        ? (employeeToEdit.branchId as any)?._id || (employeeToEdit.branchId as any)?.id || "" 
        : employeeToEdit.branchId || "";
      const departmentId = typeof employeeToEdit.departmentId === "object" 
        ? (employeeToEdit.departmentId as any)?._id || (employeeToEdit.departmentId as any)?.id || "" 
        : employeeToEdit.departmentId || "";
      const jobId = typeof employeeToEdit.jobId === "object" 
        ? (employeeToEdit.jobId as any)?._id || (employeeToEdit.jobId as any)?.id || "" 
        : employeeToEdit.jobId || "";

      console.log("Editing employee with IDs:", { companyId, branchId, departmentId, jobId });

      setFormData({
        fullName: employeeToEdit.fullName || "",
        employeeCode: employeeToEdit.employeeCode || "",
        email: employeeToEdit.email || "",
        phoneNumber: employeeToEdit.phoneNumber || "",
        hireDate: employeeToEdit.hireDate || "",
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
      });
    } else if (!employeeToEdit && isOpen) {
      setFormData({
        fullName: "",
        employeeCode: "",
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
      });
    }
  }, [employeeToEdit, isOpen]);

  // Reset branch, department, job when company changes
  const handleCompanyChange = (value: string) => {
    console.log("Company changed to:", value);
    setFormData(prev => ({
      ...prev,
      companyId: value,
      branchId: "",
      departmentId: "",
      jobId: "",
    }));
  };

  // Reset job when department changes
  const handleDepartmentChange = (value: string) => {
    console.log("Department changed to:", value);
    setFormData(prev => ({
      ...prev,
      departmentId: value,
      jobId: "",
    }));
  };

  // Status options according to API expectations
  const statusOptions = [
    { value: "ACTIVE", label: t("active") },
    { value: "INACTIVE", label: t("inactive") },
    { value: "ON_LEAVE", label: t("on_leave") },
    { value: "TERMINATED", label: t("terminated") },
  ];

  // Gender options according to API expectations
  const genderOptions = [
    { value: "MALE", label: t("male") },
    { value: "FEMALE", label: t("female") },
  ];

  // Marital status options according to API expectations
  const maritalStatusOptions = [
    { value: "SINGLE", label: t("single") },
    { value: "MARRIED", label: t("married") },
    { value: "DIVORCED", label: t("divorced") },
    { value: "WIDOWED", label: t("widowed") },
  ];

  const companyOptions = companies.map(c => ({ 
    value: c._id || c.id, 
    label: c.name 
  }));

  const branchOptions = filteredBranches.map(b => ({ 
    value: b._id || b.id, 
    label: b.name 
  }));

  const departmentOptions = filteredDepartments.map(d => ({ 
    value: d._id || d.id, 
    label: d.departmentName 
  }));

  const jobOptions = filteredJobs.map(j => ({ 
    value: j._id || j.id, 
    label: j.jobName 
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
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("full_name")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              placeholder={t("enter_full_name")}
              required
              fullWidth
            />
          </div>

          {/* Employee Code */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("employee_code")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.employeeCode}
              onChange={(e) => handleChange("employeeCode", e.target.value)}
              placeholder="EMP-001"
              required
              fullWidth
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("email")} <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder={t("enter_email")}
              required
              fullWidth
            />
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("phone")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.phoneNumber}
              onChange={(e) => handleChange("phoneNumber", e.target.value)}
              placeholder={t("enter_phone")}
              required
              fullWidth
            />
          </div>

          {/* Hire Date */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("hire_date")}
            </label>
            <Input
              type="date"
              value={formData.hireDate}
              onChange={(e) => handleChange("hireDate", e.target.value)}
              fullWidth
            />
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("status")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.employeeStatus}
              onChange={(e) => handleChange("employeeStatus", e.target.value)}
              options={statusOptions}
              required
              fullWidth
            />
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

          {/* Nationality */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("nationality")}
            </label>
            <Input
              value={formData.nationality}
              onChange={(e) => handleChange("nationality", e.target.value)}
              placeholder={t("enter_nationality")}
              fullWidth
            />
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
            <Select
              value={formData.maritalStatus}
              onChange={(e) => handleChange("maritalStatus", e.target.value)}
              options={maritalStatusOptions}
              fullWidth
            />
          </div>

          {/* Company */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("company")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.companyId}
              onChange={(e) => handleCompanyChange(e.target.value)}
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
              value={formData.branchId}
              onChange={(e) => handleChange("branchId", e.target.value)}
              options={branchOptions}
              placeholder={t("select_branch")}
              required
              disabled={!formData.companyId || branchOptions.length === 0}
              fullWidth
            />
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
            <Select
              value={formData.departmentId}
              onChange={(e) => handleDepartmentChange(e.target.value)}
              options={departmentOptions}
              placeholder={t("select_department")}
              disabled={!formData.companyId || departmentOptions.length === 0}
              fullWidth
            />
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
            <Select
              value={formData.jobId}
              onChange={(e) => handleChange("jobId", e.target.value)}
              options={jobOptions}
              placeholder={t("select_job")}
              required
              disabled={!formData.departmentId || jobOptions.length === 0}
              fullWidth
            />
            {formData.departmentId && jobOptions.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                {t("no_jobs_available_for_this_department")}
              </p>
            )}
          </div>

          {/* Address */}
          <div className="col-span-2 space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("address")}
            </label>
            <Input
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder={t("enter_address")}
              fullWidth
            />
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
            {employeeToEdit ? t("save") : t("add_employee")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};