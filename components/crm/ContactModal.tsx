import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, User, Phone, MapPin, Tag, Star, Mail, Building, FileText, Users } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { CRMContact } from "../../types";
import { useCRM } from "../../context/crm/CRMContext";
import { toast } from "sonner";

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
  const { pricelists, groups } = useCRM();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    nameEn: "",
    phone: "",
    mobile: "",
    email: "",
    address: "",
    notes: "",
    tags: "",
    rating: 0,
    status: "Active",
    isCustomer: true,
    isSupplier: false,
    location: "",
    companyName: "",
    companyNameEn: "",
    pricelistId: "",
    groupId: "",
  });

  // Helper function to extract ID from object or string
  const extractId = useCallback((value: any): string => {
    if (!value) return "";
    if (typeof value === "object") {
      return value._id || value.id || "";
    }
    return value;
  }, []);

  // Helper function to format tags from API (could be string or array)
  const formatTagsForDisplay = useCallback((tags: any): string => {
    if (!tags) return "";
    if (typeof tags === "string") return tags;
    if (Array.isArray(tags)) return tags.join(", ");
    return "";
  }, []);

  // Helper function to parse tags string to array
  const parseTagsToArray = useCallback((tagsString: string): string[] => {
    if (!tagsString.trim()) return [];
    return tagsString.split(/[,\s]+/).filter(tag => tag.trim().length > 0);
  }, []);

  useEffect(() => {
    if (contactToEdit && isOpen) {
      const pricelistId = extractId(contactToEdit.pricelistId);
      const groupId = extractId(contactToEdit.groupId);
      
      setFormData({
        name: contactToEdit.name || "",
        nameEn: contactToEdit.nameEn || "",
        phone: contactToEdit.phone || "",
        mobile: contactToEdit.mobile || "",
        email: contactToEdit.email || "",
        address: contactToEdit.address || "",
        notes: contactToEdit.notes || "",
        tags: formatTagsForDisplay(contactToEdit.tags),
        rating: contactToEdit.rating || 0,
        status: contactToEdit.status || "Active",
        isCustomer: contactToEdit.isCustomer ?? true,
        isSupplier: contactToEdit.isSupplier ?? false,
        location: contactToEdit.location || "",
        companyName: contactToEdit.companyName || "",
        companyNameEn: contactToEdit.companyNameEn || "",
        pricelistId: pricelistId,
        groupId: groupId,
      });
    } else if (!contactToEdit && isOpen) {
      setFormData({
        name: "",
        nameEn: "",
        phone: "",
        mobile: "",
        email: "",
        address: "",
        notes: "",
        tags: "",
        rating: 0,
        status: "Active",
        isCustomer: true,
        isSupplier: false,
        location: "",
        companyName: "",
        companyNameEn: "",
        pricelistId: "",
        groupId: "",
      });
    }
  }, [contactToEdit, isOpen, extractId, formatTagsForDisplay]);

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

  const pricelistOptions = [
    { value: "", label: t("select_pricelist") || "Select Price List" },
    ...pricelists.map(p => ({
      value: extractId(p),
      label: p.name
    }))
  ];

  const groupOptions = [
    { value: "", label: t("select_group") || "Select Group" },
    ...groups.map(g => ({
      value: extractId(g),
      label: g.name
    }))
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error(t("contact_name_required"));
      return;
    }
    if (!formData.phone.trim()) {
      toast.error(t("contact_phone_required"));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const tagsArray = parseTagsToArray(formData.tags);
      const tagsString = tagsArray.join(", ");
      
      const saveData: Partial<CRMContact> = {
        name: formData.name,
        nameEn: formData.nameEn || undefined,
        phone: formData.phone,
        mobile: formData.mobile || undefined,
        isCustomer: formData.isCustomer,
        isSupplier: formData.isSupplier,
        companyName: formData.companyName || undefined,
        companyNameEn: formData.companyNameEn || undefined,
        tags: tagsString || undefined,
        ...(formData.pricelistId ? { pricelistId: formData.pricelistId } : {}),
        ...(formData.groupId ? { groupId: formData.groupId } : {}),
      };
      
      if (formData.email) saveData.email = formData.email;
      if (formData.address) saveData.address = formData.address;
      if (formData.notes) saveData.notes = formData.notes;
      if (formData.rating > 0) saveData.rating = formData.rating;
      if (formData.status) saveData.status = formData.status;
      if (formData.location) saveData.location = formData.location;
      
      console.log("Sending saveData:", saveData);
      await onSave(saveData);
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

  const renderTagsPreview = () => {
    const tagsArray = parseTagsToArray(formData.tags);
    if (tagsArray.length === 0) return null;
    
    return (
      <div className="mt-2 flex flex-wrap gap-1.5">
        {tagsArray.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded-full"
          >
            <Tag size={10} />
            {tag}
          </span>
        ))}
      </div>
    );
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
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder={t("enter_contact_name")}
                required
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Name En */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("nameEn") || "Name (English)"}
            </label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={formData.nameEn}
                onChange={(e) => handleChange("nameEn", e.target.value)}
                placeholder={t("enter_contact_name_en") || "Enter English name"}
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("phone")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+20123456789"
                required
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Mobile */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("mobile") || "Mobile"}
            </label>
            <div className="relative">
              <Phone size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={formData.mobile}
                onChange={(e) => handleChange("mobile", e.target.value)}
                placeholder="+20123456789"
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Company Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              <Building size={14} className="inline mr-1" />
              {t("companyName") || "Company Name"}
            </label>
            <Input
              value={formData.companyName}
              onChange={(e) => handleChange("companyName", e.target.value)}
              placeholder={t("enter_company_name") || "Enter company name"}
              fullWidth
            />
          </div>

          {/* Company Name En */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              <Building size={14} className="inline mr-1" />
              {t("companyNameEn") || "Company Name (English)"}
            </label>
            <Input
              value={formData.companyNameEn}
              onChange={(e) => handleChange("companyNameEn", e.target.value)}
              placeholder={t("enter_company_name_en") || "Enter English company name"}
              fullWidth
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("email")}
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="contact@example.com"
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Customer Group Selection */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              <Users size={14} className="inline mr-1" />
              {t("customer_group") || "Customer Group"}
            </label>
            <Select
              value={formData.groupId}
              onChange={(e) => handleChange("groupId", e.target.value)}
              options={groupOptions}
              fullWidth
            />
            <p className="text-xs text-gray-500 mt-1">
              {t("group_helper") || "Assign this contact to a customer group for special discounts"}
            </p>
          </div>

          {/* Price List Selection */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("pricelist") || "Price List"}
            </label>
            <Select
              value={formData.pricelistId}
              onChange={(e) => handleChange("pricelistId", e.target.value)}
              options={pricelistOptions}
              fullWidth
            />
            <p className="text-xs text-gray-500 mt-1">
              {t("pricelist_helper") || "Select a price list to apply special pricing for this contact"}
            </p>
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              <Tag size={14} className="inline mr-1" />
              {t("tags")}
            </label>
            <div className="relative">
              <Tag size={18} className="absolute left-3 top-3 text-gray-400" />
              <TextArea
                value={formData.tags}
                onChange={(e) => handleChange("tags", e.target.value)}
                placeholder={t("tags_placeholder") || "VIP, Wholesale, Gold Customer (separate with commas)"}
                rows={2}
                fullWidth
                className="pl-10"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {t("tags_helper") || "Enter multiple tags separated by commas or spaces"}
            </p>
            {renderTagsPreview()}
          </div>

          {/* Address */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("address")}
            </label>
            <div className="relative">
              <MapPin size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder={t("enter_address")}
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              <Building size={14} className="inline mr-1" />
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
              <Star size={14} className="inline mr-1 text-yellow-500" />
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

          {/* Customer & Supplier Checkboxes */}
          <div className="col-span-2 space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {t("contact_type")}
            </label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isCustomer}
                  onChange={(e) => handleChange("isCustomer", e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">{t("customer")}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isSupplier}
                  onChange={(e) => handleChange("isSupplier", e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">{t("supplier")}</span>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div className="col-span-2 space-y-1">
            <label className="text-sm font-medium text-gray-700">
              <FileText size={14} className="inline mr-1" />
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
            {contactToEdit ? t("update_contact") : t("add_contact")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};