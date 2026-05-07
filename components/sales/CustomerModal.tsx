import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, User, Mail, Phone, MapPin, Building2, Hash, CreditCard } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { Customer } from "../../types";
import { toast } from "sonner";

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Customer>) => Promise<void>;
  customerToEdit?: Customer | null;
  isLoading?: boolean;
}

interface CustomerFormData {
  customerCode: string;
  customerName: string;
  email: string;
  phoneNumber: string;
  address: string;
  companyName: string;
  status: string;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  customerToEdit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CustomerFormData>({
    customerCode: "",
    customerName: "",
    email: "",
    phoneNumber: "",
    address: "",
    companyName: "",
    status: "ACTIVE",
  });

  const extractId = useCallback((value: any): string => {
    if (!value) return "";
    if (typeof value === "object") {
      return value._id || value.id || "";
    }
    return value;
  }, []);

  const generateCustomerCode = useCallback((): string => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `CUST-${timestamp}-${random}`;
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    if (customerToEdit) {
      // Editing existing customer
      console.log("Editing customer:", customerToEdit);
      
      setFormData({
        customerCode: customerToEdit.customerCode || generateCustomerCode(),
        customerName: customerToEdit.customerName || "",
        email: customerToEdit.email || "",
        phoneNumber: customerToEdit.phoneNumber || "",
        address: customerToEdit.address || "",
        companyName: customerToEdit.companyName || "",
        status: customerToEdit.status || "ACTIVE",
      });
    } else {
      // Creating new customer
      setFormData({
        customerCode: generateCustomerCode(),
        customerName: "",
        email: "",
        phoneNumber: "",
        address: "",
        companyName: "",
        status: "ACTIVE",
      });
    }
  }, [customerToEdit, isOpen, generateCustomerCode]);

  const statusOptions = [
    { value: "ACTIVE", label: t("active") },
    { value: "INACTIVE", label: t("inactive") },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation
    if (!formData.customerCode.trim()) {
      toast.error(t("customer_code_required"));
      return;
    }
    
    if (!formData.customerName.trim()) {
      toast.error(t("customer_name_required"));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare data without ID for creation, or with ID for update
      const saveData: Partial<Customer> = { ...formData };
      
      // If editing, include the ID
      if (customerToEdit) {
        const customerId = (customerToEdit as any)._id || (customerToEdit as any).id;
        if (customerId) {
          (saveData as any)._id = customerId;
          (saveData as any).id = customerId;
        }
      }
      
      console.log("Saving customer data:", saveData);
      await onSave(saveData);
      onClose();
    } catch (error) {
      console.error("Error in form submission:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof CustomerFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {customerToEdit ? <Edit2 size={20} /> : <Plus size={20} />}
          {customerToEdit ? t("edit_customer") : t("add_customer")}
        </div>
      }
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Customer Code */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("customer_code")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Hash size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={formData.customerCode}
                onChange={(e) => handleChange("customerCode", e.target.value)}
                placeholder="CUST-001"
                required
                fullWidth
                className="pl-10"
                disabled={!!customerToEdit} // Disable editing for existing customers
              />
            </div>
          </div>

          {/* Customer Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("customer_name")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={formData.customerName}
                onChange={(e) => handleChange("customerName", e.target.value)}
                placeholder={t("enter_customer_name")}
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
                placeholder="customer@example.com"
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("phone")}
            </label>
            <div className="relative">
              <Phone size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={formData.phoneNumber}
                onChange={(e) => handleChange("phoneNumber", e.target.value)}
                placeholder="+20123456789"
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Company Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("company_name")}
            </label>
            <div className="relative">
              <Building2 size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={formData.companyName}
                onChange={(e) => handleChange("companyName", e.target.value)}
                placeholder={t("enter_company_name")}
                fullWidth
                className="pl-10"
              />
            </div>
          </div>
          {/* Status */}
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

          {/* Address */}
          <div className="col-span-2 space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("address")}
            </label>
            <div className="relative">
              <MapPin size={18} className="absolute left-3 top-3 text-gray-400" />
              <TextArea
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder={t("enter_address")}
                rows={2}
                fullWidth
                className="pl-10"
              />
            </div>
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
            {customerToEdit ? t("update_customer") : t("add_customer")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};