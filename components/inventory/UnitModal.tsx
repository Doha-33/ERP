import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Ruler, Hash } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select } from "../../components/ui/Common";
import { Unit } from "../../types";
import { useData } from "../../context/DataContext";
import { toast } from "sonner";

interface UnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Unit>) => Promise<void>;
  unitToEdit?: Unit | null;
  isLoading?: boolean;
}

export const UnitModal: React.FC<UnitModalProps> = ({
  isOpen,
  onClose,
  onSave,
  unitToEdit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const { units } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    abbreviation: "",
    parentUnit: "",
    conversionFactor: 1,
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

  // Generate unique code
  const generateCode = useCallback(() => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `UNIT-${timestamp}-${random}`;
  }, []);

  useEffect(() => {
    if (unitToEdit && isOpen) {
      // Get the parentUnit value correctly - should be a string ID
      let parentUnitValue = "";
      if (unitToEdit.parentUnit) {
        // If parentUnit is an object, extract its ID
        if (typeof unitToEdit.parentUnit === 'object') {
          parentUnitValue = extractId(unitToEdit.parentUnit);
        } else {
          parentUnitValue = String(unitToEdit.parentUnit);
        }
      } else if (unitToEdit.parentUnitId) {
        if (typeof unitToEdit.parentUnitId === 'object') {
          parentUnitValue = extractId(unitToEdit.parentUnitId);
        } else {
          parentUnitValue = String(unitToEdit.parentUnitId);
        }
      }
      
      setFormData({
        code: unitToEdit.code || unitToEdit._id || "",
        name: unitToEdit.name || "",
        abbreviation: unitToEdit.abbreviation || "",
        parentUnit: parentUnitValue,
        conversionFactor: Number(unitToEdit.conversionFactor) || 1,
        status: unitToEdit.status || unitToEdit.state || "ACTIVE",
      });
    } else if (!unitToEdit && isOpen) {
      setFormData({
        code: generateCode(),
        name: "",
        abbreviation: "",
        parentUnit: "",
        conversionFactor: 1,
        status: "ACTIVE",
      });
    }
  }, [unitToEdit, isOpen, extractId, generateCode]);

  const statusOptions = [
    { value: "ACTIVE", label: t("active") },
    { value: "INACTIVE", label: t("inactive") },
  ];

  // Parent unit options - units that can be parents
  const parentUnitOptions = [
    { value: "", label: t("none") },
    ...units
      .filter(u => {
        if (!unitToEdit) return true;
        const currentId = extractId(unitToEdit);
        const unitId = extractId(u);
        return unitId !== currentId;
      })
      .map(u => ({
        value: extractId(u),
        label: `${u.name} (${u.abbreviation})`,
      })),
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation
    if (!formData.code.trim()) {
      toast.error(t("code_required"));
      return;
    }
    if (!formData.name.trim()) {
      toast.error(t("unit_name_required"));
      return;
    }
    if (!formData.abbreviation.trim()) {
      toast.error(t("abbreviation_required"));
      return;
    }
    if (formData.conversionFactor <= 0) {
      toast.error(t("conversion_factor_positive"));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare data according to API expectations
      const saveData: any = {
        code: formData.code,
        name: formData.name,
        abbreviation: formData.abbreviation,
        conversionFactor: formData.conversionFactor,
        status: formData.status,
      };
      
      // Only add parentUnit if it has a value - send as string (ObjectId)
      if (formData.parentUnit) {
        saveData.parentUnit = formData.parentUnit;
      } else {
        // If no parent unit, send empty string or omit based on API
        // Try sending empty string first
        saveData.parentUnit = "";
      }
      
      console.log("Saving unit:", saveData);
      await onSave(saveData);
      onClose();
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error(t("failed_to_save_unit"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Get selected parent unit name for preview
  const selectedParentUnit = units.find(u => extractId(u) === formData.parentUnit);
  
  // Preview conversion text
  const getPreviewText = () => {
    if (formData.parentUnit && selectedParentUnit && formData.conversionFactor !== 1) {
      return `1 ${formData.abbreviation || "unit"} = ${formData.conversionFactor} × ${selectedParentUnit.abbreviation}`;
    }
    return `1 ${formData.abbreviation || "unit"} = ${formData.conversionFactor} × base unit`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {unitToEdit ? <Edit2 size={20} /> : <Plus size={20} />}
          {unitToEdit ? t("edit_unit") : t("add_unit")}
        </div>
      }
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Code */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("code")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Hash size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={formData.code}
                onChange={(e) => handleChange("code", e.target.value)}
                placeholder="UNIT-001"
                required
                fullWidth
                className="pl-10"
                disabled={!!unitToEdit}
              />
            </div>
          </div>

          {/* Unit Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("unit_name")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Ruler size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder={t("enter_unit_name")}
                required
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Abbreviation */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("abbreviation")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Hash size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={formData.abbreviation}
                onChange={(e) => handleChange("abbreviation", e.target.value)}
                placeholder="kg, pcs, m..."
                required
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Parent Unit */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("parent_unit")}
            </label>
            <Select
              value={formData.parentUnit}
              onChange={(e) => handleChange("parentUnit", e.target.value)}
              options={parentUnitOptions}
              placeholder={t("select_parent_unit")}
              fullWidth
            />
            <p className="text-xs text-gray-500">{t("parent_unit_description")}</p>
          </div>

          {/* Conversion Factor */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("conversion_factor")} <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              value={formData.conversionFactor}
              onChange={(e) => handleChange("conversionFactor", Number(e.target.value))}
              placeholder="1"
              required
              fullWidth
            />
            <p className="text-xs text-gray-500">{t("conversion_factor_description")}</p>
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

        {/* Preview Information */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-100">
          <div className="flex items-center gap-2">
            <Ruler size={16} className="text-indigo-600" />
            <span className="text-sm font-medium text-gray-700">{t("conversion_preview")}:</span>
            <span className="text-sm text-gray-600">{getPreviewText()}</span>
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
            {unitToEdit ? t("update_unit") : t("add_unit")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};