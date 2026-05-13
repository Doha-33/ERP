import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Edit2, Plus, Building2, Gauge, Target, MapPin, Settings } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { WorkCenter as WCType } from "../../types";
import { toast } from "sonner";

interface WorkCenterFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedWorkCenter: WCType | null;
  onSave: (data: Partial<WCType>) => Promise<void>;
  loading: boolean;
  existingWorkCenters?: WCType[]; // Add this to check for duplicate codes
}

export const WorkCenterFormModal: React.FC<WorkCenterFormModalProps> = ({
  isOpen,
  onClose,
  selectedWorkCenter,
  onSave,
  loading,
  existingWorkCenters = [],
}) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    machine_type: "MANUAL",
    capacity_per_hour: 0,
    location: "",
    state: "Active",
    description: "",
  });

  // Helper function to extract ID
  const extractId = useCallback((value: any): string => {
    if (!value) return "";
    if (typeof value === "object") {
      return value._id || value.id || "";
    }
    return value;
  }, []);

  // Helper function to get value from different field names
  const getValue = useCallback((obj: any, ...fields: string[]) => {
    for (const field of fields) {
      if (obj[field] !== undefined && obj[field] !== null) {
        return obj[field];
      }
    }
    return undefined;
  }, []);

  // Generate unique code
  const generateUniqueCode = useCallback((): string => {
    const prefix = "WC";
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
  }, []);

  // Check if code is unique
  const isCodeUnique = useCallback((code: string, excludeId?: string): boolean => {
    return !existingWorkCenters.some(wc => {
      const wcId = extractId(wc);
      const wcCode = getValue(wc, "code", "work_center_id");
      return wcCode === code && (!excludeId || wcId !== excludeId);
    });
  }, [existingWorkCenters, extractId, getValue]);

  useEffect(() => {
    if (selectedWorkCenter && isOpen) {
      // Map API fields to form fields (supporting both old and new field names)
      setFormData({
        name: selectedWorkCenter.name || "",
        machine_type: getValue(selectedWorkCenter, "machine_type") || "MANUAL",
        capacity_per_hour: getValue(selectedWorkCenter, "capacity_per_hour", "capacity") || 0,
        location: selectedWorkCenter.location || "",
        state: getValue(selectedWorkCenter, "state", "status") || "Active",
        description: getValue(selectedWorkCenter, "description") || "",
      });
    } else if (!selectedWorkCenter && isOpen) {
      // Generate unique code for new work center
      let newCode = generateUniqueCode();
      while (!isCodeUnique(newCode)) {
        newCode = generateUniqueCode();
      }
      
      setFormData({
        name: "",
        machine_type: "MANUAL",
        capacity_per_hour: 0,
        location: "",
        state: "Active",
        description: "",
      });
    }
  }, [selectedWorkCenter, isOpen, getValue, generateUniqueCode, isCodeUnique]);

  const machineTypeOptions = [
    { value: "MANUAL", label: t("manual_machine") },
    { value: "SEMI_AUTOMATIC", label: t("semi_automatic") },
    { value: "AUTOMATIC", label: t("automatic") },
    { value: "CNC", label: t("cnc_machine") },
    { value: "ROBOTIC", label: t("robotic_cell") },
  ];

  const statusOptions = [
    { value: "Active", label: t("active") },
    { value: "Inactive", label: t("inactive") },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    
    // Check for duplicate code when creating new or when code changed
    const isEditing = !!selectedWorkCenter;
    const currentId = isEditing ? extractId(selectedWorkCenter) : undefined;
    
    if (!formData.name.trim()) {
      toast.error(t("name_required"));
      return;
    }
    if (!formData.machine_type) {
      toast.error(t("machine_type_required"));
      return;
    }
    if (formData.capacity_per_hour <= 0) {
      toast.error(t("capacity_per_hour_positive"));
      return;
    }
    if (!formData.location.trim()) {
      toast.error(t("location_required"));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare data according to API expectations
      const saveData: any = {
        name: formData.name,
        machine_type: formData.machine_type,
        capacity_per_hour: formData.capacity_per_hour,
        location: formData.location,
        state: formData.state,
        description: formData.description || undefined,
      };
      
      // If editing, include the ID
      if (selectedWorkCenter) {
        const wcId = extractId(selectedWorkCenter);
        if (wcId) {
          saveData._id = wcId;
          saveData.id = wcId;
        }
      }
      
      console.log("Saving work center:", saveData);
      await onSave(saveData);
      onClose();
    } catch (error: any) {
      console.error("Error in form submission:", error);
      // Handle duplicate key error specifically
      if (error?.message?.includes("duplicate key") || error?.response?.data?.message?.includes("duplicate")) {
        toast.error(t("code_already_exists"));
      } else {
        toast.error(t("failed_to_save_wc"));
      }
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
          {selectedWorkCenter ? <Edit2 size={20} /> : <Plus size={20} />}
          {selectedWorkCenter ? t("edit_wc") : t("add_wc")}
        </div>
      }
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">

          {/* Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("name")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building2 size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder={t("enter_work_center_name")}
                required
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Machine Type */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("machine_type")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Settings size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Select
                value={formData.machine_type}
                onChange={(e) => handleChange("machine_type", e.target.value)}
                options={machineTypeOptions}
                placeholder={t("select_machine_type")}
                required
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Capacity per Hour */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("capacity_per_hour")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Gauge size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="number"
                min="1"
                step="1"
                value={formData.capacity_per_hour}
                onChange={(e) => handleChange("capacity_per_hour", Number(e.target.value))}
                placeholder="0"
                required
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("location")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                placeholder={t("enter_location")}
                required
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
              value={formData.state}
              onChange={(e) => handleChange("state", e.target.value)}
              options={statusOptions}
              placeholder={t("select_status")}
              required
              fullWidth
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            {t("description")}
          </label>
          <TextArea
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder={t("enter_description")}
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
            {selectedWorkCenter ? t("save") : t("add_wc")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};