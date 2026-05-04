import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Trash2, Package, DollarSign, Calendar, Building2, Users, Hash, Warehouse, Truck, User } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { GoodsReceipt } from "../../types";
import { useData } from "../../context/DataContext";

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
  const { products, companies, branches, purchaseOrders, warehouses, currentUserEmployee } = useData();
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

  // Calculate total value
  const totalQty = items.reduce((sum, item) => sum + (item.acceptedQuantity || 0), 0);
  const totalValue = items.reduce((sum, item) => sum + (item.total || 0), 0);

  useEffect(() => {
    if (receiptToEdit && isOpen) {
      const poId = typeof receiptToEdit.purchaseOrderId === "object" 
        ? (receiptToEdit.purchaseOrderId as any)?._id 
        : receiptToEdit.purchaseOrderId;
      const supplierId = typeof receiptToEdit.supplierId === "object" 
        ? (receiptToEdit.supplierId as any)?._id 
        : receiptToEdit.supplierId;
      const warehouseId = typeof receiptToEdit.warehouseId === "object" 
        ? (receiptToEdit.warehouseId as any)?._id 
        : receiptToEdit.warehouseId;

      setFormData({
        grnNumber: receiptToEdit.grnNumber || "",
        purchaseOrderId: poId || "",
        supplierId: supplierId || "",
        warehouseId: warehouseId || "",
        receiptDate: receiptToEdit.receiptDate 
          ? new Date(receiptToEdit.receiptDate).toISOString().split("T")[0] 
          : new Date().toISOString().split("T")[0],
        receivedBy: typeof receiptToEdit.receivedBy === "object" 
          ? (receiptToEdit.receivedBy as any)?.username || (receiptToEdit.receivedBy as any)?.fullName || ""
          : receiptToEdit.receivedBy || "",
        notes: receiptToEdit.notes || "",
      });
      
      if (receiptToEdit.items && receiptToEdit.items.length > 0) {
        setItems(receiptToEdit.items.map(item => ({
          productId: typeof item.productId === "object" ? (item.productId as any)?._id || "" : item.productId || "",
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
  }, [receiptToEdit, isOpen, currentUserEmployee]);

  // Update items when PO is selected
  const onPOChange = (poId: string) => {
    const selectedPO = purchaseOrders.find(po => (po._id || po.id) === poId);
    if (selectedPO) {
      setFormData(prev => ({
        ...prev,
        supplierId: typeof selectedPO.supplierId === "object" 
          ? (selectedPO.supplierId as any)?._id 
          : selectedPO.supplierId || "",
      }));
      
      if (selectedPO.items && selectedPO.items.length > 0) {
        setItems(selectedPO.items.map(item => ({
          productId: typeof item.productId === "object" ? (item.productId as any)?._id || "" : item.productId || "",
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
    setIsSubmitting(true);
    
    try {
      await onSave({
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

  const handleItemChange = (index: number, field: keyof ReceiptItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // If product is selected, auto-fill SKU
    if (field === "productId" && value) {
      const selectedProduct = products.find(p => (p._id || p.id) === value);
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
    ...purchaseOrders.map(po => ({ 
      value: po._id || po.id, 
      label: po.referenceNo 
    }))
  ];

  const warehouseOptions = warehouses.map(w => ({ 
    value: w._id || w.id, 
    label: w.warehouseName 
  }));

  const productOptions = products.map(p => ({ 
    value: p._id || p.id, 
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
            <Input
              label={t("grn_number")}
              value={formData.grnNumber}
              onChange={(e) => handleChange("grnNumber", e.target.value)}
              placeholder="GRN-001"
              required
              fullWidth
            />
            <Input
              label={t("receipt_date")}
              type="date"
              value={formData.receiptDate}
              onChange={(e) => handleChange("receiptDate", e.target.value)}
              required
              fullWidth
            />
            <Select
              label={t("purchase_order")}
              value={formData.purchaseOrderId}
              onChange={(e) => {
                handleChange("purchaseOrderId", e.target.value);
                onPOChange(e.target.value);
              }}
              options={poOptions}
              placeholder={t("select_po")}
              required
              fullWidth
            />
            <Select
              label={t("warehouse")}
              value={formData.warehouseId}
              onChange={(e) => handleChange("warehouseId", e.target.value)}
              options={warehouseOptions}
              placeholder={t("select_warehouse")}
              required
              fullWidth
            />
            <Input
              label={t("received_by")}
              value={formData.receivedBy}
              onChange={(e) => handleChange("receivedBy", e.target.value)}
              placeholder={t("enter_received_by")}
              required
              fullWidth
            />
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
            {receiptToEdit ? t("save") : t("add_goods_receipt")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Add this import at the top
import { FileText } from "lucide-react";