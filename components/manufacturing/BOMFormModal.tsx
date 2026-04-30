import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Edit2, Plus, Package } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { BillOfMaterials as BOMType } from "../../types";

interface BOMFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBOM: BOMType | null;
  onSave: (data: Partial<BOMType>) => Promise<void>;
  loading: boolean;
}

export const BOMFormModal: React.FC<BOMFormModalProps> = ({
  isOpen,
  onClose,
  selectedBOM,
  onSave,
  loading,
}) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<BOMType>>({});

  useEffect(() => {
    if (selectedBOM) {
      setFormData(selectedBOM);
    } else {
      setFormData({});
    }
  }, [selectedBOM, isOpen]);

  const uomOptions = [
    { value: "kg", label: "kg" },
    { value: "pcs", label: "pcs" },
    { value: "sheets", label: "sheets" },
    { value: "liters", label: "liters" },
    { value: "meters", label: "meters" },
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

  const handleChange = (field: keyof BOMType, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {selectedBOM ? <Edit2 size={20} /> : <Plus size={20} />}
          {selectedBOM ? t("edit_bom") : t("add_bom")}
        </div>
      }
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* BOM ID */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("bom_id")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.bom_id || ""}
              onChange={(e) => handleChange("bom_id", e.target.value)}
              placeholder="BOM-001"
              required
              fullWidth
            />
          </div>

          {/* Version */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("version")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.version || ""}
              onChange={(e) => handleChange("version", e.target.value)}
              placeholder="v1.0"
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

          {/* Component Item */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("component_item")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.component_item || ""}
              onChange={(e) => handleChange("component_item", e.target.value)}
              placeholder={t("enter_component_name")}
              required
              fullWidth
            />
          </div>

          {/* Quantity */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("quantity")} <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.qty || ""}
              onChange={(e) => handleChange("qty", Number(e.target.value))}
              placeholder="0"
              required
              fullWidth
            />
          </div>

          {/* Unit of Measure */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("unit")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.uom || ""}
              onChange={(e) => handleChange("uom", e.target.value)}
              options={uomOptions}
              placeholder={t("select_unit")}
              required
              fullWidth
            />
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            {t("notes")}
          </label>
          <TextArea
            value={formData.notes || ""}
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder={t("enter_notes")}
            rows={3}
            fullWidth
          />
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
            {selectedBOM ? t("save") : t("add_bom")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};