import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Package, Building2, Warehouse, Hash, FileText, X, Trash2 } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { ReturnToSupplier } from "../../types";
import { useData } from "../../context/DataContext";

interface ReturnToSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<ReturnToSupplier>) => Promise<void>;
  returnToEdit?: ReturnToSupplier | null;
  isLoading?: boolean;
}

interface ReturnItem {
  productId: string;
  sku: string;
  receivedQuantity: number;
  returnQuantity: number;
  reasonForReturn: string;
}

export const ReturnToSupplierModal: React.FC<ReturnToSupplierModalProps> = ({
  isOpen,
  onClose,
  onSave,
  returnToEdit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const { suppliers, products, warehouses, goodsReceipts, branches } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    returnNumber: "",
    supplierId: "",
    goodsReceiptId: "",
    warehouseId: "",
    branchId: "",
    status: "PENDING",
    notes: "",
  });
  
  const [items, setItems] = useState<ReturnItem[]>([
    { productId: "", sku: "", receivedQuantity: 0, returnQuantity: 0, reasonForReturn: "" }
  ]);

  useEffect(() => {
    if (returnToEdit && isOpen) {
      const supplierId = typeof returnToEdit.supplierId === "object"
        ? (returnToEdit.supplierId as any)?._id
        : returnToEdit.supplierId;
      const goodsReceiptId = typeof returnToEdit.goodsReceiptId === "object"
        ? (returnToEdit.goodsReceiptId as any)?._id
        : returnToEdit.goodsReceiptId;
      const warehouseId = typeof returnToEdit.warehouseId === "object"
        ? (returnToEdit.warehouseId as any)?._id
        : returnToEdit.warehouseId;
      const branchId = typeof returnToEdit.branchId === "object"
        ? (returnToEdit.branchId as any)?._id
        : returnToEdit.branchId;

      setFormData({
        returnNumber: returnToEdit.returnNumber || `RET-${Date.now()}`,
        supplierId: supplierId || "",
        goodsReceiptId: goodsReceiptId || "",
        warehouseId: warehouseId || "",
        branchId: branchId || "",
        status: returnToEdit.status || "PENDING",
        notes: returnToEdit.notes || "",
      });
      
      if (returnToEdit.items && returnToEdit.items.length > 0) {
        setItems(returnToEdit.items.map(item => ({
          productId: typeof item.productId === "object" ? (item.productId as any)?._id || "" : item.productId || "",
          sku: item.sku || "",
          receivedQuantity: item.receivedQuantity || 0,
          returnQuantity: item.returnQuantity || 0,
          reasonForReturn: item.reasonForReturn || "",
        })));
      }
    } else if (!returnToEdit && isOpen) {
      const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      setFormData({
        returnNumber: `RET-${randomNum}`,
        supplierId: "",
        goodsReceiptId: "",
        warehouseId: "",
        branchId: "",
        status: "PENDING",
        notes: "",
      });
      setItems([{ productId: "", sku: "", receivedQuantity: 0, returnQuantity: 0, reasonForReturn: "" }]);
    }
  }, [returnToEdit, isOpen]);

  // Load GR items when goods receipt is selected
  const handleGoodsReceiptChange = (grId: string) => {
    const selectedGR = goodsReceipts.find(gr => (gr._id || gr.id) === grId);
    if (selectedGR && selectedGR.items) {
      setItems(selectedGR.items.map(item => ({
        productId: typeof item.productId === "object" ? (item.productId as any)?._id || "" : item.productId || "",
        sku: item.sku || "",
        receivedQuantity: item.acceptedQuantity || item.receivedQuantity || 0,
        returnQuantity: 0,
        reasonForReturn: "",
      })));
    }
  };

  const statusOptions = [
    { value: "PENDING", label: t("pending") },
    { value: "APPROVED", label: t("approved") },
    { value: "REJECTED", label: t("rejected") },
  ];

  const supplierOptions = suppliers.map(s => ({
    value: s._id || s.id,
    label: s.supplierName,
  }));

  const goodsReceiptOptions = goodsReceipts.map(gr => ({
    value: gr._id || gr.id,
    label: gr.grnNumber,
  }));

  const warehouseOptions = warehouses.map(w => ({
    value: w._id || w.id,
    label: w.warehouseName,
  }));

  const branchOptions = branches.map(b => ({
    value: b._id || b.id,
    label: b.name,
  }));

  const productOptions = products.map(p => ({
    value: p._id || p.id,
    label: `${p.productName} (${p.sku})`,
  }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSave({
        ...formData,
        items: items.filter(item => item.returnQuantity > 0),
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

  const handleItemChange = (index: number, field: keyof ReturnItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // If max return quantity validation
    if (field === "returnQuantity") {
      const maxReturn = newItems[index].receivedQuantity;
      if (value > maxReturn) {
        newItems[index].returnQuantity = maxReturn;
      }
    }
    
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { productId: "", sku: "", receivedQuantity: 0, returnQuantity: 0, reasonForReturn: "" }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const totalReturnQuantity = items.reduce((sum, item) => sum + (item.returnQuantity || 0), 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {returnToEdit ? <Edit2 size={20} /> : <Plus size={20} />}
          {returnToEdit ? t("edit_return_to_supplier") : t("add_return_to_supplier")}
        </div>
      }
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto px-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Return Number */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("return_number")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.returnNumber}
              onChange={(e) => handleChange("returnNumber", e.target.value)}
              placeholder="RET-001"
              required
              fullWidth
            />
          </div>

          {/* Supplier */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("supplier")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.supplierId}
              onChange={(e) => handleChange("supplierId", e.target.value)}
              options={supplierOptions}
              placeholder={t("select_supplier")}
              required
              fullWidth
            />
          </div>

          {/* Goods Receipt */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("goods_receipt")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.goodsReceiptId}
              onChange={(e) => {
                handleChange("goodsReceiptId", e.target.value);
                handleGoodsReceiptChange(e.target.value);
              }}
              options={goodsReceiptOptions}
              placeholder={t("select_goods_receipt")}
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

          {/* Branch */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("branch")}
            </label>
            <Select
              value={formData.branchId}
              onChange={(e) => handleChange("branchId", e.target.value)}
              options={branchOptions}
              placeholder={t("select_branch")}
              fullWidth
            />
          </div>

          {/* Status (only for edit) */}
          {returnToEdit && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("status")} <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
                options={statusOptions}
                required
              />
            </div>
          )}
        </div>

        {/* Return Items */}
        <div className="border-t border-gray-100 pt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-semibold text-gray-900 flex items-center gap-2">
              <Package size={18} className="text-indigo-600" />
              {t("return_items")}
            </h3>
            <Button type="button" variant="secondary" onClick={addItem} size="sm">
              <Plus size={16} />
              {t("add_item")}
            </Button>
          </div>
          
          <div className="space-y-3">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-3 px-2 py-2 bg-gray-50 rounded-lg text-xs font-medium text-gray-500">
              <div className="col-span-3">{t("product")}</div>
              <div className="col-span-2">{t("received_qty")}</div>
              <div className="col-span-2">{t("return_qty")}</div>
              <div className="col-span-4">{t("reason")}</div>
              <div className="col-span-1"></div>
            </div>
            
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end p-3 bg-gray-50 rounded-lg">
                <div className="md:col-span-3">
                  <Select
                    label={index === 0 ? t("product") : ""}
                    value={item.productId}
                    onChange={(e) => handleItemChange(index, "productId", e.target.value)}
                    options={productOptions}
                    placeholder={t("select_product")}
                    required
                    fullWidth
                  />
                </div>
                <div className="md:col-span-2">
                  <Input
                    label={index === 0 ? t("received_qty") : ""}
                    type="number"
                    value={item.receivedQuantity}
                    readOnly
                    className="bg-gray-100"
                    fullWidth
                  />
                </div>
                <div className="md:col-span-2">
                  <Input
                    label={index === 0 ? t("return_qty") : ""}
                    type="number"
                    value={item.returnQuantity}
                    onChange={(e) => handleItemChange(index, "returnQuantity", Number(e.target.value))}
                    min="0"
                    max={item.receivedQuantity}
                    required
                    fullWidth
                  />
                  {item.returnQuantity > item.receivedQuantity && (
                    <p className="text-xs text-red-500 mt-1">
                      {t("max_return_qty")}: {item.receivedQuantity}
                    </p>
                  )}
                </div>
                <div className="md:col-span-4">
                  <Input
                    label={index === 0 ? t("reason") : ""}
                    value={item.reasonForReturn}
                    onChange={(e) => handleItemChange(index, "reasonForReturn", e.target.value)}
                    placeholder={t("enter_reason")}
                    required
                    fullWidth
                  />
                </div>
                <div className="md:col-span-1 flex justify-end">
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex justify-between items-center">
            <span className="text-base font-semibold text-gray-900">{t("total_return_quantity")}</span>
            <span className="text-xl font-bold text-indigo-600">{totalReturnQuantity.toLocaleString()}</span>
          </div>
        </div>

        {/* Notes */}
        <TextArea
          label={t("notes")}
          value={formData.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          placeholder={t("enter_notes")}
          rows={3}
          fullWidth
        />

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
            {returnToEdit ? t("save") : t("add_return")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};