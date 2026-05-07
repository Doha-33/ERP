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
  
  // تعريف واجهة منفصلة للبيانات النظيفة التي سيتم إرسالها للـ API
  interface CompanyFormData {
    name: string;
    taxNumber: string;
    email: string;
    defaultCurrency: string;
    phoneNumber: string;
    address: string;
  }

  const [formData, setFormData] = useState<CompanyFormData>({
    name: "",
    taxNumber: "",
    email: "",
    defaultCurrency: "EGP",
    phoneNumber: "",
    address: "",
  });

  useEffect(() => {
    if (companyToEdit && isOpen) {
      // استخراج البيانات بشكل آمن، مع دعم كلاً من _id و id
      setFormData({
        name: companyToEdit.name || "",
        taxNumber: companyToEdit.taxNumber || "",
        email: companyToEdit.email || "",
        defaultCurrency: companyToEdit.defaultCurrency || "EGP",
        phoneNumber: (companyToEdit as any).phoneNumber || "",
        address: (companyToEdit as any).address || "",
      });
    } else if (!companyToEdit && isOpen) {
      // إعادة تعيين النموذج عند الإضافة الجديدة
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
    { value: "EGP", label: `${t("egp") || "EGP"} (${t("egyptian_pound") || "Egyptian Pound"})` },
    { value: "USD", label: `${t("usd") || "USD"} (${t("us_dollar") || "US Dollar"})` },
    { value: "EUR", label: `${t("eur") || "EUR"} (${t("euro") || "Euro"})` },
    { value: "SAR", label: `${t("sar") || "SAR"} (${t("saudi_riyal") || "Saudi Riyal"})` },
    { value: "AED", label: `${t("aed") || "AED"} (${t("uae_dirham") || "UAE Dirham"})` },
    { value: "GBP", label: `${t("gbp") || "GBP"} (${t("british_pound") || "British Pound"})` },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // التحقق من صحة البيانات قبل الإرسال
    if (!formData.name.trim()) {
      // يمكن إضافة toast error هنا
      console.error("Company name is required");
      return;
    }

    if (!formData.email.trim()) {
      console.error("Email is required");
      return;
    }

    // التحقق من صحة الإيميل
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      console.error("Invalid email format");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // إذا كان هناك companyToEdit، أضف الـ ID إلى البيانات
      let dataToSave: Partial<Company> = { ...formData };
      
      if (companyToEdit) {
        // استخدام _id أو id بشكل موحد
        const companyId = (companyToEdit as any)._id || companyToEdit.id;
        if (companyId) {
          dataToSave.id = companyId;
          // إذا كان الـ API يتوقع _id
          // dataToSave._id = companyId;
        }
      }
      
      console.log("Saving company data:", dataToSave);
      await onSave(dataToSave);
      onClose();
    } catch (error) {
      console.error("Error in form submission:", error);
      // يمكن إضافة toast error هنا
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof CompanyFormData, value: string) => {
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
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder={t("enter_company_name")}
                required
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Tax Number */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("tax_number")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                value={formData.taxNumber}
                onChange={(e) => handleChange("taxNumber", e.target.value)}
                placeholder={t("enter_tax_number")}
                required
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("email")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="info@company.com"
                required
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Default Currency */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("default_currency")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Select
                value={formData.defaultCurrency}
                onChange={(e) => handleChange("defaultCurrency", e.target.value)}
                options={currencyOptions}
                required
                fullWidth
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-200">
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
            {companyToEdit ? t("update") : t("create")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};