import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Building2, MapPin, Mail, Hash, Phone } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { Branch } from "../../types";
import { useData } from "../../context/DataContext";
interface BranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Branch>) => Promise<void>;
  branchToEdit?: Branch | null;
  isLoading?: boolean;
}

export const BranchModal: React.FC<BranchModalProps> = ({
  isOpen,
  onClose,
  onSave,
  branchToEdit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const { companies } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    companyId: "",
    name: "",
    email: "",
    address: "",
    phoneNumber: "",
    state: "ACTIVE",
  });

  useEffect(() => {
    if (branchToEdit && isOpen) {
      // Extract company ID safely
      let companyId = "";
      if (typeof branchToEdit.companyId === "object" && branchToEdit.companyId !== null) {
        companyId = (branchToEdit.companyId as any)._id || (branchToEdit.companyId as any).id || "";
      } else if (typeof branchToEdit.companyId === "string") {
        companyId = branchToEdit.companyId;
      }

      setFormData({
        companyId: companyId,
        name: branchToEdit.name || "",
        email: branchToEdit.email || "",
        address: branchToEdit.address || "",
        phoneNumber: (branchToEdit as any).phoneNumber || "",
        state: branchToEdit.state || "ACTIVE",
      });
    } else if (!branchToEdit && isOpen) {
      const defaultCompanyId = companies.length > 0 ? (companies[0]._id || companies[0].id) : "";
      setFormData({
        companyId: defaultCompanyId,
        name: "",
        email: "",
        address: "",
        phoneNumber: "",
        state: "ACTIVE",
      });
    }
  }, [branchToEdit, isOpen, companies]);

  const companyOptions = companies.map(c => ({ 
    value: c._id || c.id, 
    label: c.name 
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
          {branchToEdit ? <Edit2 size={20} /> : <Plus size={20} />}
          {branchToEdit ? t("edit_branch") : t("add_branch")}
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

          {/* Branch Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("branch_name")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder={t("enter_branch_name")}
              required
              fullWidth
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("email")}
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="branch@company.com"
              fullWidth
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("phone_number")}
            </label>
            <Input
              value={formData.phoneNumber}
              onChange={(e) => handleChange("phoneNumber", e.target.value)}
              placeholder="+20123456789"
              fullWidth
            />
          </div>

          {/* Address */}
          <div className="col-span-2 space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("address")} <span className="text-red-500">*</span>
            </label>
            <TextArea
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder={t("enter_address")}
              rows={2}
              required
              fullWidth
            />
          </div>

          {/* Status (only for edit) */}
          {branchToEdit && (
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
            {branchToEdit ? t("save") : t("add_branch")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};