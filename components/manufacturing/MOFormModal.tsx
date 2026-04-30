import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Edit2, Plus, Package, Calendar, User, Hash } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select } from "../../components/ui/Common";
import { ManufacturingOrder as MOType } from "../../types";

interface MOFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedOrder: MOType | null;
  onSave: (data: Partial<MOType>) => Promise<void>;
  loading: boolean;
}

export const MOFormModal: React.FC<MOFormModalProps> = ({
  isOpen,
  onClose,
  selectedOrder,
  onSave,
  loading,
}) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<MOType>>({});

  useEffect(() => {
    if (selectedOrder) {
      setFormData(selectedOrder);
    } else {
      setFormData({});
    }
  }, [selectedOrder, isOpen]);

  const statusOptions = [
    { value: "Draft", label: t("draft") },
    { value: "Confirmed", label: t("confirmed") },
    { value: "In Progress", label: t("in_progress") },
    { value: "Completed", label: t("completed") },
    { value: "Cancelled", label: t("cancelled") },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSave(formData);
      onClose();
      setFormData({});
    } catch (error) {
      console.error("Error in form submission:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof MOType, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {selectedOrder ? <Edit2 size={20} /> : <Plus size={20} />}
          {selectedOrder ? t("edit_mo") : t("create_mo")}
        </div>
      }
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* MO Number */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("mo_number")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.mo_number || ""}
              onChange={(e) => handleChange("mo_number", e.target.value)}
              placeholder="MO-001"
              required
              fullWidth
            />
          </div>

          {/* BOM Used */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("bom_used")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.bom_used || ""}
              onChange={(e) => handleChange("bom_used", e.target.value)}
              placeholder="BOM-001"
              required
              fullWidth
            />
          </div>

          {/* Product Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("product_name")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.product_name || ""}
              onChange={(e) => handleChange("product_name", e.target.value)}
              placeholder={t("enter_product_name")}
              required
              fullWidth
            />
          </div>

          {/* Product Code */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("product_code")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.product_code || ""}
              onChange={(e) => handleChange("product_code", e.target.value)}
              placeholder="PRD-001"
              required
              fullWidth
            />
          </div>

          {/* Planned Quantity */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("planned_quantity")} <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              value={formData.planned_quantity || ""}
              onChange={(e) => handleChange("planned_quantity", Number(e.target.value))}
              placeholder="0"
              required
              fullWidth
            />
          </div>

          {/* Start Date */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("start_date")} <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={formData.start_date || ""}
              onChange={(e) => handleChange("start_date", e.target.value)}
              required
              fullWidth
            />
          </div>

          {/* End Date */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("end_date")} <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={formData.end_date || ""}
              onChange={(e) => handleChange("end_date", e.target.value)}
              required
              fullWidth
            />
          </div>

          {/* Responsible */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("responsible")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.responsible || ""}
              onChange={(e) => handleChange("responsible", e.target.value)}
              placeholder={t("enter_responsible_name")}
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
              value={formData.state || ""}
              onChange={(e) => handleChange("state", e.target.value)}
              options={statusOptions}
              placeholder={t("select_status")}
              required
              fullWidth
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting || loading}>
            {t("cancel")}
          </Button>
          <Button
            variant="primary"
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 px-8"
            isLoading={isSubmitting || loading}
            disabled={isSubmitting || loading}
          >
            {selectedOrder ? t("save") : t("create_mo")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};