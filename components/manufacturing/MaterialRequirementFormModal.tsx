import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Edit2, Plus, Package, Box, Layers, Ruler, Weight, Droplet, AlertCircle } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { MaterialRequirement as MRType } from "../../types";
import { toast } from "sonner";

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
  const [formData, setFormData] = useState({
    material: "",
    unit: "pcs",
    description: "",
    required_qty: 0,
    available_qty: 0,
    bom_qty_per_unit: 0,
    source: "",
    notes: "",
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
    if (selectedRequirement && isOpen) {
      setFormData({
        material: selectedRequirement.material || "",
        unit: selectedRequirement.unit || "pcs",
        description: selectedRequirement.description || "",
        required_qty: selectedRequirement.required_qty || 0,
        available_qty: selectedRequirement.available_qty || 0,
        bom_qty_per_unit: selectedRequirement.bom_qty_per_unit || 0,
        source: selectedRequirement.source || "",
        notes: selectedRequirement.notes || "",
      });
    } else if (!selectedRequirement && isOpen) {
      setFormData({
        material: "",
        unit: "pcs",
        description: "",
        required_qty: 0,
        available_qty: 0,
        bom_qty_per_unit: 0,
        source: "",
        notes: "",
      });
    }
  }, [selectedRequirement, isOpen]);

  const unitOptions = [
    { value: "kg", label: t("kg") + " (Kilogram)", icon: Weight },
    { value: "pcs", label: t("pcs") + " (Pieces)", icon: Package },
    { value: "sheets", label: t("sheets") + " (Sheets)", icon: Layers },
    { value: "meters", label: t("meters") + " (Meters)", icon: Ruler },
    { value: "liters", label: t("liters") + " (Liters)", icon: Droplet },
  ];

  const sourceOptions = [
    { value: "Warehouse 1", label: t("warehouse_1") },
    { value: "Warehouse 2", label: t("warehouse_2") },
    { value: "Supplier", label: t("supplier") },
    { value: "External", label: t("external") },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation
    if (!formData.material.trim()) {
      toast.error(t("material_name_required"));
      return;
    }
    if (!formData.unit) {
      toast.error(t("unit_required"));
      return;
    }
    if (formData.required_qty <= 0) {
      toast.error(t("required_qty_positive"));
      return;
    }
    if (formData.available_qty < 0) {
      toast.error(t("available_qty_non_negative"));
      return;
    }
    if (formData.bom_qty_per_unit <= 0) {
      toast.error(t("bom_qty_per_unit_positive"));
      return;
    }
    if (!formData.source) {
      toast.error(t("source_required"));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const submitData: any = {
        material: formData.material,
        unit: formData.unit,
        description: formData.description || undefined,
        required_qty: formData.required_qty,
        available_qty: formData.available_qty,
        bom_qty_per_unit: formData.bom_qty_per_unit,
        source: formData.source,
        notes: formData.notes || undefined,
      };

      // If editing, include the ID
      if (selectedRequirement) {
        const reqId = extractId(selectedRequirement);
        if (reqId) {
          submitData._id = reqId;
          submitData.id = reqId;
        }
      }
      
      console.log("Saving material requirement:", submitData);
      await onSave(submitData);
      onClose();
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error(t("failed_to_save_mr"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Get unit icon
  const getUnitIcon = (unitValue: string) => {
    const option = unitOptions.find(opt => opt.value === unitValue);
    const Icon = option?.icon || Package;
    return <Icon size={18} className="text-gray-400" />;
  };

  // Calculate shortage
  const shortage = Math.max(0, formData.required_qty - formData.available_qty);
  const isShortage = shortage > 0;

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
          <div className="col-span-2 space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("material")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Package size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={formData.material}
                onChange={(e) => handleChange("material", e.target.value)}
                placeholder={t("enter_material_name")}
                required
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Unit */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("unit")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Select
                value={formData.unit}
                onChange={(e) => handleChange("unit", e.target.value)}
                options={unitOptions}
                placeholder={t("select_unit")}
                required
                fullWidth
                className="pl-10"
              />
            </div>
            <p className="text-xs text-gray-500">{t("unit_options_description")}</p>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("description")}
            </label>
            <Input
              value={formData.description}
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
              min="0"
              step="0.01"
              value={formData.required_qty}
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
              min="0"
              step="0.01"
              value={formData.available_qty}
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
              min="0.01"
              value={formData.bom_qty_per_unit}
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
              value={formData.source}
              onChange={(e) => handleChange("source", e.target.value)}
              options={sourceOptions}
              placeholder={t("select_source")}
              required
              fullWidth
            />
          </div>
        </div>

        {/* Shortage Warning */}
        {isShortage && (
          <div className="bg-red-50 rounded-xl p-4 border border-red-100">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-red-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">{t("material_shortage")}</p>
                <p className="text-sm text-red-600">
                  {t("shortage_amount")}: {shortage.toLocaleString()} {formData.unit}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            {t("notes")}
          </label>
          <TextArea
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder={t("enter_notes")}
            rows={3}
            fullWidth
          />
        </div>

        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
          <Button 
            variant="secondary" 
            onClick={onClose} 
            disabled={isSubmitting || loading}
            type="button"
          >
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