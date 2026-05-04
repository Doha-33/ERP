import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Building2, Mail, CreditCard, Hash, FileText } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { Company } from "../../types";

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Company>) => Promise<void>;
  companyToEdit?: Company | null;
  isLoading?: boolean;
}

export const CompanyModal: React.FC<CompanyModalProps> = ({
  isOpen,
  onClose,
  onSave,
  companyToEdit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    taxNumber: "",
    email: "",
    defaultCurrency: "EGP",
    phoneNumber: "",
    address: "",
  });

  useEffect(() => {
    if (companyToEdit && isOpen) {
      setFormData({
        name: companyToEdit.name || "",
        taxNumber: companyToEdit.taxNumber || "",
        email: companyToEdit.email || "",
        defaultCurrency: companyToEdit.defaultCurrency || "EGP",
        phoneNumber: (companyToEdit as any).phoneNumber || "",
        address: (companyToEdit as any).address || "",
      });
    } else if (!companyToEdit && isOpen) {
      setFormData({
        name: "",
        taxNumber: "",
        email: "",
        defaultCurrency: "EGP",
        phoneNumber: "",
        address: "",
      });
    }
  }, [companyToEdit, isOpen]);

  const currencyOptions = [
    { value: "EGP", label: "EGP (Egyptian Pound)" },
    { value: "USD", label: "USD (US Dollar)" },
    { value: "EUR", label: "EUR (Euro)" },
    { value: "SAR", label: "SAR (Saudi Riyal)" },
    { value: "AED", label: "AED (UAE Dirham)" },
    { value: "GBP", label: "GBP (British Pound)" },
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
          {companyToEdit ? <Edit2 size={20} /> : <Plus size={20} />}
          {companyToEdit ? t("edit_company") : t("add_company")}
        </div>
      }
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Company Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("company_name")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder={t("enter_company_name")}
              required
              fullWidth
            />
          </div>

          {/* Tax Number */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("tax_number")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.taxNumber}
              onChange={(e) => handleChange("taxNumber", e.target.value)}
              placeholder="TX-12345"
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
              placeholder="info@company.com"
              required
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

          {/* Default Currency */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("default_currency")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.defaultCurrency}
              onChange={(e) => handleChange("defaultCurrency", e.target.value)}
              options={currencyOptions}
              required
              fullWidth
            />
          </div>

          {/* Address */}
          <div className="col-span-2 space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("address")}
            </label>
            <TextArea
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder={t("enter_address")}
              rows={2}
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
            {companyToEdit ? t("save") : t("add_company")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};