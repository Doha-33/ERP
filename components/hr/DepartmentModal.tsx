import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Building2, Users, Hash } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { Department } from "../../types";
import { useData } from "../../context/DataContext";

interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Department>) => Promise<void>;
  departmentToEdit?: Department | null;
  isLoading?: boolean;
}

export const DepartmentModal: React.FC<DepartmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  departmentToEdit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const { companies, employees } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    companyId: "",
    departmentName: "",
    managerName: "",
    state: "ACTIVE",
  });

  useEffect(() => {
    if (departmentToEdit && isOpen) {
      const companyId = typeof departmentToEdit.companyId === "object"
        ? (departmentToEdit.companyId as any)?._id
        : departmentToEdit.companyId;

      setFormData({
        companyId: companyId || "",
        departmentName: departmentToEdit.departmentName || "",
        managerName: departmentToEdit.managerName || "",
        state: departmentToEdit.state || "ACTIVE",
      });
    } else if (!departmentToEdit && isOpen) {
      const defaultCompanyId = companies.length > 0 ? (companies[0]._id || companies[0].id) : "";
      setFormData({
        companyId: defaultCompanyId,
        departmentName: "",
        managerName: "",
        state: "ACTIVE",
      });
    }
  }, [departmentToEdit, isOpen, companies]);

  const companyOptions = companies.map(c => ({
    value: c._id || c.id,
    label: c.name,
  }));

  const statusOptions = [
    { value: "ACTIVE", label: t("active") },
    { value: "INACTIVE", label: t("inactive") },
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
          {departmentToEdit ? <Edit2 size={20} /> : <Plus size={20} />}
          {departmentToEdit ? t("edit_department") : t("add_department")}
        </div>
      }
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Company */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("company")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.companyId}
              onChange={(e) => handleChange("companyId", e.target.value)}
              options={companyOptions}
              placeholder={t("select_company")}
              required
              fullWidth
            />
          </div>

          {/* Department Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("department_name")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.departmentName}
              onChange={(e) => handleChange("departmentName", e.target.value)}
              placeholder={t("enter_department_name")}
              required
              fullWidth
            />
          </div>

          {/* Manager Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("manager_name")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.managerName}
              onChange={(e) => handleChange("managerName", e.target.value)}
              placeholder={t("enter_manager_name")}
              required
              fullWidth
            />
          </div>

          {/* Status (only for edit) */}
          {departmentToEdit && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("status")} <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.state}
                onChange={(e) => handleChange("state", e.target.value)}
                options={statusOptions}
                required
                fullWidth
              />
            </div>
          )}

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
            {departmentToEdit ? t("save") : t("add_department")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};