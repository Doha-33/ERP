import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Building2, Star } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select } from "../../components/ui/Common";
import { SupplierRating } from "../../types";
import { useData } from "../../context/DataContext";
import { toast } from "sonner";

interface SupplierRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<SupplierRating>) => Promise<void>;
  ratingToEdit?: SupplierRating | null;
  isLoading?: boolean;
}

export const SupplierRatingModal: React.FC<SupplierRatingModalProps> = ({
  isOpen,
  onClose,
  onSave,
  ratingToEdit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const { suppliers } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    supplierId: "",
    quality: 5,
    delivery: 5,
    service: 5,
    compliance: 5,
  });
  
  const [ratingCode, setRatingCode] = useState(`SR-${Date.now().toString().slice(-4)}`);

  // Helper function to extract ID
  const extractId = useCallback((value: any): string => {
    if (!value) return "";
    if (typeof value === "object") {
      return value._id || value.id || "";
    }
    return value;
  }, []);

  useEffect(() => {
    if (ratingToEdit && isOpen) {
      const supplierId = extractId(ratingToEdit.supplierId);

      setFormData({
        supplierId: supplierId || "",
        quality: ratingToEdit.quality || 5,
        delivery: ratingToEdit.delivery || 5,
        service: ratingToEdit.service || 5,
        compliance: ratingToEdit.compliance || 5,
      });
      setRatingCode(ratingToEdit.ratingCode || `SR-${Date.now().toString().slice(-4)}`);
    } else if (!ratingToEdit && isOpen) {
      setFormData({
        supplierId: "",
        quality: 5,
        delivery: 5,
        service: 5,
        compliance: 5,
      });
      setRatingCode(`SR-${Date.now().toString().slice(-4)}`);
    }
  }, [ratingToEdit, isOpen, extractId]);

  const supplierOptions = suppliers.map(s => ({
    value: extractId(s),
    label: s.supplierName,
  }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation
    if (!formData.supplierId) {
      toast.error(t("supplier_required"));
      return;
    }
    
    // Validate rating values are between 1 and 5
    const ratings = [formData.quality, formData.delivery, formData.service, formData.compliance];
    for (const rating of ratings) {
      if (rating < 1 || rating > 5) {
        toast.error(t("rating_must_be_between_1_and_5"));
        return;
      }
    }
    
    setIsSubmitting(true);
    
    // Calculate overall rating
    const overallRating = Number((
      (formData.quality + formData.delivery + formData.service + formData.compliance) / 4
    ).toFixed(1));
    
    try {
      const saveData = {
        ...formData,
        ratingCode,
        overallRating,
      };
      
      console.log("Saving supplier rating:", saveData);
      await onSave(saveData);
      onClose();
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error(t("failed_to_save_supplier_rating"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    let newValue = value;
    // Ensure rating is between 1 and 5
    if (["quality", "delivery", "service", "compliance"].includes(field)) {
      newValue = Math.min(5, Math.max(1, Number(value) || 1));
    }
    setFormData(prev => ({ ...prev, [field]: newValue }));
  };

  const renderStarsPreview = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          className={star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
        />
      ))}
    </div>
  );

  const overallRating = Number((
    (formData.quality + formData.delivery + formData.service + formData.compliance) / 4
  ).toFixed(1));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {ratingToEdit ? <Edit2 size={20} /> : <Plus size={20} />}
          {ratingToEdit ? t("edit_supplier_rating") : t("add_supplier_rating")}
        </div>
      }
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Supplier */}
          <div className="col-span-2 space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("supplier")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building2 size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Select
                value={formData.supplierId}
                onChange={(e) => handleChange("supplierId", e.target.value)}
                options={supplierOptions}
                placeholder={t("select_supplier")}
                required
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Rating Criteria */}
          <div className="col-span-2">
            <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Star size={18} className="text-indigo-600" />
              {t("rating_criteria")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {/* Quality */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  {t("quality")} (1-5) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    step={1}
                    value={formData.quality}
                    onChange={(e) => handleChange("quality", e.target.value)}
                    className="w-24"
                    required
                    fullWidth={false}
                  />
                  {renderStarsPreview(formData.quality)}
                </div>
              </div>

              {/* Delivery */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  {t("delivery")} (1-5) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    step={1}
                    value={formData.delivery}
                    onChange={(e) => handleChange("delivery", e.target.value)}
                    className="w-24"
                    required
                    fullWidth={false}
                  />
                  {renderStarsPreview(formData.delivery)}
                </div>
              </div>

              {/* Service */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  {t("service")} (1-5) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    step={1}
                    value={formData.service}
                    onChange={(e) => handleChange("service", e.target.value)}
                    className="w-24"
                    required
                    fullWidth={false}
                  />
                  {renderStarsPreview(formData.service)}
                </div>
              </div>

              {/* Compliance */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  {t("compliance")} (1-5) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    step={1}
                    value={formData.compliance}
                    onChange={(e) => handleChange("compliance", e.target.value)}
                    className="w-24"
                    required
                    fullWidth={false}
                  />
                  {renderStarsPreview(formData.compliance)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overall Rating Summary */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-700">{t("overall_rating")}</p>
              <div className="flex items-center gap-2 mt-1">
                {renderStarsPreview(Math.round(overallRating))}
                <span className="text-lg font-bold text-indigo-600">{overallRating}/5</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">{t("rating_code")}</p>
              <p className="text-sm font-mono font-medium text-gray-700">{ratingCode}</p>
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
            {ratingToEdit ? t("update_rating") : t("add_rating")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};