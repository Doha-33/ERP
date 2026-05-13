import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Trash2, Package, DollarSign, Calendar, Building2, Users, Hash, Warehouse, Truck, User, FileText } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { GoodsReceipt } from "../../types";
import { useData } from "../../context/DataContext";
import { toast } from "sonner";

interface GoodsReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<GoodsReceipt>) => Promise<void>;
  receiptToEdit?: GoodsReceipt | null;
  isLoading?: boolean;
}

interface ReceiptItem {
  productId: string;
  sku: string;
  orderedQuantity: number;
  receivedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  unitPrice: number;
  total: number;
}

export const GoodsReceiptModal: React.FC<GoodsReceiptModalProps> = ({
  isOpen,
  onClose,
  onSave,
  receiptToEdit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const { products, companies, branches, purchaseOrders, warehouses, currentUserEmployee, fetchPurchaseOrders } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    grnNumber: "",
    purchaseOrderId: "",
    supplierId: "",
    warehouseId: "",
    receiptDate: new Date().toISOString().split("T")[0],
    receivedBy: "",
    notes: "",
  });
  
  const [items, setItems] = useState<ReceiptItem[]>([
    { productId: "", sku: "", orderedQuantity: 1, receivedQuantity: 1, acceptedQuantity: 1, rejectedQuantity: 0, unitPrice: 0, total: 0 }
  ]);

  // Helper function to extract ID
  const extractId = useCallback((value: any): string => {
    if (!value) return "";
    if (typeof value === "object") {
      return value._id || value.id || "";
    }
    return value;
  }, []);

  // Filter purchase orders based on selected company and branch
  const filteredPurchaseOrders = useMemo(() => {
    // If no company/branch filters, return all
    return purchaseOrders;
  }, [purchaseOrders]);

  // Filter warehouses based on selected branch
  const filteredWarehouses = useMemo(() => {
    if (!formData.branchId) return warehouses;
    return warehouses.filter(warehouse => {
      const warehouseBranchId = extractId(warehouse.branchId);
      return warehouseBranchId === formData.branchId;
    });
  }, [warehouses, formData.branchId, extractId]);

  // Calculate total value
  const totalQty = items.reduce((sum, item) => sum + (item.acceptedQuantity || 0), 0);
  const totalValue = items.reduce((sum, item) => sum + (item.total || 0), 0);

  useEffect(() => {
    if (receiptToEdit && isOpen) {
      const poId = extractId(receiptToEdit.purchaseOrderId);
      const supplierId = extractId(receiptToEdit.supplierId);
      const warehouseId = extractId(receiptToEdit.warehouseId);
      const receivedBy = extractId(receiptToEdit.receivedBy);
      const branchId = extractId(receiptToEdit.branchId);

      setFormData({
        grnNumber: receiptToEdit.grnNumber || "",
        purchaseOrderId: poId || "",
        supplierId: supplierId || "",
        warehouseId: warehouseId || "",
        receiptDate: receiptToEdit.receiptDate 
          ? new Date(receiptToEdit.receiptDate).toISOString().split("T")[0] 
          : new Date().toISOString().split("T")[0],
        receivedBy: receivedBy || (currentUserEmployee?.username || ""),
        notes: receiptToEdit.notes || "",
      });
      
      if (receiptToEdit.items && receiptToEdit.items.length > 0) {
        setItems(receiptToEdit.items.map(item => ({
          productId: extractId(item.productId),
          sku: item.sku || "",
          orderedQuantity: item.orderedQuantity || 0,
          receivedQuantity: item.receivedQuantity || 0,
          acceptedQuantity: item.acceptedQuantity || item.receivedQuantity || 0,
          rejectedQuantity: item.rejectedQuantity || 0,
          unitPrice: item.unitPrice || 0,
          total: item.total || (item.acceptedQuantity * item.unitPrice) || 0
        })));
      }
    } else if (!receiptToEdit && isOpen) {
      const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const today = new Date().toISOString().split("T")[0];
      setFormData({
        grnNumber: `GRN-${today.replace(/-/g, '')}-${randomNum}`,
        purchaseOrderId: "",
        supplierId: "",
        warehouseId: "",
        receiptDate: today,
        receivedBy: currentUserEmployee?.username || "",
        notes: "",
      });
      setItems([{ productId: "", sku: "", orderedQuantity: 1, receivedQuantity: 1, acceptedQuantity: 1, rejectedQuantity: 0, unitPrice: 0, total: 0 }]);
    }
  }, [receiptToEdit, isOpen, currentUserEmployee, extractId]);

  // Update items when PO is selected
  const onPOChange = (poId: string) => {
    const selectedPO = purchaseOrders.find(po => extractId(po) === poId);
    if (selectedPO) {
      setFormData(prev => ({
        ...prev,
        supplierId: extractId(selectedPO.supplierId),
      }));
      
      if (selectedPO.items && selectedPO.items.length > 0) {
        setItems(selectedPO.items.map(item => ({
          productId: extractId(item.productId),
          sku: item.sku || "",
          orderedQuantity: item.quantity,
          receivedQuantity: item.quantity,
          acceptedQuantity: item.quantity,
          rejectedQuantity: 0,
          unitPrice: item.unitCost,
          total: item.quantity * item.unitCost
        })));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation
    if (!formData.grnNumber) {
      toast.error(t("grn_number_required"));
      return;
    }
    if (!formData.purchaseOrderId) {
      toast.error(t("purchase_order_required"));
      return;
    }
    if (!formData.warehouseId) {
      toast.error(t("warehouse_required"));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const saveData = {
        ...formData,
        items: items.map(item => ({
          productId: item.productId,
          sku: item.sku,
          orderedQuantity: item.orderedQuantity,
          receivedQuantity: item.receivedQuantity,
          acceptedQuantity: item.acceptedQuantity,
          rejectedQuantity: item.rejectedQuantity,
          unitPrice: item.unitPrice,
          total: item.total
        })),
        totalQty,
        totalValue,
      };
      
      console.log("Saving goods receipt:", saveData);
      await onSave(saveData);
      onClose();
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error(t("failed_to_save_goods_receipt"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index: number, field: keyof ReceiptItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // If product is selected, auto-fill SKU
    if (field === "productId" && value) {
      const selectedProduct = products.find(p => extractId(p) === value);
      if (selectedProduct) {
        newItems[index].sku = selectedProduct.sku;
      }
    }
    
    // Calculate rejected quantity
    if (field === "acceptedQuantity" && newItems[index].receivedQuantity) {
      newItems[index].rejectedQuantity = newItems[index].receivedQuantity - value;
    }
    if (field === "receivedQuantity") {
      newItems[index].acceptedQuantity = value;
      newItems[index].rejectedQuantity = 0;
    }
    
    // Recalculate total
    newItems[index].total = newItems[index].acceptedQuantity * newItems[index].unitPrice;
    
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { productId: "", sku: "", orderedQuantity: 1, receivedQuantity: 1, acceptedQuantity: 1, rejectedQuantity: 0, unitPrice: 0, total: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const poOptions = [
    { value: "", label: t("select_po") },
    ...filteredPurchaseOrders.map(po => ({ 
      value: extractId(po), 
      label: po.referenceNo 
    }))
  ];

  const warehouseOptions = filteredWarehouses.map(w => ({ 
    value: extractId(w), 
    label: w.warehouseName 
  }));

  const productOptions = products.map(p => ({ 
    value: extractId(p), 
    label: `${p.productName} (${p.sku})` 
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {receiptToEdit ? <Edit2 size={20} /> : <Plus size={20} />}
          {receiptToEdit ? t("edit_goods_receipt") : t("add_goods_receipt")}
        </div>
      }
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto px-2">
        {/* Receipt Information */}
        <div className="border-b border-gray-100 pb-4">
          <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText size={18} className="text-indigo-600" />
            {t("receipt_information")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("grn_number")} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FileText size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  value={formData.grnNumber}
                  onChange={(e) => handleChange("grnNumber", e.target.value)}
                  placeholder="GRN-001"
                  required
                  fullWidth
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("receipt_date")} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="date"
                  value={formData.receiptDate}
                  onChange={(e) => handleChange("receiptDate", e.target.value)}
                  required
                  fullWidth
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("purchase_order")} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Package size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Select
                  value={formData.purchaseOrderId}
                  onChange={(e) => {
                    handleChange("purchaseOrderId", e.target.value);
                    onPOChange(e.target.value);
                  }}
                  options={poOptions}
                  placeholder={t("select_po")}
                  required
                  fullWidth
                  className="pl-10"
                />
              </div>
            </div>

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

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("received_by")} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  value={formData.receivedBy}
                  onChange={(e) => handleChange("receivedBy", e.target.value)}
                  placeholder={t("enter_received_by")}
                  required
                  fullWidth
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Receipt Items */}
        <div className="border-b border-gray-100 pb-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-semibold text-gray-900 flex items-center gap-2">
              <Package size={18} className="text-indigo-600" />
              {t("receipt_items")}
            </h3>
            <Button type="button" variant="secondary" onClick={addItem} size="sm">
              <Plus size={16} />
              {t("add_item")}
            </Button>
          </div>
          
          <div className="space-y-3">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-3 px-2 py-2 bg-gray-50 rounded-lg text-xs font-medium text-gray-500">
              <div className="col-span-2">{t("product")}</div>
              <div className="col-span-1">{t("sku")}</div>
              <div className="col-span-1">{t("ordered")}</div>
              <div className="col-span-1">{t("received")}</div>
              <div className="col-span-1">{t("accepted")}</div>
              <div className="col-span-1">{t("rejected")}</div>
              <div className="col-span-2">{t("unit_price")}</div>
              <div className="col-span-2">{t("total")}</div>
              <div className="col-span-1"></div>
            </div>
            
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end p-3 bg-gray-50 rounded-lg">
                <div className="md:col-span-2">
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
                <div className="md:col-span-1">
                  <Input
                    label={index === 0 ? t("sku") : ""}
                    value={item.sku}
                    onChange={(e) => handleItemChange(index, "sku", e.target.value)}
                    readOnly
                    fullWidth
                  />
                </div>
                <div className="md:col-span-1">
                  <Input
                    label={index === 0 ? t("ordered_qty") : ""}
                    type="number"
                    value={item.orderedQuantity}
                    readOnly
                    className="bg-gray-100"
                    fullWidth
                  />
                </div>
                <div className="md:col-span-1">
                  <Input
                    label={index === 0 ? t("received_qty") : ""}
                    type="number"
                    value={item.receivedQuantity}
                    onChange={(e) => handleItemChange(index, "receivedQuantity", Number(e.target.value))}
                    min="0"
                    required
                    fullWidth
                  />
                </div>
                <div className="md:col-span-1">
                  <Input
                    label={index === 0 ? t("accepted_qty") : ""}
                    type="number"
                    value={item.acceptedQuantity}
                    onChange={(e) => handleItemChange(index, "acceptedQuantity", Number(e.target.value))}
                    min="0"
                    required
                    fullWidth
                  />
                </div>
                <div className="md:col-span-1">
                  <Input
                    label={index === 0 ? t("rejected_qty") : ""}
                    type="number"
                    value={item.rejectedQuantity}
                    readOnly
                    className="bg-gray-100 text-red-600"
                    fullWidth
                  />
                </div>
                <div className="md:col-span-2">
                  <Input
                    label={index === 0 ? t("unit_price") : ""}
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(index, "unitPrice", Number(e.target.value))}
                    min="0"
                    required
                    fullWidth
                  />
                </div>
                <div className="md:col-span-2">
                  <div className="text-sm font-semibold text-indigo-600 mt-2 pt-2">
                    {item.total.toLocaleString()} EGP
                  </div>
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
        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{t("total_quantity")}</span>
            <span className="text-sm font-medium">{totalQty.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <span className="text-base font-bold text-gray-900">{t("total_value")}</span>
            <span className="text-lg font-bold text-indigo-600">{totalValue.toLocaleString()} EGP</span>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1">
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

        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting || isLoading} type="button">
            {t("cancel")}
          </Button>
          <Button
            variant="primary"
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 px-8"
            isLoading={isSubmitting || isLoading}
            disabled={isSubmitting || isLoading}
          >
            {receiptToEdit ? t("save") : t("add_goods_receipt")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};