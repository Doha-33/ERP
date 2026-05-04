import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Percent, DollarSign, Tag, Users, Package, Calendar, Gift } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { Discount } from "../../types";
import { useData } from "../../context/DataContext";

interface DiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Discount>) => Promise<void>;
  discountToEdit?: Discount | null;
  isLoading?: boolean;
}

export const DiscountModal: React.FC<DiscountModalProps> = ({
  isOpen,
  onClose,
  onSave,
  discountToEdit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const { customers, products, categories } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    discountName: "",
    type: "PERCENTAGE",
    appliesTo: "PRODUCT",
    productId: "",
    categoryId: "",
    customerId: "",
    value: 0,
    startDate: "",
    endDate: "",
    status: "ACTIVE",
  });

  useEffect(() => {
    if (discountToEdit && isOpen) {
      const productId = typeof discountToEdit.productId === "object"
        ? (discountToEdit.productId as any)?._id
        : discountToEdit.productId;
      const customerId = typeof discountToEdit.customerId === "object"
        ? (discountToEdit.customerId as any)?._id
        : discountToEdit.customerId;
      const categoryId = discountToEdit.categoryId;

      setFormData({
        discountName: discountToEdit.discountName || "",
        type: discountToEdit.type || "PERCENTAGE",
        appliesTo: discountToEdit.appliesTo || "PRODUCT",
        productId: productId || "",
        categoryId: categoryId || "",
        customerId: customerId || "",
        value: discountToEdit.value || 0,
        startDate: discountToEdit.startDate
          ? new Date(discountToEdit.startDate).toISOString().split("T")[0]
          : "",
        endDate: discountToEdit.endDate
          ? new Date(discountToEdit.endDate).toISOString().split("T")[0]
          : "",
        status: discountToEdit.status || "ACTIVE",
      });
    } else if (!discountToEdit && isOpen) {
      setFormData({
        discountName: "",
        type: "PERCENTAGE",
        appliesTo: "PRODUCT",
        productId: "",
        categoryId: "",
        customerId: "",
        value: 0,
        startDate: "",
        endDate: "",
        status: "ACTIVE",
      });
    }
  }, [discountToEdit, isOpen]);

  const typeOptions = [
    { value: "PERCENTAGE", label: t("percentage"), icon: Percent },
    { value: "FIXED_AMOUNT", label: t("fixed_amount"), icon: DollarSign },
    { value: "BUY_X_GET_Y", label: t("buy_x_get_y"), icon: Gift },
  ];

  const appliesToOptions = [
    { value: "PRODUCT", label: t("product") },
    { value: "CATEGORY", label: t("category") },
    { value: "CUSTOMER", label: t("customer") },
    { value: "CUSTOMER_GROUP", label: t("customer_group") },
    { value: "ORDER_TOTAL", label: t("order_total") },
  ];

  const statusOptions = [
    { value: "ACTIVE", label: t("active") },
    { value: "INACTIVE", label: t("inactive") },
    { value: "EXPIRED", label: t("expired") },
  ];

  const productOptions = products.map(p => ({
    value: p._id || p.id,
    label: `${p.productName} (${p.sku})`,
  }));

  const categoryOptions = categories.map(c => ({
    value: c._id || c.id,
    label: c.name || c.categoryName,
  }));

  const customerOptions = customers.map(c => ({
    value: c._id || c.id,
    label: c.customerName,
  }));

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

  const appliesTo = formData.appliesTo;
  const discountType = formData.type;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {discountToEdit ? <Edit2 size={20} /> : <Plus size={20} />}
          {discountToEdit ? t("edit_discount") : t("add_discount")}
        </div>
      }
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Discount Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("discount_name")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.discountName}
              onChange={(e) => handleChange("discountName", e.target.value)}
              placeholder={t("enter_discount_name")}
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
              value={formData.status}
              onChange={(e) => handleChange("status", e.target.value)}
              options={statusOptions}
              required
              fullWidth
            />
          </div>

          {/* Discount Type */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("discount_type")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.type}
              onChange={(e) => handleChange("type", e.target.value)}
              options={typeOptions}
              required
              fullWidth
            />
          </div>

          {/* Value */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("value")} <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step={discountType === "PERCENTAGE" ? "1" : "0.01"}
              value={formData.value}
              onChange={(e) => handleChange("value", Number(e.target.value))}
              placeholder={discountType === "PERCENTAGE" ? "10" : "100"}
              required
              fullWidth
            />
            {discountType === "PERCENTAGE" && (
              <p className="text-xs text-gray-500">{t("percentage_of_total")}</p>
            )}
          </div>
        </div>

        {/* Applies To Section */}
        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Tag size={18} className="text-indigo-600" />
            {t("applies_to")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("applies_to_type")} <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.appliesTo}
                onChange={(e) => handleChange("appliesTo", e.target.value)}
                options={appliesToOptions}
                required
                fullWidth
              />
            </div>

            {appliesTo === "PRODUCT" && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  {t("product")} <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.productId}
                  onChange={(e) => handleChange("productId", e.target.value)}
                  options={productOptions}
                  placeholder={t("select_product")}
                  required
                  fullWidth
                />
              </div>
            )}

            {appliesTo === "CATEGORY" && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  {t("category")} <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.categoryId}
                  onChange={(e) => handleChange("categoryId", e.target.value)}
                  options={categoryOptions}
                  placeholder={t("select_category")}
                  required
                  fullWidth
                />
              </div>
            )}

            {appliesTo === "CUSTOMER" && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  {t("customer")} <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.customerId}
                  onChange={(e) => handleChange("customerId", e.target.value)}
                  options={customerOptions}
                  placeholder={t("select_customer")}
                  required
                  fullWidth
                />
              </div>
            )}
          </div>
        </div>

        {/* Date Range */}
        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-indigo-600" />
            {t("validity_period")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("start_date")}
              </label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
                fullWidth
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("end_date")}
              </label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleChange("endDate", e.target.value)}
                fullWidth
              />
            </div>
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
            loading={isSubmitting || isLoading}
            disabled={isSubmitting || isLoading}
          >
            {discountToEdit ? t("save") : t("add_discount")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};