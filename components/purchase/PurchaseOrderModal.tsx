import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Trash2, Package, DollarSign, Calendar, Building2, Users, Hash, Truck, CreditCard, FileText } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { PurchaseOrder } from "../../types";
import { useData } from "../../context/DataContext";
import { toast } from "sonner";

interface PurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<PurchaseOrder>) => Promise<void>;
  orderToEdit?: PurchaseOrder | null;
  isLoading?: boolean;
}

interface OrderItem {
  productId: string;
  sku: string;
  quantity: number;
  unitCost: number;
  tax: number;
  receivedQuantity: number;
  pendingQuantity: number;
}

export const PurchaseOrderModal: React.FC<PurchaseOrderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  orderToEdit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const { suppliers, products, companies, branches, purchaseRequests } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    referenceNo: "",
    supplierId: "",
    linkedPurchaseRequestId: "",
    orderDate: new Date().toISOString().split("T")[0],
    companyId: "",
    branchId: "",
    paymentStatus: "UNPAID",
    deliveryStatus: "PENDING",
    notes: "",
  });
  
  const [items, setItems] = useState<OrderItem[]>([
    { productId: "", sku: "", quantity: 1, unitCost: 0, tax: 0, receivedQuantity: 0, pendingQuantity: 1 }
  ]);

  // Helper function to extract ID
  const extractId = useCallback((value: any): string => {
    if (!value) return "";
    if (typeof value === "object") {
      return value._id || value.id || "";
    }
    return value;
  }, []);

  // Filter branches based on selected company
  const filteredBranches = useMemo(() => {
    if (!formData.companyId) return [];
    return branches.filter(branch => {
      const branchCompanyId = extractId(branch.companyId);
      return branchCompanyId === formData.companyId;
    });
  }, [branches, formData.companyId, extractId]);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
  const taxAmount = items.reduce((sum, item) => sum + (item.tax || 0), 0);
  const totalAmount = subtotal + taxAmount;

  useEffect(() => {
    if (orderToEdit && isOpen) {
      const supplierId = extractId(orderToEdit.supplierId);
      const linkedPRId = extractId(orderToEdit.linkedPurchaseRequestId);
      const companyId = extractId(orderToEdit.companyId);
      const branchId = extractId(orderToEdit.branchId);

      setFormData({
        referenceNo: orderToEdit.referenceNo || "",
        supplierId: supplierId || "",
        linkedPurchaseRequestId: linkedPRId || "",
        orderDate: orderToEdit.orderDate 
          ? new Date(orderToEdit.orderDate).toISOString().split("T")[0] 
          : new Date().toISOString().split("T")[0],
        companyId: companyId || "",
        branchId: branchId || "",
        paymentStatus: orderToEdit.paymentStatus || "UNPAID",
        deliveryStatus: orderToEdit.deliveryStatus || "PENDING",
        notes: orderToEdit.notes || "",
      });
      
      if (orderToEdit.items && orderToEdit.items.length > 0) {
        setItems(orderToEdit.items.map(item => ({
          productId: extractId(item.productId),
          sku: item.sku || "",
          quantity: item.quantity,
          unitCost: item.unitCost,
          tax: item.tax || 0,
          receivedQuantity: item.receivedQuantity || 0,
          pendingQuantity: item.pendingQuantity || item.quantity
        })));
      }
    } else if (!orderToEdit && isOpen) {
      const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      setFormData({
        referenceNo: `PO-${randomNum}`,
        supplierId: "",
        linkedPurchaseRequestId: "",
        orderDate: new Date().toISOString().split("T")[0],
        companyId: "",
        branchId: "",
        paymentStatus: "UNPAID",
        deliveryStatus: "PENDING",
        notes: "",
      });
      setItems([{ productId: "", sku: "", quantity: 1, unitCost: 0, tax: 0, receivedQuantity: 0, pendingQuantity: 1 }]);
    }
  }, [orderToEdit, isOpen, extractId]);

  const supplierOptions = suppliers.map(s => ({ 
    value: extractId(s), 
    label: s.supplierName 
  }));

  const companyOptions = companies.map(c => ({ 
    value: extractId(c), 
    label: c.name 
  }));

  const branchOptions = filteredBranches.map(b => ({ 
    value: extractId(b), 
    label: b.name 
  }));

  const productOptions = products.map(p => ({ 
    value: extractId(p), 
    label: `${p.productName} (${p.sku})` 
  }));

  const purchaseRequestOptions = [
    { value: "", label: t("none") },
    ...purchaseRequests.map(pr => ({ 
      value: extractId(pr), 
      label: pr.prNumber 
    }))
  ];

  const paymentStatusOptions = [
    { value: "UNPAID", label: t("unpaid") },
    { value: "PARTIAL", label: t("partial") },
    { value: "PAID", label: t("paid") },
  ];

  const deliveryStatusOptions = [
    { value: "PENDING", label: t("pending") },
    { value: "PROCESSING", label: t("processing") },
    { value: "DELIVERED", label: t("delivered") },
    { value: "CANCELLED", label: t("cancelled") },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation
    if (!formData.referenceNo) {
      toast.error(t("order_number_required"));
      return;
    }
    if (!formData.supplierId) {
      toast.error(t("supplier_required"));
      return;
    }
    if (!formData.companyId) {
      toast.error(t("company_required"));
      return;
    }
    if (!formData.branchId) {
      toast.error(t("branch_required"));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSave({
        ...formData,
        items: items.map(item => ({
          productId: item.productId,
          sku: item.sku,
          quantity: item.quantity,
          unitCost: item.unitCost,
          tax: item.tax,
          receivedQuantity: item.receivedQuantity,
          pendingQuantity: item.quantity - item.receivedQuantity
        })),
        subtotal,
        taxAmount,
        totalAmount,
      });
      onClose();
    } catch (error) {
      console.error("Error in form submission:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    // Reset branch when company changes
    if (field === "companyId") {
      setFormData(prev => ({ 
        ...prev, 
        companyId: value,
        branchId: "" // Reset branch selection
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // If product is selected, auto-fill SKU and unit cost
    if (field === "productId" && value) {
      const selectedProduct = products.find(p => extractId(p) === value);
      if (selectedProduct) {
        newItems[index].sku = selectedProduct.sku;
        newItems[index].unitCost = selectedProduct.cost;
      }
    }
    
    // Update pending quantity
    if (field === "quantity") {
      newItems[index].pendingQuantity = value - newItems[index].receivedQuantity;
    }
    
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { productId: "", sku: "", quantity: 1, unitCost: 0, tax: 0, receivedQuantity: 0, pendingQuantity: 1 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {orderToEdit ? <Edit2 size={20} /> : <Plus size={20} />}
          {orderToEdit ? t("edit_purchase_order") : t("add_purchase_order")}
        </div>
      }
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto px-2">
        {/* Order Information */}
        <div className="border-b border-gray-100 pb-4">
          <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText size={18} className="text-indigo-600" />
            {t("order_information")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
            <Input
              label={t("order_number")}
              value={formData.referenceNo}
              onChange={(e) => handleChange("referenceNo", e.target.value)}
              placeholder="PO-001"
              required
              fullWidth
            />
            <Input
              label={t("order_date")}
              type="date"
              value={formData.orderDate}
              onChange={(e) => handleChange("orderDate", e.target.value)}
              required
              fullWidth
            />
            <Select
              label={t("supplier")}
              value={formData.supplierId}
              onChange={(e) => handleChange("supplierId", e.target.value)}
              options={supplierOptions}
              placeholder={t("select_supplier")}
              required
              fullWidth
            />
            <Select
              label={t("company")}
              value={formData.companyId}
              onChange={(e) => handleChange("companyId", e.target.value)}
              options={companyOptions}
              placeholder={t("select_company")}
              required
              fullWidth
            />
            <Select
              label={t("branch")}
              value={formData.branchId}
              onChange={(e) => handleChange("branchId", e.target.value)}
              options={branchOptions}
              placeholder={formData.companyId ? t("select_branch") : t("select_company_first")}
              required
              fullWidth
              disabled={!formData.companyId}
            />
            <Select
              label={t("linked_purchase_request")}
              value={formData.linkedPurchaseRequestId}
              onChange={(e) => handleChange("linkedPurchaseRequestId", e.target.value)}
              options={purchaseRequestOptions}
              placeholder={t("select_pr")}
              fullWidth
            />
          </div>
        </div>

        {/* Order Items */}
        <div className="border-b border-gray-100 pb-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-semibold text-gray-900 flex items-center gap-2">
              <Package size={18} className="text-indigo-600" />
              {t("order_items")}
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
              <div className="col-span-2">{t("sku")}</div>
              <div className="col-span-1">{t("quantity")}</div>
              <div className="col-span-2">{t("unit_cost")}</div>
              <div className="col-span-1">{t("tax")}</div>
              <div className="col-span-2">{t("subtotal")}</div>
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
                    label={index === 0 ? t("sku") : ""}
                    value={item.sku}
                    onChange={(e) => handleItemChange(index, "sku", e.target.value)}
                    readOnly
                    fullWidth
                  />
                </div>
                <div className="md:col-span-1">
                  <Input
                    label={index === 0 ? t("quantity") : ""}
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, "quantity", Number(e.target.value))}
                    min="1"
                    required
                    fullWidth
                  />
                </div>
                <div className="md:col-span-2">
                  <Input
                    label={index === 0 ? t("unit_cost") : ""}
                    type="number"
                    value={item.unitCost}
                    onChange={(e) => handleItemChange(index, "unitCost", Number(e.target.value))}
                    min="0"
                    required
                    fullWidth
                  />
                </div>
                <div className="md:col-span-1">
                  <Input
                    label={index === 0 ? t("tax") : ""}
                    type="number"
                    value={item.tax}
                    onChange={(e) => handleItemChange(index, "tax", Number(e.target.value))}
                    min="0"
                    fullWidth
                  />
                </div>
                <div className="md:col-span-2">
                  <div className="text-sm font-semibold text-indigo-600 mt-2 pt-2">
                    {((item.quantity * item.unitCost) + (item.tax || 0)).toLocaleString()} EGP
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
            <span className="text-sm text-gray-600">{t("subtotal")}</span>
            <span className="text-sm font-medium">{subtotal.toLocaleString()} EGP</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{t("tax_amount")}</span>
            <span className="text-sm font-medium">+ {taxAmount.toLocaleString()} EGP</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <span className="text-base font-bold text-gray-900">{t("total")}</span>
            <span className="text-lg font-bold text-indigo-600">{totalAmount.toLocaleString()} EGP</span>
          </div>
        </div>

        {/* Status & Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <Select
            label={t("payment_status")}
            value={formData.paymentStatus}
            onChange={(e) => handleChange("paymentStatus", e.target.value)}
            options={paymentStatusOptions}
            required
            fullWidth
          />
          <Select
            label={t("delivery_status")}
            value={formData.deliveryStatus}
            onChange={(e) => handleChange("deliveryStatus", e.target.value)}
            options={deliveryStatusOptions}
            required
            fullWidth
          />
          <TextArea
            label={t("notes")}
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder={t("enter_notes")}
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
            {orderToEdit ? t("save") : t("add_purchase_order")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};