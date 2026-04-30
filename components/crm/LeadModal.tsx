import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, User, Phone, Building, Briefcase, Tag } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { CRMLead } from "../../types";

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<CRMLead>) => Promise<void>;
  leadToEdit?: CRMLead | null;
  isLoading?: boolean;
}

export const LeadModal: React.FC<LeadModalProps> = ({
  isOpen,
  onClose,
  onSave,
  leadToEdit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    leadName: "",
    phone: "",
    company: "",
    leadOwner: "",
    leadStatus: "Connected",
  });

  useEffect(() => {
    if (leadToEdit && isOpen) {
      setFormData({
        leadName: leadToEdit.leadName || "",
        phone: leadToEdit.phone || "",
        company: leadToEdit.company || "",
        leadOwner: leadToEdit.leadOwner || "",
        leadStatus: leadToEdit.leadStatus || "Connected",
      });
    } else if (!leadToEdit && isOpen) {
      setFormData({
        leadName: "",
        phone: "",
        company: "",
        leadOwner: "",
        leadStatus: "Connected",
      });
    }
  }, [leadToEdit, isOpen]);

  const statusOptions = [
    { value: "Connected", label: t("connected") },
    { value: "Not Contacted", label: t("not_contacted") },
    { value: "Lost", label: t("lost") },
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
          {leadToEdit ? <Edit2 size={20} /> : <Plus size={20} />}
          {leadToEdit ? t("edit_lead") : t("add_lead")}
        </div>
      }
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Lead Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("lead_name")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.leadName}
              onChange={(e) => handleChange("leadName", e.target.value)}
              placeholder={t("enter_lead_name")}
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
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="+20123456789"
              required
              fullWidth
            />
          </div>

          {/* Company */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("company")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.company}
              onChange={(e) => handleChange("company", e.target.value)}
              placeholder={t("enter_company_name")}
              required
              fullWidth
            />
          </div>

          {/* Lead Owner */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("lead_owner")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.leadOwner}
              onChange={(e) => handleChange("leadOwner", e.target.value)}
              placeholder={t("enter_lead_owner")}
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
              value={formData.leadStatus}
              onChange={(e) => handleChange("leadStatus", e.target.value)}
              options={statusOptions}
              required
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
            {leadToEdit ? t("save") : t("add_lead")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};