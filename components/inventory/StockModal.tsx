import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Package, Warehouse, ArrowDown, ArrowUp, Info } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { Stock, Product, Warehouse as WarehouseType } from "../../types";
import { useData } from "../../context/DataContext";
import { toast } from "sonner";

interface StockModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "in" | "out";
  onSave: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export const StockModal: React.FC<StockModalProps> = ({
  isOpen,
  onClose,
  mode,
  onSave,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const { products, warehouses } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    productId: "",
    warehouseId: "",
    qty: 0,
    unitCost: 0,
    referenceType: "manual_opening_balance",
    referenceId: "",
    notes: "",
  });

  useEffect(() => {
    if (!isOpen) return;
    setFormData({
      productId: "",
      warehouseId: "",
      qty: 0,
      unitCost: 0,
      referenceType: "manual_opening_balance",
      referenceId: `REF-${Date.now()}`,
      notes: "",
    });
  }, [isOpen]);

  const referenceTypeOptions = [
    { value: "manual_opening_balance", label: t("manual_opening_balance") },
    { value: "purchase_order", label: t("purchase_order") },
    { value: "sales_return", label: t("sales_return") },
    { value: "adjustment", label: t("adjustment") },
    { value: "transfer", label: t("transfer") },
  ];

  const productOptions = products.map(p => ({
    value: p._id || p.id,
    label: `${p.productName} (${p.sku})`,
  }));

  const warehouseOptions = warehouses.map(w => ({
    value: w._id || w.id,
    label: w.warehouseName,
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {mode === "in" ? <ArrowDown size={20} className="text-green-600" /> : <ArrowUp size={20} className="text-red-600" />}
          {mode === "in" ? t("stock_in") : t("stock_out")}
        </div>
      }
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Product */}
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

          {/* Warehouse */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("warehouse")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.warehouseId}
              onChange={(e) => handleChange("warehouseId", e.target.value)}
              options={warehouseOptions}
              placeholder={t("select_warehouse")}
              required
              fullWidth
            />
          </div>

          {/* Quantity */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("quantity")} <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.qty}
              onChange={(e) => handleChange("qty", Number(e.target.value))}
              placeholder="0"
              required
              fullWidth
            />
          </div>

          {/* Unit Cost */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("unit_cost")} (EGP) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.unitCost}
              onChange={(e) => handleChange("unitCost", Number(e.target.value))}
              placeholder="0.00"
              required
              fullWidth
            />
          </div>

          {/* Reference Type */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("reference_type")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.referenceType}
              onChange={(e) => handleChange("referenceType", e.target.value)}
              options={referenceTypeOptions}
              required
              fullWidth
            />
          </div>

          {/* Reference ID */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("reference_id")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.referenceId}
              onChange={(e) => handleChange("referenceId", e.target.value)}
              placeholder="PO-001, SO-001, ADJ-001..."
              required
              fullWidth
            />
          </div>

          {/* Notes */}
          <div className="col-span-2 space-y-1">
            <label className="text-sm font-medium text-gray-700">
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

        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center gap-2">
            <Info size={16} className="text-blue-600" />
            <p className="text-sm text-blue-800">
              {mode === "in" ? t("stock_in_info") : t("stock_out_info")}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting || isLoading}>
            {t("cancel")}
          </Button>
          <Button
            variant="primary"
            type="submit"
            className={mode === "in" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
            isLoading={isSubmitting || isLoading}
            disabled={isSubmitting || isLoading}
          >
            {mode === "in" ? t("add_stock_in") : t("add_stock_out")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};