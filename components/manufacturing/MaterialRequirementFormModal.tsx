import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Edit2, Plus, Package, Box, Layers } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { MaterialRequirement as MRType } from "../../types";

interface MaterialRequirementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRequirement: MRType | null;
  onSave: (data: Partial<MRType>) => Promise<void>;
  loading: boolean;
}

export const MaterialRequirementFormModal: React.FC<MaterialRequirementFormModalProps> = ({
  isOpen,
  onClose,
  selectedRequirement,
  onSave,
  loading,
}) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<MRType>>({});

  useEffect(() => {
    if (selectedRequirement) {
      setFormData(selectedRequirement);
    } else {
      setFormData({});
    }
  }, [selectedRequirement, isOpen]);

  const sourceOptions = [
    { value: "Warehouse 1", label: "Warehouse 1" },
    { value: "Warehouse 2", label: "Warehouse 2" },
    { value: "Supplier", label: "Supplier" },
    { value: "External", label: "External" },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const submitData = {
      ...formData,
      notes: formData.notes || '',
      bom_qty_per_unit: formData.bom_qty_per_unit || 0,
    };

    try {
      await onSave(submitData);
      onClose();
      setFormData({});
    } catch (error) {
      console.error("Error in form submission:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof MRType, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {selectedRequirement ? <Edit2 size={20} /> : <Plus size={20} />}
          {selectedRequirement ? t("edit_requirement") : t("add_requirement")}
        </div>
      }
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Material */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("material")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.material || ""}
              onChange={(e) => handleChange("material", e.target.value)}
              placeholder={t("enter_material_name")}
              required
              fullWidth
            />
          </div>

          {/* Unit */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("unit")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.unit || ""}
              onChange={(e) => handleChange("unit", e.target.value)}
              placeholder="kg, pcs, liters..."
              required
              fullWidth
            />
          </div>

          {/* Description */}
          <div className="col-span-2 space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("description")}
            </label>
            <Input
              value={formData.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder={t("enter_description")}
              fullWidth
            />
          </div>

          {/* Required Quantity */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("required_qty")} <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              value={formData.required_qty || ""}
              onChange={(e) => handleChange("required_qty", Number(e.target.value))}
              placeholder="0"
              required
              fullWidth
            />
          </div>

          {/* Available Quantity */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("available_qty")} <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              value={formData.available_qty || ""}
              onChange={(e) => handleChange("available_qty", Number(e.target.value))}
              placeholder="0"
              required
              fullWidth
            />
          </div>

          {/* BOM Quantity per Unit */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("bom_qty_per_unit")} <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.bom_qty_per_unit || ""}
              onChange={(e) => handleChange("bom_qty_per_unit", Number(e.target.value))}
              placeholder="0"
              required
              fullWidth
            />
          </div>

          {/* Source */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("source")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.source || ""}
              onChange={(e) => handleChange("source", e.target.value)}
              options={sourceOptions}
              placeholder={t("select_source")}
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
            {selectedRequirement ? t("save") : t("add_requirement")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};