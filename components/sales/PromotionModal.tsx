import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Tag, Percent, DollarSign, Gift, Truck, Calendar, Users, Package, Hash } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { Promotion } from "../../types";
import { useData } from "../../context/DataContext";

interface PromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Promotion>) => Promise<void>;
  promotionToEdit?: Promotion | null;
  isLoading?: boolean;
}

export const PromotionModal: React.FC<PromotionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  promotionToEdit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const { products } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    promotionName: "",
    type: "PERCENTAGE",
    conditionType: "ORDER_TOTAL",
    value: 0,
    benefitDescription: "",
    startDate: "",
    endDate: "",
    status: "ACTIVE",
    promoCode: "",
    applicableProducts: [] as string[],
  });

  useEffect(() => {
    if (promotionToEdit && isOpen) {
      setFormData({
        promotionName: promotionToEdit.promotionName || "",
        type: promotionToEdit.type || "PERCENTAGE",
        conditionType: promotionToEdit.conditionType || "ORDER_TOTAL",
        value: promotionToEdit.value || 0,
        benefitDescription: promotionToEdit.benefitDescription || "",
        startDate: promotionToEdit.startDate
          ? new Date(promotionToEdit.startDate).toISOString().split("T")[0]
          : "",
        endDate: promotionToEdit.endDate
          ? new Date(promotionToEdit.endDate).toISOString().split("T")[0]
          : "",
        status: promotionToEdit.status || "ACTIVE",
        promoCode: (promotionToEdit as any).promoCode || "",
        applicableProducts: (promotionToEdit as any).applicableProducts || [],
      });
    } else if (!promotionToEdit && isOpen) {
      setFormData({
        promotionName: "",
        type: "PERCENTAGE",
        conditionType: "ORDER_TOTAL",
        value: 0,
        benefitDescription: "",
        startDate: "",
        endDate: "",
        status: "ACTIVE",
        promoCode: "",
        applicableProducts: [],
      });
    }
  }, [promotionToEdit, isOpen]);

  const promotionTypeOptions = [
    { value: "PERCENTAGE", label: t("percentage"), icon: Percent },
    { value: "FIXED", label: t("fixed_amount"), icon: DollarSign },
    { value: "BUY_X_GET_Y", label: t("buy_x_get_y"), icon: Gift },
    { value: "FREE_SHIPPING", label: t("free_shipping"), icon: Truck },
  ];

  // Updated condition types to match backend expectations
  const conditionTypeOptions = [
    { value: "ORDER_TOTAL", label: t("order_total"), icon: DollarSign },
    { value: "PRODUCT_QTY", label: t("product_quantity"), icon: Package },
    { value: "CUSTOMER", label: t("customer"), icon: Users },
    { value: "PROMO_CODE", label: t("promo_code"), icon: Hash },
  ];

  const statusOptions = [
    { value: "ACTIVE", label: t("active") },
    { value: "SCHEDULED", label: t("scheduled") },
    { value: "EXPIRED", label: t("expired") },
  ];

  const productOptions = products.map(p => ({
    value: p._id || p.id,
    label: `${p.productName} (${p.sku})`,
  }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Prepare data according to condition type
      const dataToSend: any = {
        promotionName: formData.promotionName,
        type: formData.type,
        conditionType: formData.conditionType,
        benefitDescription: formData.benefitDescription,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        status: formData.status,
      };

      // Handle different condition types
      if (formData.conditionType === "PROMO_CODE") {
        dataToSend.promoCode = formData.promoCode;
        dataToSend.value = formData.value;
      } else if (formData.conditionType === "ORDER_TOTAL") {
        dataToSend.minOrderTotal = formData.value;
        dataToSend.value = formData.value;
      } else if (formData.conditionType === "PRODUCT_QTY") {
        dataToSend.applicableProducts = formData.applicableProducts;
        dataToSend.value = formData.value;
      } else if (formData.conditionType === "CUSTOMER") {
        dataToSend.value = formData.value;
      }

      // If promotion type is not percentage or fixed, adjust value handling
      if (formData.type === "BUY_X_GET_Y") {
        dataToSend.buyQuantity = formData.value;
        dataToSend.getQuantity = 1; // You can make this configurable
      } else if (formData.type === "FREE_SHIPPING") {
        dataToSend.value = 0;
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
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProductToggle = (productId: string) => {
    setFormData(prev => ({
      ...prev,
      applicableProducts: prev.applicableProducts.includes(productId)
        ? prev.applicableProducts.filter(id => id !== productId)
        : [...prev.applicableProducts, productId],
    }));
  };

  const conditionType = formData.conditionType;
  const promotionType = formData.type;

  // Determine if value field should be shown
  const showValueField = () => {
    if (promotionType === "FREE_SHIPPING") return false;
    if (promotionType === "BUY_X_GET_Y") return true;
    if (conditionType === "PRODUCT_QTY") return true;
    return true;
  };

  // Determine value field label
  const getValueLabel = () => {
    if (promotionType === "PERCENTAGE") return t("discount_percentage");
    if (promotionType === "FIXED") return t("discount_amount");
    if (promotionType === "BUY_X_GET_Y") return t("buy_quantity");
    if (conditionType === "ORDER_TOTAL") return t("minimum_order_total");
    if (conditionType === "PRODUCT_QTY") return t("minimum_quantity");
    return t("value");
  };

  // Determine value field placeholder
  const getValuePlaceholder = () => {
    if (promotionType === "PERCENTAGE") return "10";
    if (promotionType === "FIXED") return "100";
    if (promotionType === "BUY_X_GET_Y") return "2";
    if (conditionType === "ORDER_TOTAL") return "500";
    if (conditionType === "PRODUCT_QTY") return "3";
    return "0";
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {promotionToEdit ? <Edit2 size={20} /> : <Plus size={20} />}
          {promotionToEdit ? t("edit_promotion") : t("add_promotion")}
        </div>
      }
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto px-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Promotion Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("promotion_name")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.promotionName}
              onChange={(e) => handleChange("promotionName", e.target.value)}
              placeholder={t("enter_promotion_name")}
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

          {/* Promotion Type */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("promotion_type")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.type}
              onChange={(e) => handleChange("type", e.target.value)}
              options={promotionTypeOptions}
              required
              fullWidth
            />
          </div>

          {/* Value - conditional based on promotion type and condition type */}
          {showValueField() && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {getValueLabel()} <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                step={promotionType === "PERCENTAGE" ? "1" : "0.01"}
                value={formData.value}
                onChange={(e) => handleChange("value", Number(e.target.value))}
                placeholder={getValuePlaceholder()}
                required={showValueField()}
                fullWidth
              />
              {promotionType === "PERCENTAGE" && (
                <p className="text-xs text-gray-500">{t("percentage_discount")}</p>
              )}
              {promotionType === "FIXED" && (
                <p className="text-xs text-gray-500">{t("fixed_amount_egp")}</p>
              )}
              {promotionType === "BUY_X_GET_Y" && (
                <p className="text-xs text-gray-500">{t("buy_x_get_y_description")}</p>
              )}
              {conditionType === "ORDER_TOTAL" && (
                <p className="text-xs text-gray-500">{t("minimum_order_total_description")}</p>
              )}
            </div>
          )}

          {/* Condition Type */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("condition_type")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.conditionType}
              onChange={(e) => {
                handleChange("conditionType", e.target.value);
                // Reset relevant fields when changing condition type
                if (e.target.value !== "PROMO_CODE") {
                  handleChange("promoCode", "");
                }
                if (e.target.value !== "PRODUCT_QTY") {
                  handleChange("applicableProducts", []);
                }
              }}
              options={conditionTypeOptions}
              required
              fullWidth
            />
          </div>

          {/* Promo Code field */}
          {conditionType === "PROMO_CODE" && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("promo_code")} <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.promoCode}
                onChange={(e) => handleChange("promoCode", e.target.value.toUpperCase())}
                placeholder="SUMMER2024"
                required
                fullWidth
              />
              <p className="text-xs text-gray-500">{t("customers_must_enter_this_code")}</p>
            </div>
          )}
        </div>

        {/* Benefit Description */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            {t("benefit_description")} <span className="text-red-500">*</span>
          </label>
          <TextArea
            value={formData.benefitDescription}
            onChange={(e) => handleChange("benefitDescription", e.target.value)}
            placeholder={t("enter_benefit_description")}
            rows={2}
            required
            fullWidth
          />
        </div>

        {/* Date Range */}
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

        {/* Applicable Products (for PRODUCT_QTY condition) */}
        {conditionType === "PRODUCT_QTY" && (
          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package size={18} className="text-indigo-600" />
              {t("applicable_products")} <span className="text-red-500">*</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-3 bg-gray-50 rounded-lg">
              {productOptions.length > 0 ? (
                productOptions.map(product => (
                  <label key={product.value} className="flex items-center gap-2 p-2 hover:bg-white rounded cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.applicableProducts.includes(product.value)}
                      onChange={() => handleProductToggle(product.value)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">{product.label}</span>
                  </label>
                ))
              ) : (
                <p className="text-sm text-gray-500 col-span-full text-center py-4">
                  {t("no_products_available")}
                </p>
              )}
            </div>
            {formData.applicableProducts.length === 0 && (
              <p className="text-xs text-amber-600 mt-2">
                {t("please_select_at_least_one_product")}
              </p>
            )}
          </div>
        )}

        {/* Preview */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Tag size={16} className="text-indigo-600" />
            <span className="font-medium">{t("promotion_preview")}:</span>
            <span>
              {formData.promotionName
                ? `${formData.promotionName} - ${formData.benefitDescription || t("no_description")}`
                : t("fill_details_to_preview")}
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
            {promotionToEdit ? t("save") : t("add_promotion")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};