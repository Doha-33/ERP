import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Tag, DollarSign, Users, Package, Percent, AlertCircle } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { PricingRule } from "../../types";
import { useData } from "../../context/DataContext";
import { toast } from "sonner";

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
    priceType: "PERCENTAGE",
    appliesTo: "PRODUCT",
    value: 0,
    status: "ACTIVE",
    productId: "",
    customerId: "",
  });

  useEffect(() => {
    if (!isOpen) return;

    if (ruleToEdit) {
      // Editing existing rule
      setFormData({
        ruleName: ruleToEdit.ruleName || "",
        condition: ruleToEdit.condition || "",
        priceType: (ruleToEdit as any).priceType || "PERCENTAGE",
        appliesTo: ruleToEdit.appliesTo || "PRODUCT",
        value: (ruleToEdit as any).value || 0,
        status: ruleToEdit.status || "ACTIVE",
        productId: (ruleToEdit as any).productId || "",
        customerId: (ruleToEdit as any).customerId || "",
      });
    } else {
      // Creating new rule
      setFormData({
        ruleName: "",
        condition: "",
        priceType: "PERCENTAGE",
        appliesTo: "PRODUCT",
        value: 0,
        status: "ACTIVE",
        productId: "",
        customerId: "",
      });
    }
  }, [ruleToEdit, isOpen]);

  const conditionOptions = [
    { value: "quantity >= 10", label: t("quantity_greater_than_10") },
    { value: "quantity >= 20", label: t("quantity_greater_than_20") },
    { value: "quantity >= 50", label: t("quantity_greater_than_50") },
    { value: "quantity >= 100", label: t("quantity_greater_than_100") },
    { value: "total >= 1000", label: t("total_greater_than_1000") },
    { value: "total >= 5000", label: t("total_greater_than_5000") },
    { value: "total >= 10000", label: t("total_greater_than_10000") },
    { value: "customer_type = VIP", label: t("customer_vip") },
    { value: "customer_type = WHOLESALE", label: t("customer_wholesale") },
  ];

  const priceTypeOptions = [
    { value: "PERCENTAGE", label: t("percentage_off"), icon: Percent },
    { value: "FIXED", label: t("fixed_amount_off"), icon: DollarSign },
  ];

  const appliesToOptions = [
    { value: "PRODUCT", label: t("specific_product"), icon: Package },
    { value: "CUSTOMER", label: t("specific_customer"), icon: Users },
    { value: "ALL", label: t("all_orders"), icon: Tag },
  ];

  const statusOptions = [
    { value: "ACTIVE", label: t("active"), color: "green" },
    { value: "INACTIVE", label: t("inactive"), color: "red" },
  ];

  const productOptions = [
    { value: "", label: t("all_products") },
    ...products.map(p => ({
      value: (p as any)._id || p.id,
      label: `${p.productName} (${p.sku})`,
    })),
  ];

  const customerOptions = [
    { value: "", label: t("all_customers") },
    ...customers.map(c => ({
      value: (c as any)._id || c.id,
      label: c.customerName,
    })),
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation
    if (!formData.ruleName.trim()) {
      toast.error(t("rule_name_required"));
      return;
    }
    
    if (!formData.condition) {
      toast.error(t("condition_required"));
      return;
    }
    
    if (formData.value <= 0) {
      toast.error(t("value_must_be_positive"));
      return;
    }
    
    if (formData.priceType === "PERCENTAGE" && formData.value > 100) {
      toast.error(t("percentage_cannot_exceed_100"));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const saveData: Partial<PricingRule> = {
        ruleName: formData.ruleName,
        condition: formData.condition,
        priceType: formData.priceType,
        appliesTo: formData.appliesTo,
        value: formData.value,
        status: formData.status,
        priceChange: `${formData.priceType === "PERCENTAGE" ? formData.value + "%" : formData.value + " EGP"} ${t("discount")}`,
      };
      
      // Add conditional fields
      if (formData.appliesTo === "PRODUCT" && formData.productId) {
        (saveData as any).productId = formData.productId;
      }
      
      if (formData.appliesTo === "CUSTOMER" && formData.customerId) {
        (saveData as any).customerId = formData.customerId;
      }
      
      console.log("Saving pricing rule:", saveData);
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

  const appliesTo = formData.appliesTo;
  const priceType = formData.priceType;

  // Generate preview text
  const getPreviewText = () => {
    if (!formData.condition || !formData.value) {
      return t("select_condition_and_value");
    }
    
    const discountText = priceType === "PERCENTAGE" 
      ? `${formData.value}% ${t("discount")}`
      : `${formData.value} EGP ${t("discount")}`;
    
    let targetText = "";
    if (appliesTo === "PRODUCT" && formData.productId) {
      const product = products.find(p => ((p as any)._id || p.id) === formData.productId);
      targetText = t("on_product", { product: product?.productName || t("selected_product") });
    } else if (appliesTo === "CUSTOMER" && formData.customerId) {
      const customer = customers.find(c => ((c as any)._id || c.id) === formData.customerId);
      targetText = t("for_customer", { customer: customer?.customerName || t("selected_customer") });
    } else {
      targetText = t("on_all_orders");
    }
    
    return `${formData.condition} → ${discountText} ${targetText}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {ruleToEdit ? <Edit2 size={20} /> : <Plus size={20} />}
          {ruleToEdit ? t("edit_pricing_rule") : t("create_pricing_rule")}
        </div>
      }
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Rule Name */}
          <div className="col-span-2 space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("rule_name")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Tag size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={formData.ruleName}
                onChange={(e) => handleChange("ruleName", e.target.value)}
                placeholder={t("enter_rule_name", { example: "Summer Sale 2024" })}
                required
                fullWidth
                className="pl-10"
              />
            </div>
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
              {t("discount_type")} <span className="text-red-500">*</span>
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
              {t("discount_value")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              {priceType === "PERCENTAGE" ? (
                <Percent size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              ) : (
                <DollarSign size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              )}
              <Input
                type="number"
                step={priceType === "PERCENTAGE" ? "1" : "0.01"}
                min="0"
                max={priceType === "PERCENTAGE" ? "100" : undefined}
                value={formData.value}
                onChange={(e) => handleChange("value", Number(e.target.value))}
                placeholder={priceType === "PERCENTAGE" ? "10" : "100"}
                required
                fullWidth
                className="pl-10"
              />
            </div>
            {priceType === "PERCENTAGE" && formData.value > 100 && (
              <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                <AlertCircle size={12} />
                <span>{t("percentage_cannot_exceed_100")}</span>
              </div>
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

          {/* Conditional fields based on appliesTo */}
          {appliesTo === "PRODUCT" && (
            <div className="col-span-2 space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("product")}
              </label>
              <div className="relative">
                <Package size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Select
                  value={formData.productId}
                  onChange={(e) => handleChange("productId", e.target.value)}
                  options={productOptions}
                  placeholder={t("select_product_or_all")}
                  fullWidth
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-gray-500">{t("leave_empty_for_all_products")}</p>
            </div>
          )}

          {appliesTo === "CUSTOMER" && (
            <div className="col-span-2 space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("customer")}
              </label>
              <div className="relative">
                <Users size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Select
                  value={formData.customerId}
                  onChange={(e) => handleChange("customerId", e.target.value)}
                  options={customerOptions}
                  placeholder={t("select_customer_or_all")}
                  fullWidth
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-gray-500">{t("leave_empty_for_all_customers")}</p>
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-100">
          <div className="flex items-center gap-2 text-sm">
            <Tag size={16} className="text-indigo-600" />
            <span className="text-gray-700">{t("rule_preview")}:</span>
            <span className="font-medium text-indigo-700">
              {getPreviewText()}
            </span>
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
            disabled={isSubmitting || isLoading || (formData.priceType === "PERCENTAGE" && formData.value > 100)}
          >
            {ruleToEdit ? t("update_rule") : t("create_rule")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};