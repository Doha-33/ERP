import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Edit2, Plus, Building2, Gauge, Target, MapPin } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select } from "../../components/ui/Common";
import { WorkCenter as WCType } from "../../types";

interface WorkCenterFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedWorkCenter: WCType | null;
  onSave: (data: Partial<WCType>) => Promise<void>;
  loading: boolean;
}

export const WorkCenterFormModal: React.FC<WorkCenterFormModalProps> = ({
  isOpen,
  onClose,
  selectedWorkCenter,
  onSave,
  loading,
}) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<WCType>>({});

  useEffect(() => {
    if (selectedWorkCenter) {
      setFormData(selectedWorkCenter);
    } else {
      setFormData({});
    }
  }, [selectedWorkCenter, isOpen]);

  const statusOptions = [
    { value: "Active", label: t("active") },
    { value: "Maintenance", label: t("maintenance") },
    { value: "Inactive", label: t("inactive") },
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

  const handleChange = (field: keyof WCType, value: any) => {
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
          {/* Code */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("code")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.code || ""}
              onChange={(e) => handleChange("code", e.target.value)}
              placeholder="WC-001"
              required
              fullWidth
            />
          </div>

          {/* Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("name")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.name || ""}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder={t("enter_work_center_name")}
              required
              fullWidth
            />
          </div>

          {/* Capacity */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("capacity")} <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              value={formData.capacity || ""}
              onChange={(e) => handleChange("capacity", Number(e.target.value))}
              placeholder="0"
              required
              fullWidth
            />
          </div>

          {/* Efficiency */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("efficiency")} (%) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.efficiency || ""}
              onChange={(e) => handleChange("efficiency", Number(e.target.value))}
              placeholder="0"
              required
              fullWidth
            />
          </div>

          {/* OEE */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("oee")} (%) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.oee || ""}
              onChange={(e) => handleChange("oee", Number(e.target.value))}
              placeholder="0"
              required
              fullWidth
            />
          </div>

          {/* Location */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("location")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.location || ""}
              onChange={(e) => handleChange("location", e.target.value)}
              placeholder={t("enter_location")}
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
            {selectedWorkCenter ? t("save") : t("add_wc")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};