import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { UserPlus, Edit2, User, Mail, Phone, Calendar, MapPin, Briefcase, Building2, CreditCard } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select } from "../../components/ui/Common";
import { Employee } from "../../types";

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
    gender: "",
    maritalStatus: "",
    address: "",
    companyId: "",
    branchId: "",
    jobId: "",
  });

  useEffect(() => {
    if (employeeToEdit && isOpen) {
      setFormData({
        fullName: employeeToEdit.fullName || "",
        employeeCode: employeeToEdit.employeeCode || "",
        email: employeeToEdit.email || "",
        phoneNumber: employeeToEdit.phoneNumber || "",
        hireDate: employeeToEdit.hireDate || "",
        employeeStatus: employeeToEdit.employeeStatus || "ACTIVE",
        jobGrade: employeeToEdit.jobGrade || "",
        nationality: employeeToEdit.nationality || "",
        gender: employeeToEdit.gender || "",
        maritalStatus: employeeToEdit.maritalStatus || "",
        address: employeeToEdit.address || "",
        companyId: typeof employeeToEdit.companyId === "object" ? (employeeToEdit.companyId as any)._id || "" : employeeToEdit.companyId || "",
        branchId: typeof employeeToEdit.branchId === "object" ? (employeeToEdit.branchId as any)._id || "" : employeeToEdit.branchId || "",
        jobId: typeof employeeToEdit.jobId === "object" ? (employeeToEdit.jobId as any)._id || "" : employeeToEdit.jobId || "",
      });
    } else if (!employeeToEdit && isOpen) {
      setFormData({
        fullName: "",
        employeeCode: "",
        email: "",
        phoneNumber: "",
        hireDate: "",
        employeeStatus: "Active",
        jobGrade: "",
        nationality: "",
        gender: "",
        maritalStatus: "",
        address: "",
        companyId: "",
        branchId: "",
        jobId: "",
      });
    }
  }, [employeeToEdit, isOpen]);

  const statusOptions = [
    { value: "Active", label: t("active") },
    { value: "Inactive", label: t("inactive") },
    { value: "OnLeave", label: t("on_leave") },
  ];

  const genderOptions = [
    { value: "Male", label: t("male") },
    { value: "Female", label: t("female") },
  ];

  const maritalStatusOptions = [
    { value: "Single", label: t("single") },
    { value: "Married", label: t("married") },
    { value: "Divorced", label: t("divorced") },
  ];

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