import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Tag, DollarSign, Users, Package, Percent } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { PricingRule } from "../../types";
import { useData } from "../../context/DataContext";

interface PricingRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<PricingRule>) => Promise<void>;
  ruleToEdit?: PricingRule | null;
  isLoading?: boolean;
}

export const PricingRuleModal: React.FC<PricingRuleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  ruleToEdit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const { products, customers } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    ruleName: "",
    condition: "",
    priceChange: "",
    priceType: "PERCENTAGE",
    appliesTo: "PRODUCT",
    value: 0,
    status: "ACTIVE",
    productId: "",
    customerId: "",
  });

  useEffect(() => {
    if (ruleToEdit && isOpen) {
      setFormData({
        ruleName: ruleToEdit.ruleName || "",
        condition: ruleToEdit.condition || "",
        priceChange: ruleToEdit.priceChange || "",
        priceType: (ruleToEdit as any).priceType || "PERCENTAGE",
        appliesTo: ruleToEdit.appliesTo || "PRODUCT",
        value: (ruleToEdit as any).value || 0,
        status: ruleToEdit.status || "ACTIVE",
        productId: (ruleToEdit as any).productId || "",
        customerId: (ruleToEdit as any).customerId || "",
      });
    } else if (!ruleToEdit && isOpen) {
      setFormData({
        ruleName: "",
        condition: "",
        priceChange: "",
        priceType: "PERCENTAGE",
        appliesTo: "PRODUCT",
        value: 0,
        status: "ACTIVE",
        productId: "",
        customerId: "",
      });
    }
  }, [ruleToEdit, isOpen]);

  // Condition options
  const conditionOptions = [
    { value: "quantity >= 10", label: t("quantity_greater_than_10") },
    { value: "quantity >= 20", label: t("quantity_greater_than_20") },
    { value: "quantity >= 50", label: t("quantity_greater_than_50") },
    { value: "total >= 1000", label: t("total_greater_than_1000") },
    { value: "total >= 5000", label: t("total_greater_than_5000") },
    { value: "customer_type = vip", label: t("customer_vip") },
  ];

  // Price Type options - according to API expectations
  const priceTypeOptions = [
    { value: "PERCENTAGE", label: t("percentage") },
    { value: "FIXED", label: t("fixed_amount") },
  ];

  // Applies To options - according to API expectations
  const appliesToOptions = [
    { value: "PRODUCT", label: t("product") },
    { value: "CUSTOMER", label: t("customer") },
    { value: "CATEGORY", label: t("category") },
  ];

  // Status options - according to API expectations
  const statusOptions = [
    { value: "ACTIVE", label: t("active") },
    { value: "INACTIVE", label: t("inactive") },
  ];

  const productOptions = [
    { value: "", label: t("all_products") },
    ...products.map(p => ({
      value: p._id || p.id,
      label: `${p.productName} (${p.sku})`,
    })),
  ];

  const customerOptions = [
    { value: "", label: t("all_customers") },
    ...customers.map(c => ({
      value: c._id || c.id,
      label: c.customerName,
    })),
  ];

  const categoryOptions = [
    { value: "", label: t("all_categories") },
    { value: "Electronics", label: "Electronics" },
    { value: "Laptops", label: "Laptops" },
    { value: "Accessories", label: "Accessories" },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSave({
        ruleName: formData.ruleName,
        condition: formData.condition,
        priceChange: formData.priceChange,
        priceType: formData.priceType,
        appliesTo: formData.appliesTo,
        value: formData.value,
        status: formData.status,
        productId: formData.productId || undefined,
        customerId: formData.customerId || undefined,
      });
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
  const priceType = formData.priceType;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {ruleToEdit ? <Edit2 size={20} /> : <Plus size={20} />}
          {ruleToEdit ? t("edit_pricing_rule") : t("add_pricing_rule")}
        </div>
      }
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Rule Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("rule_name")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.ruleName}
              onChange={(e) => handleChange("ruleName", e.target.value)}
              placeholder={t("enter_rule_name")}
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

          {/* Condition */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("condition")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.condition}
              onChange={(e) => handleChange("condition", e.target.value)}
              options={conditionOptions}
              placeholder={t("select_condition")}
              required
              fullWidth
            />
          </div>

          {/* Price Type */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("price_type")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.priceType}
              onChange={(e) => handleChange("priceType", e.target.value)}
              options={priceTypeOptions}
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
              step="0.01"
              value={formData.value}
              onChange={(e) => handleChange("value", Number(e.target.value))}
              placeholder={priceType === "PERCENTAGE" ? "10" : "100"}
              required
              fullWidth
            />
            {priceType === "PERCENTAGE" && (
              <p className="text-xs text-gray-500">{t("percentage_of_price")}</p>
            )}
            {priceType === "FIXED" && (
              <p className="text-xs text-gray-500">{t("fixed_amount_egp")}</p>
            )}
          </div>

          {/* Applies To */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("applies_to")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.appliesTo}
              onChange={(e) => handleChange("appliesTo", e.target.value)}
              options={appliesToOptions}
              required
              fullWidth
            />
          </div>

          {/* Conditional fields based on appliesTo */}
          {appliesTo === "PRODUCT" && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("product")}
              </label>
              <Select
                value={formData.productId}
                onChange={(e) => handleChange("productId", e.target.value)}
                options={productOptions}
                placeholder={t("select_product")}
                fullWidth
              />
            </div>
          )}

          {appliesTo === "CUSTOMER" && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("customer")}
              </label>
              <Select
                value={formData.customerId}
                onChange={(e) => handleChange("customerId", e.target.value)}
                options={customerOptions}
                placeholder={t("select_customer")}
                fullWidth
              />
            </div>
          )}

          {appliesTo === "CATEGORY" && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("category")}
              </label>
              <Select
                value={formData.productId} // Using productId as category selector
                onChange={(e) => handleChange("productId", e.target.value)}
                options={categoryOptions}
                placeholder={t("select_category")}
                fullWidth
              />
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Tag size={16} className="text-indigo-600" />
            <span>{t("rule_preview")}:</span>
            <span className="font-medium">
              {formData.condition && formData.priceType && formData.value
                ? `${formData.condition} → ${formData.priceType === "PERCENTAGE" ? formData.value + "%" : formData.value + " EGP"} ${t("discount")}`
                : t("select_condition_and_price_change")}
            </span>
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
            {ruleToEdit ? t("save") : t("add_pricing_rule")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};