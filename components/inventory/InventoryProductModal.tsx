import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Package, DollarSign, Warehouse, Tag, Barcode, Upload } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea, FileUpload } from "../../components/ui/Common";
import { Product } from "../../types";
import { useData } from "../../context/DataContext";

interface InventoryProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Product>) => Promise<void>;
  productToEdit?: Product | null;
  isLoading?: boolean;
}

export const InventoryProductModal: React.FC<InventoryProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  productToEdit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const { categories, warehouses, units } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    sku: "",
    productName: "",
    barcode: "",
    image: "",
    category: "",
    defaultUnit: "",
    isStockItem: "YES",
    companyName: "",
    openingStock: 0,
    reorderLevel: 0,
    warehouseId: "",
    currentStockQty: 0,
    expired: "NO",
    purchasePrice: 0,
    sellingPrice: 0,
    description: "",
  });

  useEffect(() => {
    if (productToEdit && isOpen) {
      const warehouseId = typeof productToEdit.warehouseId === "object"
        ? (productToEdit.warehouseId as any)?._id
        : productToEdit.warehouseId;

      setFormData({
        sku: productToEdit.sku || "",
        productName: productToEdit.productName || "",
        barcode: productToEdit.barcode || "",
        image: productToEdit.image || "",
        category: productToEdit.category || "",
        defaultUnit: productToEdit.defaultUnit || "",
        isStockItem: productToEdit.isStockItem || "YES",
        companyName: productToEdit.companyName || "",
        openingStock: productToEdit.openingStock || 0,
        reorderLevel: productToEdit.reorderLevel || 0,
        warehouseId: warehouseId || "",
        currentStockQty: productToEdit.currentStockQty || 0,
        expired: productToEdit.expired || "NO",
        purchasePrice: productToEdit.purchasePrice || 0,
        sellingPrice: productToEdit.sellingPrice || 0,
        description: productToEdit.description || "",
      });
    } else if (!productToEdit && isOpen) {
      const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      setFormData({
        sku: `PROD-${randomNum}`,
        productName: "",
        barcode: "",
        image: "",
        category: "",
        defaultUnit: "",
        isStockItem: "YES",
        companyName: "",
        openingStock: 0,
        reorderLevel: 0,
        warehouseId: "",
        currentStockQty: 0,
        expired: "NO",
        purchasePrice: 0,
        sellingPrice: 0,
        description: "",
      });
    }
  }, [productToEdit, isOpen]);

  const categoryOptions = categories.map(c => ({
    value: c.name || c.categoryName,
    label: c.name || c.categoryName,
  }));

  const unitOptions = units.map(u => ({
    value: u.name,
    label: `${u.name} (${u.abbreviation})`,
  }));

  const warehouseOptions = warehouses.map(w => ({
    value: w._id || w.id,
    label: w.warehouseName,
  }));

  const expiredOptions = [
    { value: "YES", label: t("yes") },
    { value: "NO", label: t("no") },
  ];

  const stockItemOptions = [
    { value: "YES", label: t("yes") },
    { value: "NO", label: t("no") },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSave({
        ...formData,
        currentStockQty: formData.openingStock,
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

  const handleImageChange = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
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
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto px-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* SKU */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("sku")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.sku}
              onChange={(e) => handleChange("sku", e.target.value)}
              placeholder="PROD-001"
              required
              fullWidth
            />
          </div>

          {/* Product Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("product_name")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.productName}
              onChange={(e) => handleChange("productName", e.target.value)}
              placeholder={t("enter_product_name")}
              required
              fullWidth
            />
          </div>

          {/* Barcode */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("barcode")}
            </label>
            <Input
              value={formData.barcode}
              onChange={(e) => handleChange("barcode", e.target.value)}
              placeholder="1234567890123"
              fullWidth
            />
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("category")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.category}
              onChange={(e) => handleChange("category", e.target.value)}
              options={categoryOptions}
              placeholder={t("select_category")}
              required
              fullWidth
            />
          </div>

          {/* Default Unit */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("default_unit")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.defaultUnit}
              onChange={(e) => handleChange("defaultUnit", e.target.value)}
              options={unitOptions}
              placeholder={t("select_unit")}
              required
              fullWidth
            />
          </div>

          {/* Stock Item */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("is_stock_item")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.isStockItem}
              onChange={(e) => handleChange("isStockItem", e.target.value)}
              options={stockItemOptions}
              required
              fullWidth
            />
          </div>

          {/* Company Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("company_name")}
            </label>
            <Input
              value={formData.companyName}
              onChange={(e) => handleChange("companyName", e.target.value)}
              placeholder={t("enter_company_name")}
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

          {/* Opening Stock */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("opening_stock")}
            </label>
            <Input
              type="number"
              value={formData.openingStock}
              onChange={(e) => handleChange("openingStock", Number(e.target.value))}
              placeholder="0"
              fullWidth
            />
          </div>

          {/* Reorder Level */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("reorder_level")}
            </label>
            <Input
              type="number"
              value={formData.reorderLevel}
              onChange={(e) => handleChange("reorderLevel", Number(e.target.value))}
              placeholder="0"
              fullWidth
            />
          </div>

          {/* Purchase Price */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("purchase_price")} (EGP) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.purchasePrice}
              onChange={(e) => handleChange("purchasePrice", Number(e.target.value))}
              placeholder="0.00"
              required
              fullWidth
            />
          </div>

          {/* Selling Price */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("selling_price")} (EGP) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.sellingPrice}
              onChange={(e) => handleChange("sellingPrice", Number(e.target.value))}
              placeholder="0.00"
              required
              fullWidth
            />
          </div>

          {/* Expired */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("expired")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.expired}
              onChange={(e) => handleChange("expired", e.target.value)}
              options={expiredOptions}
              required
              fullWidth
            />
          </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            {t("product_image")}
          </label>
          <FileUpload label={t("upload_image")} onChange={handleImageChange} accept="image/*" />
          {formData.image && (
            <div className="mt-2">
              <img
                src={formData.image}
                alt="Preview"
                className="w-24 h-24 rounded-lg object-cover border border-gray-200"
              />
            </div>
          )}
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            {t("description")}
          </label>
          <TextArea
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder={t("enter_description")}
            rows={3}
            fullWidth
          />
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
            {productToEdit ? t("save") : t("add_product")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};