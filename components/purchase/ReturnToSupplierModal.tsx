import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Package, Building2, Warehouse, Hash, FileText, X, Trash2 } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { ReturnToSupplier } from "../../types";
import { useData } from "../../context/DataContext";
import { toast } from "sonner";

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
  const { suppliers, products, warehouses, goodsReceipts, branches, companies } = useData();
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

  // Helper function to extract ID
  const extractId = useCallback((value: any): string => {
    if (!value) return "";
    if (typeof value === "object") {
      return value._id || value.id || "";
    }
    return value;
  }, []);

  // Filter warehouses based on selected branch
  const filteredWarehouses = useMemo(() => {
    if (!formData.branchId) return warehouses;
    return warehouses.filter(warehouse => {
      const warehouseBranchId = extractId(warehouse.branchId);
      return warehouseBranchId === formData.branchId;
    });
  }, [warehouses, formData.branchId, extractId]);

  // Filter goods receipts based on selected supplier
  const filteredGoodsReceipts = useMemo(() => {
    if (!formData.supplierId) return goodsReceipts;
    return goodsReceipts.filter(gr => {
      const grSupplierId = extractId(gr.supplierId);
      return grSupplierId === formData.supplierId;
    });
  }, [goodsReceipts, formData.supplierId, extractId]);

  useEffect(() => {
    if (returnToEdit && isOpen) {
      const supplierId = extractId(returnToEdit.supplierId);
      const goodsReceiptId = extractId(returnToEdit.goodsReceiptId);
      const warehouseId = extractId(returnToEdit.warehouseId);
      const branchId = extractId(returnToEdit.branchId);

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
          productId: extractId(item.productId),
          sku: item.sku || "",
          receivedQuantity: item.receivedQuantity || 0,
          returnQuantity: item.returnQuantity || 0,
          reasonForReturn: item.reasonForReturn || "",
        })));
      }
    } else if (!returnToEdit && isOpen) {
      const randomNum = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
      setFormData({
        returnNumber: `PRT-${randomNum}`,
        supplierId: "",
        goodsReceiptId: "",
        warehouseId: "",
        branchId: "",
        status: "PENDING",
        notes: "",
      });
      setItems([{ productId: "", sku: "", receivedQuantity: 0, returnQuantity: 0, reasonForReturn: "" }]);
    }
  }, [returnToEdit, isOpen, extractId]);

  // Load GR items when goods receipt is selected
  const handleGoodsReceiptChange = (grId: string) => {
    const selectedGR = goodsReceipts.find(gr => extractId(gr) === grId);
    if (selectedGR && selectedGR.items) {
      setItems(selectedGR.items.map((item: any) => ({
        productId: extractId(item.productId),
        sku: item.sku || "",
        receivedQuantity: item.acceptedQuantity || item.receivedQuantity || 0,
        returnQuantity: 0,
        reasonForReturn: "",
      })));
      
      // Auto-fill warehouse and branch from GR
      if (selectedGR.warehouseId) {
        setFormData(prev => ({
          ...prev,
          warehouseId: extractId(selectedGR.warehouseId),
        }));
      }
      if (selectedGR.branchId) {
        setFormData(prev => ({
          ...prev,
          branchId: extractId(selectedGR.branchId),
        }));
      }
    }
  };

  const statusOptions = [
    { value: "PENDING", label: t("pending") },
    { value: "APPROVED", label: t("approved") },
    { value: "REJECTED", label: t("rejected") },
  ];

  const supplierOptions = suppliers.map(s => ({
    value: extractId(s),
    label: s.supplierName,
  }));

  const goodsReceiptOptions = filteredGoodsReceipts.map(gr => ({
    value: extractId(gr),
    label: gr.grnNumber,
  }));

  const warehouseOptions = filteredWarehouses.map(w => ({
    value: extractId(w),
    label: w.warehouseName,
  }));

  const branchOptions = branches.map(b => ({
    value: extractId(b),
    label: b.name,
  }));

  const productOptions = products.map(p => ({
    value: extractId(p),
    label: `${p.productName} (${p.sku})`,
  }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation
    if (!formData.returnNumber) {
      toast.error(t("return_number_required"));
      return;
    }
    if (!formData.supplierId) {
      toast.error(t("supplier_required"));
      return;
    }
    if (!formData.goodsReceiptId) {
      toast.error(t("goods_receipt_required"));
      return;
    }
    if (!formData.warehouseId) {
      toast.error(t("warehouse_required"));
      return;
    }
    
    // Filter items with return quantity > 0
    const itemsToReturn = items.filter(item => item.returnQuantity > 0);
    if (itemsToReturn.length === 0) {
      toast.error(t("at_least_one_item_required"));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const saveData = {
        ...formData,
        items: itemsToReturn.map(item => ({
          productId: item.productId,
          sku: item.sku,
          receivedQuantity: item.receivedQuantity,
          returnQuantity: item.returnQuantity,
          reasonForReturn: item.reasonForReturn,
        })),
        returnDate: new Date().toISOString(),
      };
      
      console.log("Saving return to supplier:", saveData);
      await onSave(saveData);
      onClose();
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error(t("failed_to_save_return"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Reset goods receipt when supplier changes
    if (field === "supplierId") {
      setFormData(prev => ({ ...prev, goodsReceiptId: "" }));
      setItems([{ productId: "", sku: "", receivedQuantity: 0, returnQuantity: 0, reasonForReturn: "" }]);
    }
  };

  const handleItemChange = (index: number, field: keyof ReturnItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // If max return quantity validation
    if (field === "returnQuantity") {
      const maxReturn = newItems[index].receivedQuantity;
      if (value > maxReturn) {
        newItems[index].returnQuantity = maxReturn;
        toast.warning(t("max_return_qty_warning", { max: maxReturn }));
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
            <div className="relative">
              <FileText size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={formData.returnNumber}
                onChange={(e) => handleChange("returnNumber", e.target.value)}
                placeholder="PRT-001"
                required
                fullWidth
                className="pl-10"
                disabled={!!returnToEdit}
              />
            </div>
          </div>

          {/* Supplier */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("supplier")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building2 size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Select
                value={formData.supplierId}
                onChange={(e) => handleChange("supplierId", e.target.value)}
                options={supplierOptions}
                placeholder={t("select_supplier")}
                required
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Goods Receipt */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("goods_receipt")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FileText size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Select
                value={formData.goodsReceiptId}
                onChange={(e) => {
                  handleChange("goodsReceiptId", e.target.value);
                  handleGoodsReceiptChange(e.target.value);
                }}
                options={goodsReceiptOptions}
                placeholder={formData.supplierId ? t("select_goods_receipt") : t("select_supplier_first")}
                required
                fullWidth
                className="pl-10"
                disabled={!formData.supplierId}
              />
            </div>
            {formData.supplierId && goodsReceiptOptions.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">{t("no_goods_receipts_for_supplier")}</p>
            )}
          </div>

          {/* Warehouse */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("warehouse")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Warehouse size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Select
                value={formData.warehouseId}
                onChange={(e) => handleChange("warehouseId", e.target.value)}
                options={warehouseOptions}
                placeholder={t("select_warehouse")}
                required
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Branch */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("branch")}
            </label>
            <div className="relative">
              <Building2 size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Select
                value={formData.branchId}
                onChange={(e) => handleChange("branchId", e.target.value)}
                options={branchOptions}
                placeholder={t("select_branch")}
                fullWidth
                className="pl-10"
              />
            </div>
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
                fullWidth
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
                    disabled={!!formData.goodsReceiptId}
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