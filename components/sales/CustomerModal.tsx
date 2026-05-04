import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, User, Mail, Phone, MapPin, Building2, Hash, CreditCard } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { Customer } from "../../types";

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Customer>) => Promise<void>;
  customerToEdit?: Customer | null;
  isLoading?: boolean;
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
  const [formData, setFormData] = useState({
    customerCode: "",
    customerName: "",
    email: "",
    phoneNumber: "",
    address: "",
    companyName: "",
    status: "ACTIVE",
  });

  useEffect(() => {
    if (customerToEdit && isOpen) {
      setFormData({
        customerCode: customerToEdit.customerCode || "",
        customerName: customerToEdit.customerName || "",
        email: customerToEdit.email || "",
        phoneNumber: customerToEdit.phoneNumber || "",
        address: customerToEdit.address || "",
        companyName: customerToEdit.companyName || "",
        status: customerToEdit.status || "ACTIVE",
      });
    } else if (!customerToEdit && isOpen) {
      setFormData({
        customerCode: "",
        customerName: "",
        email: "",
        phoneNumber: "",
        address: "",
        companyName: "",
        status: "ACTIVE",
      });
    }
  }, [customerToEdit, isOpen]);

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
            <Input
              value={formData.customerCode}
              onChange={(e) => handleChange("customerCode", e.target.value)}
              placeholder="CUST-001"
              required
              fullWidth
            />
          </div>

          {/* Customer Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("customer_name")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.customerName}
              onChange={(e) => handleChange("customerName", e.target.value)}
              placeholder={t("enter_customer_name")}
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
              placeholder="customer@example.com"
              fullWidth
            />
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("phone")}
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

          {/* Company Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("company_name")}
            </label>
            <Input
              value={formData.companyName}
              onChange={(e) => handleChange("companyName", e.target.value)}
              placeholder={t("enter_company_name")}
              fullWidth
            />
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
            {customerToEdit ? t("save") : t("add_customer")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};