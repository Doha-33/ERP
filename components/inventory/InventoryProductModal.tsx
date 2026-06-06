import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Package, DollarSign, Warehouse, Tag, Barcode, Upload, AlertCircle } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { Product, Category, Warehouse as WarehouseType } from "../../types";
import { useData } from "../../context/DataContext";
import { toast } from "sonner";

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
    purchasePrice: 0,
    sellingPrice: 0,
    description: "",
  });

  // Helper to extract ID from object or string
  const extractId = useCallback((value: any): string => {
    if (!value) return "";
    if (typeof value === "object") {
      return value._id || value.id || "";
    }
    return value;
  }, []);

  // Helper to extract category ID
  const extractCategoryId = useCallback((category: any): string => {
    if (!category) return "";
    if (typeof category === "object") {
      return category._id || category.id || "";
    }
    return category;
  }, []);

  useEffect(() => {
    if (productToEdit && isOpen) {
      // Extract category ID (could be string or object)
      const categoryId = extractCategoryId(productToEdit.category);
      
      // Extract warehouse ID (could be string or object)
      const warehouseId = extractId(productToEdit.warehouseId);

      setFormData({
        sku: productToEdit.sku || productToEdit.code || "",
        productName: productToEdit.productName || "",
        barcode: productToEdit.barcode || "",
        image: productToEdit.image || "",
        category: categoryId,
        defaultUnit: productToEdit.defaultUnit || "",
        isStockItem: productToEdit.isStockItem || "YES",
        companyName: productToEdit.companyName || "",
        openingStock: productToEdit.openingStock || 0,
        reorderLevel: productToEdit.reorderLevel || 0,
        warehouseId: warehouseId,
        purchasePrice: productToEdit.purchasePrice || 0,
        sellingPrice: productToEdit.sellingPrice || 0,
        description: productToEdit.description || "",
      });
    } else if (!productToEdit && isOpen) {
      // Generate random SKU for new product
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
        purchasePrice: 0,
        sellingPrice: 0,
        description: "",
      });
    }
  }, [productToEdit, isOpen, extractCategoryId, extractId]);

  // Prepare category options
  const categoryOptions = categories.map(cat => ({
    value: extractId(cat),
    label: cat.name,
  }));

  // Prepare unit options
  const unitOptions = units.map(u => ({
    value: u.name,
    label: `${u.name} (${u.abbreviation})`,
  }));

  // Prepare warehouse options
  const warehouseOptions = warehouses.map(w => ({
    value: extractId(w),
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
    
    // Validation
    if (!formData.productName.trim()) {
      toast.error(t("product_name_required"));
      return;
    }
    if (!formData.category) {
      toast.error(t("category_required"));
      return;
    }
    if (!formData.defaultUnit) {
      toast.error(t("unit_required"));
      return;
    }
    if (!formData.warehouseId) {
      toast.error(t("warehouse_required"));
      return;
    }
    if (formData.purchasePrice <= 0) {
      toast.error(t("purchase_price_required"));
      return;
    }
    if (formData.sellingPrice <= 0) {
      toast.error(t("selling_price_required"));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const saveData: Partial<Product> = {
        productName: formData.productName,
        sku: formData.sku,
        code: formData.sku, // API uses 'code' as well
        barcode: formData.barcode || undefined,
        category: formData.category,
        defaultUnit: formData.defaultUnit,
        isStockItem: formData.isStockItem,
        companyName: formData.companyName || undefined,
        openingStock: formData.openingStock,
        reorderLevel: formData.reorderLevel,
        warehouseId: formData.warehouseId,
        purchasePrice: formData.purchasePrice,
        sellingPrice: formData.sellingPrice,
        description: formData.description || undefined,
        currentStockQty: formData.openingStock, // Set initial stock
      };
      
      // Only include image if exists
      if (formData.image) {
        saveData.image = formData.image;
      }
      
      await onSave(saveData);
      onClose();
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error(t("failed_to_save_product"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error(t("image_too_large"));
        return;
      }
      
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
            <div className="relative">
              <Tag size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={formData.sku}
                onChange={(e) => handleChange("sku", e.target.value)}
                placeholder="PROD-001"
                required
                fullWidth
                className="pl-10"
              />
            </div>
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
            <div className="relative">
              <Barcode size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={formData.barcode}
                onChange={(e) => handleChange("barcode", e.target.value)}
                placeholder="1234567890123"
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
              <Warehouse size={14} className="inline mr-1" />
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
              <Package size={14} className="inline mr-1" />
              {t("opening_stock")}
            </label>
            <Input
              type="number"
              min="0"
              value={formData.openingStock}
              onChange={(e) => handleChange("openingStock", Number(e.target.value))}
              placeholder="0"
              fullWidth
            />
          </div>

          {/* Reorder Level */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              <AlertCircle size={14} className="inline mr-1" />
              {t("reorder_level")}
            </label>
            <Input
              type="number"
              min="0"
              value={formData.reorderLevel}
              onChange={(e) => handleChange("reorderLevel", Number(e.target.value))}
              placeholder="0"
              fullWidth
            />
            <p className="text-xs text-gray-500">{t("reorder_level_helper")}</p>
          </div>

          {/* Purchase Price */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              <DollarSign size={14} className="inline mr-1 text-orange-600" />
              {t("purchase_price")} (EGP) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
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
              <DollarSign size={14} className="inline mr-1 text-green-600" />
              {t("selling_price")} (EGP) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={formData.sellingPrice}
              onChange={(e) => handleChange("sellingPrice", Number(e.target.value))}
              placeholder="0.00"
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
          <div className="flex items-center gap-4">
            <label className="cursor-pointer">
              <div className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                {t("upload_image")}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
            {formData.image && (
              <button
                type="button"
                onClick={() => handleChange("image", "")}
                className="text-sm text-red-600 hover:text-red-700"
              >
                {t("remove")}
              </button>
            )}
          </div>
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