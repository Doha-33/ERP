import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Edit2,
  Percent,
  DollarSign,
  Tag,
  Users,
  Package,
  Calendar,
  Gift,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
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
    customerId: "",
    value: 0,
    startDate: "",
    endDate: "",
    status: "ACTIVE",
  });

  useEffect(() => {
    if (discountToEdit && isOpen) {
      const productId =
        typeof discountToEdit.productId === "object"
          ? (discountToEdit.productId as any)?._id
          : discountToEdit.productId;
      const customerId =
        typeof discountToEdit.customerId === "object"
          ? (discountToEdit.customerId as any)?._id
          : discountToEdit.customerId;

      setFormData({
        discountName: discountToEdit.discountName || "",
        type: discountToEdit.type || "PERCENTAGE",
        appliesTo: discountToEdit.appliesTo || "PRODUCT",
        productId: productId || "",
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
    { value: "FIXED", label: t("fixed_amount"), icon: DollarSign },
  ];

  const appliesToOptions = [
    { value: "PRODUCT", label: t("product") },
    { value: "CUSTOMER", label: t("customer") },
    { value: "ORDER_TOTAL", label: t("order_total") },
  ];

  const statusOptions = [
    { value: "ACTIVE", label: t("active"), icon: CheckCircle, color: "green" },
    { value: "INACTIVE", label: t("inactive"), icon: XCircle, color: "red" },
    {
      value: "EXPIRED",
      label: t("expired"),
      icon: AlertCircle,
      color: "orange",
    },
  ];
  const productOptions = products.map((p) => ({
    value: p._id || p.id,
    label: `${p.productName} (${p.sku})`,
  }));

  const customerOptions = customers.map((c) => ({
    value: c._id || c.id,
    label: c.customerName,
  }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare the data to send based on appliesTo value
      const dataToSend: Partial<Discount> = {
        discountName: formData.discountName,
        type: formData.type as "PERCENTAGE" | "FIXED",
        appliesTo: formData.appliesTo as "PRODUCT" | "CUSTOMER" | "ORDER_TOTAL",
        value: formData.value,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        status: formData.status as "ACTIVE" | "INACTIVE" | "EXPIRED",
      };

      // Only include productId if appliesTo is PRODUCT
      if (formData.appliesTo === "PRODUCT") {
        dataToSend.productId = formData.productId;
      }

      // Only include customerId if appliesTo is CUSTOMER
      if (formData.appliesTo === "CUSTOMER") {
        dataToSend.customerId = formData.customerId;
      }

      await onSave(dataToSend);
      onClose();
    } catch (error) {
      console.error("Error in form submission:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
              <p className="text-xs text-gray-500">
                {t("percentage_of_total")}
              </p>
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
                onChange={(e) => {
                  handleChange("appliesTo", e.target.value);
                  // Clear productId and customerId when switching appliesTo type
                  if (e.target.value !== "PRODUCT") {
                    handleChange("productId", "");
                  }
                  if (e.target.value !== "CUSTOMER") {
                    handleChange("customerId", "");
                  }
                }}
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
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting || isLoading}
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
            {discountToEdit ? t("save") : t("add_discount")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
