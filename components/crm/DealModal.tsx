import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, DollarSign, Calendar, User, Target, Briefcase } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { CRMDeal } from "../../types";

interface DealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<CRMDeal>) => Promise<void>;
  dealToEdit?: CRMDeal | null;
  isLoading?: boolean;
}

export const DealModal: React.FC<DealModalProps> = ({
  isOpen,
  onClose,
  onSave,
  dealToEdit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    dealName: "",
    customer: "",
    dealValue: 0,
    stage: "Proposal",
    closingDate: "",
    salesOwner: "",
  });

  useEffect(() => {
    if (dealToEdit && isOpen) {
      setFormData({
        dealName: dealToEdit.dealName || "",
        customer: dealToEdit.customer || "",
        dealValue: dealToEdit.dealValue || 0,
        stage: dealToEdit.stage || "Proposal",
        closingDate: dealToEdit.closingDate ? new Date(dealToEdit.closingDate).toISOString().split("T")[0] : "",
        salesOwner: dealToEdit.salesOwner || "",
      });
    } else if (!dealToEdit && isOpen) {
      setFormData({
        dealName: "",
        customer: "",
        dealValue: 0,
        stage: "Proposal",
        closingDate: "",
        salesOwner: "",
      });
    }
  }, [dealToEdit, isOpen]);

  const stageOptions = [
    { value: "Proposal", label: t("proposal") },
    { value: "Negotiation", label: t("negotiation") },
    { value: "Won", label: t("closed_won") },
    { value: "Lost", label: t("closed_lost") },
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
          {dealToEdit ? <Edit2 size={20} /> : <Plus size={20} />}
          {dealToEdit ? t("edit_deal") : t("add_deal")}
        </div>
      }
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Deal Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("deal_name")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.dealName}
              onChange={(e) => handleChange("dealName", e.target.value)}
              placeholder={t("enter_deal_name")}
              required
              fullWidth
            />
          </div>

          {/* Customer */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("customer")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.customer}
              onChange={(e) => handleChange("customer", e.target.value)}
              placeholder={t("enter_customer_name")}
              required
              fullWidth
            />
          </div>

          {/* Deal Value */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("value")} (EGP) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.dealValue}
              onChange={(e) => handleChange("dealValue", Number(e.target.value))}
              placeholder="0.00"
              required
              fullWidth
            />
          </div>

          {/* Stage */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("stage")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.stage}
              onChange={(e) => handleChange("stage", e.target.value)}
              options={stageOptions}
              required
              fullWidth
            />
          </div>

          {/* Closing Date */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("closing_date")} <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={formData.closingDate}
              onChange={(e) => handleChange("closingDate", e.target.value)}
              required
              fullWidth
            />
          </div>

          {/* Sales Owner */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("sales_owner")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.salesOwner}
              onChange={(e) => handleChange("salesOwner", e.target.value)}
              placeholder={t("enter_sales_owner")}
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
            {dealToEdit ? t("save") : t("add_deal")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};