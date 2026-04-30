import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, User, Phone, MapPin, Tag, Star, Users } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { CRMContact } from "../../types";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<CRMContact>) => Promise<void>;
  contactToEdit?: CRMContact | null;
  isLoading?: boolean;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  onSave,
  contactToEdit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    tags: "",
    location: "",
    rating: 0,
    status: "Active",
  });

  useEffect(() => {
    if (contactToEdit && isOpen) {
      setFormData({
        name: contactToEdit.name || "",
        phone: contactToEdit.phone || "",
        tags: contactToEdit.tags || "",
        location: contactToEdit.location || "",
        rating: contactToEdit.rating || 0,
        status: contactToEdit.status || "Active",
      });
    } else if (!contactToEdit && isOpen) {
      setFormData({
        name: "",
        phone: "",
        tags: "",
        location: "",
        rating: 0,
        status: "Active",
      });
    }
  }, [contactToEdit, isOpen]);

  const tagOptions = [
    { value: "Cold Lead", label: t("cold_lead") },
    { value: "Promotion", label: t("promotion") },
    { value: "VIP", label: t("vip") },
  ];

  const statusOptions = [
    { value: "Active", label: t("active") },
    { value: "Inactive", label: t("inactive") },
  ];

  const ratingOptions = [
    { value: 0, label: "0 ★" },
    { value: 1, label: "1 ★" },
    { value: 2, label: "2 ★" },
    { value: 3, label: "3 ★" },
    { value: 4, label: "4 ★" },
    { value: 5, label: "5 ★" },
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
          {contactToEdit ? <Edit2 size={20} /> : <Plus size={20} />}
          {contactToEdit ? t("edit_contact") : t("add_contact")}
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
            <Input
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder={t("enter_contact_name")}
              required
              fullWidth
            />
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("phone")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="+20123456789"
              required
              fullWidth
            />
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("tags")}
            </label>
            <Select
              value={formData.tags}
              onChange={(e) => handleChange("tags", e.target.value)}
              options={tagOptions}
              placeholder={t("select_tag")}
              fullWidth
            />
          </div>

          {/* Location */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("location")}
            </label>
            <Input
              value={formData.location}
              onChange={(e) => handleChange("location", e.target.value)}
              placeholder={t("enter_location")}
              fullWidth
            />
          </div>

          {/* Rating */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("rating")}
            </label>
            <Select
              value={formData.rating}
              onChange={(e) => handleChange("rating", Number(e.target.value))}
              options={ratingOptions}
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
            {contactToEdit ? t("save") : t("add_contact")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};