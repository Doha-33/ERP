import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Building2, Phone, Mail, MapPin, CreditCard, Users } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { Supplier } from "../../types";
import { useData } from "../../context/DataContext";
import { toast } from "sonner";

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Supplier>) => Promise<void>;
  supplierToEdit?: Supplier | null;
  isLoading?: boolean;
}

export const SupplierModal: React.FC<SupplierModalProps> = ({
  isOpen,
  onClose,
  onSave,
  supplierToEdit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const { companies, branches, fetchCompanies, fetchBranches } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    supplierCode: "",
    supplierName: "",
    companyId: "",
    branchId: "",
    email: "",
    phoneNumber: "",
    address: "",
    paymentTerms: "",
    companyName: "",
    status: "ACTIVE",
  });

  // Helper function to extract ID
  const extractId = useCallback((value: any): string => {
    if (!value) return "";
    if (typeof value === "object") {
      return value._id || value.id || "";
    }
    return value;
  }, []);

  useEffect(() => {
    if (supplierToEdit && isOpen) {
      const companyId = extractId(supplierToEdit.companyId);
      const branchId = extractId(supplierToEdit.branchId);

      setFormData({
        supplierCode: supplierToEdit.supplierCode || "",
        supplierName: supplierToEdit.supplierName || "",
        companyId: companyId || "",
        branchId: branchId || "",
        email: supplierToEdit.email || "",
        phoneNumber: supplierToEdit.phoneNumber || "",
        address: supplierToEdit.address || "",
        paymentTerms: supplierToEdit.paymentTerms || "",
        companyName: supplierToEdit.companyName || "",
        status: supplierToEdit.status || "ACTIVE",
      });
    } else if (!supplierToEdit && isOpen) {
      setFormData({
        supplierCode: "",
        supplierName: "",
        companyId: "",
        branchId: "",
        email: "",
        phoneNumber: "",
        address: "",
        paymentTerms: "",
        companyName: "",
        status: "ACTIVE",
      });
    }
  }, [supplierToEdit, isOpen, extractId]);

  // Filter branches based on selected company
  const filteredBranches = useMemo(() => {
    if (!formData.companyId) return [];
    return branches.filter(branch => {
      const branchCompanyId = extractId(branch.companyId);
      return branchCompanyId === formData.companyId;
    });
  }, [branches, formData.companyId, extractId]);

  // Generate supplier code automatically
  const generateSupplierCode = useCallback(() => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `SUP-${timestamp}-${random}`;
  }, []);

  // Auto-generate supplier code when creating new
  useEffect(() => {
    if (!supplierToEdit && isOpen && !formData.supplierCode) {
      setFormData(prev => ({ ...prev, supplierCode: generateSupplierCode() }));
    }
  }, [supplierToEdit, isOpen, generateSupplierCode, formData.supplierCode]);

  const companyOptions = companies.map(c => ({ 
    value: extractId(c), 
    label: c.name 
  }));

  const branchOptions = filteredBranches.map(b => ({ 
    value: extractId(b), 
    label: b.name 
  }));

  const statusOptions = [
    { value: "ACTIVE", label: t("active") },
    { value: "INACTIVE", label: t("inactive") },
  ];

  const paymentTermsOptions = [
    { value: "", label: t("select_payment_terms") },
    { value: "Cash", label: t("cash") },
    { value: "Net 15", label: "Net 15" },
    { value: "Net 30", label: "Net 30" },
    { value: "Net 45", label: "Net 45" },
    { value: "Net 60", label: "Net 60" },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation
    if (!formData.supplierCode.trim()) {
      toast.error(t("supplier_code_required"));
      return;
    }
    
    if (!formData.supplierName.trim()) {
      toast.error(t("supplier_name_required"));
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
    
    setIsSubmitting(true);
    
    try {
      const saveData: Partial<Supplier> = {
        supplierCode: formData.supplierCode,
        supplierName: formData.supplierName,
        companyId: formData.companyId,
        branchId: formData.branchId,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        paymentTerms: formData.paymentTerms || undefined,
        companyName: formData.companyName || undefined,
        status: formData.status as "ACTIVE" | "INACTIVE",
      };
      
      console.log("Saving supplier:", saveData);
      await onSave(saveData);
      onClose();
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error(t("failed_to_save_supplier"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    // Reset branch when company changes
    if (field === "companyId") {
      setFormData(prev => ({ 
        ...prev, 
        companyId: value,
        branchId: "" // Reset branch selection
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {supplierToEdit ? <Edit2 size={20} /> : <Plus size={20} />}
          {supplierToEdit ? t("edit_supplier") : t("add_supplier")}
        </div>
      }
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Supplier Code */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("supplier_code")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building2 size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={formData.supplierCode}
                onChange={(e) => handleChange("supplierCode", e.target.value)}
                placeholder="SUP-001"
                required
                fullWidth
                className="pl-10"
                disabled={!!supplierToEdit}
              />
            </div>
          </div>

          {/* Supplier Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("supplier_name")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building2 size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={formData.supplierName}
                onChange={(e) => handleChange("supplierName", e.target.value)}
                placeholder={t("enter_supplier_name")}
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
            <Select
              value={formData.companyId}
              onChange={(e) => handleChange("companyId", e.target.value)}
              options={companyOptions}
              placeholder={t("select_company")}
              required
              fullWidth
            />
          </div>

          {/* Branch - Filtered by selected company */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("branch")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.branchId}
              onChange={(e) => handleChange("branchId", e.target.value)}
              options={branchOptions}
              placeholder={formData.companyId ? t("select_branch") : t("select_company_first")}
              required
              fullWidth
              disabled={!formData.companyId}
            />
            {formData.companyId && branchOptions.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                {t("no_branches_available_for_this_company")}
              </p>
            )}
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
                placeholder="supplier@company.com"
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
                placeholder="+20123456789"
                required
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Payment Terms */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("payment_terms")}
            </label>
            <div className="relative">
              <CreditCard size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Select
                value={formData.paymentTerms}
                onChange={(e) => handleChange("paymentTerms", e.target.value)}
                options={paymentTermsOptions}
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Company Name (Optional) */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("company_name_optional")}
            </label>
            <Input
              value={formData.companyName}
              onChange={(e) => handleChange("companyName", e.target.value)}
              placeholder={t("enter_company_name")}
              fullWidth
            />
          </div>

          {/* Status (only for edit) */}
          {supplierToEdit && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("status")} <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
                options={statusOptions}
                required
                fullWidth
              />
            </div>
          )}

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
                rows={3}
                required
                fullWidth
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting || isLoading} type="button">
            {t("cancel")}
          </Button>
          <Button
            variant="primary"
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 px-8"
            isLoading={isSubmitting || isLoading}
            disabled={isSubmitting || isLoading}
          >
            {supplierToEdit ? t("update_supplier") : t("add_supplier")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};