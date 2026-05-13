import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Building2, MapPin, Mail, Hash, Phone } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { Branch } from "../../types";
import { useData } from "../../context/DataContext";
import { toast } from "sonner";

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
    state: "ACTIVE",
  });

  // Helper function to extract ID
  const extractId = useCallback((value: any): string => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      if (value._id && typeof value._id === "string") return value._id;
      if (value.id && typeof value.id === "string") return value.id;
      // Handle MongoDB ObjectId
      if (value.toString && typeof value.toString === "function") {
        const str = value.toString();
        if (str && !str.includes('Object')) return str;
      }
    }
    return "";
  }, []);

  // Generate unique branch code
  const generateBranchCode = useCallback(() => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `BR-${timestamp}`;
  }, []);

  useEffect(() => {
    if (branchToEdit && isOpen) {
      // Extract company ID safely
      let companyId = extractId(branchToEdit.companyId);

      setFormData({
        companyId: companyId,
        name: branchToEdit.name || "",
        email: branchToEdit.email || "",
        address: branchToEdit.address || "",
        state: branchToEdit.state || "ACTIVE",
      });
    } else if (!branchToEdit && isOpen) {
      const defaultCompanyId = companies.length > 0 ? extractId(companies[0]) : "";
      setFormData({
        companyId: defaultCompanyId,
        name: "",
        email: "",
        address: "",
        state: "ACTIVE",
      });
    }
  }, [branchToEdit, isOpen, companies, extractId]);

  const companyOptions = companies.map(c => ({ 
    value: extractId(c), 
    label: c.name 
  }));

  const statusOptions = [
    { value: "ACTIVE", label: t("active") },
    { value: "INACTIVE", label: t("inactive") },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation
    if (!formData.companyId) {
      toast.error(t("company_required"));
      return;
    }
    if (!formData.name.trim()) {
      toast.error(t("branch_name_required"));
      return;
    }
    if (!formData.address.trim()) {
      toast.error(t("address_required"));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const saveData: any = {
        companyId: formData.companyId,
        name: formData.name,
        email: formData.email || undefined,
        address: formData.address,
        state: formData.state,
      };
      
      // Add code for new branch
      if (!branchToEdit) {
        saveData.code = generateBranchCode();
      }
      
      console.log("Saving branch:", saveData);
      await onSave(saveData);
      onClose();
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error(t("failed_to_save_branch"));
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
            <div className="relative">
              <Building2 size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Select
                value={formData.companyId}
                onChange={(e) => handleChange("companyId", e.target.value)}
                options={companyOptions}
                placeholder={t("select_company")}
                required
                fullWidth
                className="pl-10"
                disabled={!!branchToEdit}
              />
            </div>
          </div>

          {/* Branch Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("branch_name")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building2 size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder={t("enter_branch_name")}
                required
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("email")}
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="branch@company.com"
                fullWidth
                className="pl-10"
              />
            </div>
          </div>


          {/* Address */}
          <div className="col-span-2 space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("address")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin size={18} className="absolute left-3 top-3 text-gray-400" />
              <TextArea
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder={t("enter_address")}
                rows={2}
                required
                fullWidth
                className="pl-10"
              />
            </div>
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
            {branchToEdit ? t("update_branch") : t("add_branch")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};