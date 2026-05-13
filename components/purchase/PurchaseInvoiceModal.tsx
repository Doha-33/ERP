import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Trash2, Package, DollarSign, Calendar, Building2, Users, Hash, Truck, CreditCard, Warehouse, FileText } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { PurchaseInvoice } from "../../types";
import { useData } from "../../context/DataContext";
import { toast } from "sonner";

interface PurchaseInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<PurchaseInvoice>) => Promise<void>;
  invoiceToEdit?: PurchaseInvoice | null;
  isLoading?: boolean;
}

interface InvoiceItem {
  productId: string;
  sku: string;
  quantity: number;
  unitCost: number;
  tax: number;
  total: number;
}

export const PurchaseInvoiceModal: React.FC<PurchaseInvoiceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  invoiceToEdit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const { suppliers, products, companies, branches, purchaseOrders, warehouses } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    invoiceNo: "",
    supplierId: "",
    purchaseOrderId: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: new Date().toISOString().split("T")[0],
    warehouseId: "",
    companyId: "",
    branchId: "",
    paymentStatus: "UNPAID",
    deliveryStatus: "PENDING",
    discountAmount: 0,
    notes: "",
  });
  
  const [items, setItems] = useState<InvoiceItem[]>([
    { productId: "", sku: "", quantity: 1, unitCost: 0, tax: 0, total: 0 }
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
  const totalAmount = subtotal + taxAmount - formData.discountAmount;

  useEffect(() => {
    if (invoiceToEdit && isOpen) {
      const supplierId = extractId(invoiceToEdit.supplierId);
      const poId = extractId(invoiceToEdit.purchaseOrderId);
      const companyId = extractId(invoiceToEdit.companyId);
      const branchId = extractId(invoiceToEdit.branchId);
      const warehouseId = extractId(invoiceToEdit.warehouseId);

      setFormData({
        invoiceNo: invoiceToEdit.invoiceNo || "",
        supplierId: supplierId || "",
        purchaseOrderId: poId || "",
        invoiceDate: invoiceToEdit.invoiceDate 
          ? new Date(invoiceToEdit.invoiceDate).toISOString().split("T")[0] 
          : new Date().toISOString().split("T")[0],
        dueDate: invoiceToEdit.dueDate 
          ? new Date(invoiceToEdit.dueDate).toISOString().split("T")[0] 
          : new Date().toISOString().split("T")[0],
        warehouseId: warehouseId || "",
        companyId: companyId || "",
        branchId: branchId || "",
        paymentStatus: invoiceToEdit.paymentStatus || "UNPAID",
        deliveryStatus: invoiceToEdit.deliveryStatus || "PENDING",
        discountAmount: invoiceToEdit.discountAmount || 0,
        notes: invoiceToEdit.notes || "",
      });
      
      if (invoiceToEdit.items && invoiceToEdit.items.length > 0) {
        setItems(invoiceToEdit.items.map(item => ({
          productId: extractId(item.productId),
          sku: item.sku || "",
          quantity: item.quantity,
          unitCost: item.unitCost,
          tax: item.tax || 0,
          total: item.total || (item.quantity * item.unitCost + (item.tax || 0))
        })));
      }
    } else if (!invoiceToEdit && isOpen) {
      const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      setFormData({
        invoiceNo: `PINV-${randomNum}`,
        supplierId: "",
        purchaseOrderId: "",
        invoiceDate: new Date().toISOString().split("T")[0],
        dueDate: new Date().toISOString().split("T")[0],
        warehouseId: "",
        companyId: "",
        branchId: "",
        paymentStatus: "UNPAID",
        deliveryStatus: "PENDING",
        discountAmount: 0,
        notes: "",
      });
      setItems([{ productId: "", sku: "", quantity: 1, unitCost: 0, tax: 0, total: 0 }]);
    }
  }, [invoiceToEdit, isOpen, extractId]);

  // Update items when PO is selected
  const onPOChange = (poId: string) => {
    const selectedPO = purchaseOrders.find(po => extractId(po) === poId);
    if (selectedPO) {
      setFormData(prev => ({
        ...prev,
        supplierId: extractId(selectedPO.supplierId),
        companyId: extractId(selectedPO.companyId),
        branchId: extractId(selectedPO.branchId),
      }));
      
      if (selectedPO.items && selectedPO.items.length > 0) {
        setItems(selectedPO.items.map(item => ({
          productId: extractId(item.productId),
          sku: item.sku || "",
          quantity: item.quantity,
          unitCost: item.unitCost,
          tax: item.tax || 0,
          total: (item.quantity * item.unitCost) + (item.tax || 0)
        })));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation
    if (!formData.invoiceNo) {
      toast.error(t("invoice_number_required"));
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
      const saveData = {
        ...formData,
        items: items.map(item => ({
          productId: item.productId,
          sku: item.sku,
          quantity: item.quantity,
          unitCost: item.unitCost,
          tax: item.tax,
          total: item.total
        })),
        subtotal,
        taxAmount,
        totalAmount,
      };
      
      console.log("Saving purchase invoice:", saveData);
      await onSave(saveData);
      onClose();
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error(t("failed_to_save_purchase_invoice"));
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

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
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
    
    // Recalculate total
    newItems[index].total = (newItems[index].quantity * newItems[index].unitCost) + (newItems[index].tax || 0);
    
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { productId: "", sku: "", quantity: 1, unitCost: 0, tax: 0, total: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

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

  const warehouseOptions = warehouses.map(w => ({ 
    value: extractId(w), 
    label: w.warehouseName 
  }));

  const productOptions = products.map(p => ({ 
    value: extractId(p), 
    label: `${p.productName} (${p.sku})` 
  }));

  const poOptions = [
    { value: "", label: t("select_po") },
    ...purchaseOrders.map(po => ({ 
      value: extractId(po), 
      label: po.referenceNo 
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {invoiceToEdit ? <Edit2 size={20} /> : <Plus size={20} />}
          {invoiceToEdit ? t("edit_purchase_invoice") : t("add_purchase_invoice")}
        </div>
      }
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto px-2">
        {/* Invoice Information */}
        <div className="border-b border-gray-100 pb-4">
          <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText size={18} className="text-indigo-600" />
            {t("invoice_information")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
            <Input
              label={t("invoice_number")}
              value={formData.invoiceNo}
              onChange={(e) => handleChange("invoiceNo", e.target.value)}
              placeholder="PINV-001"
              required
              fullWidth
            />
            <Input
              label={t("invoice_date")}
              type="date"
              value={formData.invoiceDate}
              onChange={(e) => handleChange("invoiceDate", e.target.value)}
              required
              fullWidth
            />
            <Input
              label={t("due_date")}
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleChange("dueDate", e.target.value)}
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
              label={t("supplier")}
              value={formData.supplierId}
              onChange={(e) => handleChange("supplierId", e.target.value)}
              options={supplierOptions}
              placeholder={t("select_supplier")}
              required
              fullWidth
            />
            <Select
              label={t("warehouse")}
              value={formData.warehouseId}
              onChange={(e) => handleChange("warehouseId", e.target.value)}
              options={warehouseOptions}
              placeholder={t("select_warehouse")}
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
          </div>
        </div>

        {/* Invoice Items */}
        <div className="border-b border-gray-100 pb-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-semibold text-gray-900 flex items-center gap-2">
              <Package size={18} className="text-indigo-600" />
              {t("invoice_items")}
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
              <div className="col-span-2">{t("total")}</div>
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
            <span className="text-sm text-gray-600">{t("subtotal")}</span>
            <span className="text-sm font-medium">{subtotal.toLocaleString()} EGP</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{t("tax_amount")}</span>
            <span className="text-sm font-medium">+ {taxAmount.toLocaleString()} EGP</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{t("discount")}</span>
            <Input
              type="number"
              value={formData.discountAmount}
              onChange={(e) => handleChange("discountAmount", Number(e.target.value))}
              min="0"
              className="w-32 text-right"
            />
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
            {invoiceToEdit ? t("save") : t("add_purchase_invoice")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};