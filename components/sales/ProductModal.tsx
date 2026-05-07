import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Package, Barcode, Tag, DollarSign, Layers, Box, Hash, CircleDollarSign } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea, Switch } from "../../components/ui/Common";
import { Product } from "../../types";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Product>) => Promise<void>;
  productToEdit?: Product | null;
  isLoading?: boolean;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  productToEdit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    sku: "",
    productName: "",
    category: "",
    productType: "STOCKABLE",
    salesPrice: 0,
    cost: 0,
    description: "",
    unitOfMeasure: "pcs",
    barcode: "",
    hasExpiry: false,
    status: "ACTIVE",
  });

  useEffect(() => {
    if (!isOpen) return;

    if (productToEdit) {
      // Editing existing product
      setFormData({
        sku: productToEdit.sku || "",
        productName: productToEdit.productName || "",
        category: productToEdit.category || "",
        productType: productToEdit.productType || "STOCKABLE",
        salesPrice: productToEdit.salesPrice || 0,
        cost: productToEdit.cost || 0,
        description: productToEdit.description || "",
        unitOfMeasure: productToEdit.unitOfMeasure || "pcs",
        barcode: productToEdit.barcode || "",
        hasExpiry: productToEdit.hasExpiry || false,
        status: productToEdit.status || "ACTIVE",
      });
    } else {
      // Creating new product
      setFormData({
        sku: "",
        productName: "",
        category: "",
        productType: "STOCKABLE",
        salesPrice: 0,
        cost: 0,
        description: "",
        unitOfMeasure: "pcs",
        barcode: "",
        hasExpiry: false,
        status: "ACTIVE",
      });
    }
  }, [productToEdit, isOpen]);

  const categoryOptions = [
    { value: "Electronics", label: "Electronics" },
    { value: "Laptops", label: "Laptops" },
    { value: "Services", label: "Services" },
    { value: "Furniture", label: "Furniture" },
    { value: "Clothing", label: "Clothing" },
    { value: "Other", label: "Other" },
  ];

  const productTypeOptions = [
    { value: "STOCKABLE", label: t("stockable") },
    { value: "SERVICE", label: t("service") },
    { value: "CONSUMABLE", label: t("consumable") },
  ];

  const unitOptions = [
    { value: "pcs", label: "pcs" },
    { value: "kg", label: "kg" },
    { value: "m", label: "m" },
    { value: "liters", label: "liters" },
    { value: "boxes", label: "boxes" },
  ];

  const statusOptions = [
    { value: "ACTIVE", label: t("active") },
    { value: "INACTIVE", label: t("inactive") },
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
          {productToEdit ? <Edit2 size={20} /> : <Plus size={20} />}
          {productToEdit ? t("edit_product") : t("add_product")}
        </div>
      }
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* SKU */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("sku")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Hash size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={formData.sku}
                onChange={(e) => handleChange("sku", e.target.value)}
                placeholder="PRD-001"
                required
                fullWidth
                className="pl-10"
                disabled={!!productToEdit}
              />
            </div>
          </div>

          {/* Product Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("product_name")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Package size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={formData.productName}
                onChange={(e) => handleChange("productName", e.target.value)}
                placeholder={t("enter_product_name")}
                required
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("category")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Tag size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Select
                value={formData.category}
                onChange={(e) => handleChange("category", e.target.value)}
                options={categoryOptions}
                placeholder={t("select_category")}
                required
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Product Type */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("product_type")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Layers size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Select
                value={formData.productType}
                onChange={(e) => handleChange("productType", e.target.value)}
                options={productTypeOptions}
                required
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Sales Price */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("sales_price")} (EGP) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <DollarSign size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.salesPrice}
                onChange={(e) => handleChange("salesPrice", Number(e.target.value))}
                placeholder="0.00"
                required
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Cost */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("cost")} (EGP) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <CircleDollarSign size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.cost}
                onChange={(e) => handleChange("cost", Number(e.target.value))}
                placeholder="0.00"
                required
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Unit of Measure */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("unit_of_measure")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Box size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Select
                value={formData.unitOfMeasure}
                onChange={(e) => handleChange("unitOfMeasure", e.target.value)}
                options={unitOptions}
                required
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Barcode */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("barcode")}
            </label>
            <div className="relative">
              <Barcode size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={formData.barcode}
                onChange={(e) => handleChange("barcode", e.target.value)}
                placeholder="123456789"
                fullWidth
                className="pl-10"
              />
            </div>
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

          {/* Has Expiry */}
          <div className="space-y-1 flex items-center gap-3 pt-6">
            <Switch
              checked={formData.hasExpiry}
              onChange={(checked) => handleChange("hasExpiry", checked)}
            />
            <label className="text-sm font-medium text-gray-700">
              {t("has_expiry_date")}
            </label>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            {t("description")}
          </label>
          <TextArea
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder={t("enter_product_description")}
            rows={3}
            fullWidth
          />
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
            {productToEdit ? t("update_product") : t("add_product")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};