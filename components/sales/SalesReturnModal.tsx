import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, FileText, DollarSign, Package, User, Warehouse, AlertCircle, RefreshCw } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { SalesReturn } from "../../types";
import { useData } from "../../context/DataContext";
import { toast } from "sonner";

interface SalesReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<SalesReturn>) => Promise<void>;
  returnToEdit?: SalesReturn | null;
  isLoading?: boolean;
}

interface ReturnItem {
  productId: string;
  sku?: string;
  returnQuantity: number;
  invoicedQuantity: number;  // Added: quantity from original invoice
  unitPrice: number;         // Added: unit price from original invoice
  reasonForReturn: string;
}

export const SalesReturnModal: React.FC<SalesReturnModalProps> = ({
  isOpen,
  onClose,
  onSave,
  returnToEdit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const { salesInvoices, customers, warehouses, products } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [originalItem, setOriginalItem] = useState<any>(null); // Store original invoice item details
  const [formData, setFormData] = useState({
    originalInvoiceId: "",
    customerId: "",
    warehouseId: "",
    refundStatus: "PENDING",
    reasonForReturn: "",
    returnQuantity: 1,
    productId: "",
  });

  // Helper function to extract ID
  const extractId = (value: any): string => {
    if (!value) return "";
    if (typeof value === "object") {
      return value._id || value.id || "";
    }
    return value;
  };

  useEffect(() => {
    if (returnToEdit && isOpen) {
      const invoiceId = extractId(returnToEdit.originalInvoiceId);
      const customerId = extractId(returnToEdit.customerId);
      const warehouseId = extractId(returnToEdit.warehouseId);
      const productId = extractId(returnToEdit.items?.[0]?.productId);

      setFormData({
        originalInvoiceId: invoiceId || "",
        customerId: customerId || "",
        warehouseId: warehouseId || "",
        refundStatus: returnToEdit.refundStatus || "PENDING",
        reasonForReturn: returnToEdit.items?.[0]?.reasonForReturn || "",
        returnQuantity: returnToEdit.items?.[0]?.returnQuantity || 1,
        productId: productId || "",
      });

      // Load the invoice to get original item details
      const invoice = salesInvoices.find(i => extractId(i) === invoiceId);
      if (invoice) {
        setSelectedInvoice(invoice);
        const item = invoice.items?.find((item: any) => extractId(item.productId) === productId);
        if (item) {
          setOriginalItem(item);
          setSelectedProduct(item.productId);
        }
      }
    } else if (!returnToEdit && isOpen) {
      setFormData({
        originalInvoiceId: "",
        customerId: "",
        warehouseId: "",
        refundStatus: "PENDING",
        reasonForReturn: "",
        returnQuantity: 1,
        productId: "",
      });
      setSelectedInvoice(null);
      setOriginalItem(null);
      setSelectedProduct(null);
    }
  }, [returnToEdit, isOpen, salesInvoices]);

  // Handle invoice selection
  const handleInvoiceChange = (invoiceId: string) => {
    const invoice = salesInvoices.find(i => extractId(i) === invoiceId);
    setSelectedInvoice(invoice);
    setOriginalItem(null); // Reset selected item
    setSelectedProduct(null);
    setFormData(prev => ({
      ...prev,
      originalInvoiceId: invoiceId,
      customerId: extractId(invoice?.customerId),
      warehouseId: extractId(invoice?.warehouseId),
      productId: "", // Reset product
      returnQuantity: 1,
    }));
  };

  // Handle product selection - find the original item from invoice
  const handleProductChange = (productId: string) => {
    if (!selectedInvoice) return;
    
    // Find the original item in the invoice
    const item = selectedInvoice.items?.find((i: any) => extractId(i.productId) === productId);
    
    if (item) {
      setOriginalItem(item);
      setSelectedProduct(item.productId);
      setFormData(prev => ({
        ...prev,
        productId: productId,
        returnQuantity: 1,
      }));
    } else {
      setOriginalItem(null);
      setSelectedProduct(null);
      toast.error(t("product_not_found_in_invoice"));
    }
  };

  const refundStatusOptions = [
    { value: "PENDING", label: t("pending") },
    { value: "REFUNDED", label: t("refunded") },
    { value: "REJECTED", label: t("rejected") },
  ];

  // Only show products that exist in the selected invoice
  const productOptions = useMemo(() => {
    if (!selectedInvoice || !selectedInvoice.items) return [];
    
    return selectedInvoice.items.map((item: any) => ({
      value: extractId(item.productId),
      label: (item.productId as any)?.productName || item.sku || "Product",
      maxQuantity: item.quantity, // Store max returnable quantity
      unitPrice: item.unitPrice,   // Store unit price
      invoicedQuantity: item.quantity // Store original quantity
    }));
  }, [selectedInvoice]);

  const invoiceOptions = salesInvoices.map(i => ({
    value: extractId(i),
    label: `${i.invoiceNumber} - ${new Date(i.issuedDate).toLocaleDateString()}`,
  }));

  const customerOptions = customers.map(c => ({
    value: extractId(c),
    label: c.customerName,
  }));

  const warehouseOptions = warehouses.map(w => ({
    value: extractId(w),
    label: w.warehouseName,
  }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation
    if (!formData.originalInvoiceId) {
      toast.error(t("please_select_invoice"));
      return;
    }
    
    if (!formData.productId) {
      toast.error(t("please_select_product"));
      return;
    }
    
    if (!originalItem) {
      toast.error(t("product_not_found_in_invoice"));
      return;
    }
    
    if (formData.returnQuantity <= 0) {
      toast.error(t("return_quantity_must_be_positive"));
      return;
    }
    
    if (formData.returnQuantity > originalItem.quantity) {
      toast.error(t("return_quantity_exceeds_invoice_quantity", { max: originalItem.quantity }));
      return;
    }
    
    if (!formData.reasonForReturn.trim()) {
      toast.error(t("please_provide_reason_for_return"));
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare return items with all required fields
      const returnItems: ReturnItem[] = [
        {
          productId: formData.productId,
          sku: originalItem.sku || "",
          returnQuantity: formData.returnQuantity,
          invoicedQuantity: originalItem.quantity, // Required by API
          unitPrice: originalItem.unitPrice,       // Required by API
          reasonForReturn: formData.reasonForReturn,
        }
      ];

      const returnData: Partial<SalesReturn> = {
        returnNumber: returnToEdit?.returnNumber || `RET-${Date.now()}`,
        returnDate: returnToEdit?.returnDate || new Date().toISOString(),
        items: returnItems,
        originalInvoiceId: formData.originalInvoiceId,
        customerId: formData.customerId,
        warehouseId: formData.warehouseId,
        refundStatus: formData.refundStatus,
      };
      
      console.log("Submitting return data:", returnData);
      await onSave(returnData);
      onClose();
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error(t("failed_to_save_sales_return"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Check if return quantity is valid
  const isQuantityValid = formData.returnQuantity <= (originalItem?.quantity || 0);
  const maxQuantity = originalItem?.quantity || 0;

  // Get selected product details from options
  const selectedProductOption = productOptions.find(p => p.value === formData.productId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {returnToEdit ? <Edit2 size={20} /> : <Plus size={20} />}
          {returnToEdit ? t("edit_sales_return") : t("add_sales_return")}
        </div>
      }
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Original Invoice */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("original_invoice")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.originalInvoiceId}
              onChange={(e) => handleInvoiceChange(e.target.value)}
              options={invoiceOptions}
              placeholder={t("select_invoice")}
              required
              fullWidth
              disabled={!!returnToEdit} // Disable if editing
            />
          </div>

          {/* Product - Only shows products from selected invoice */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("product")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.productId}
              onChange={(e) => handleProductChange(e.target.value)}
              options={productOptions}
              placeholder={selectedInvoice ? t("select_product_from_invoice") : t("select_invoice_first")}
              required
              fullWidth
              disabled={!selectedInvoice || !!returnToEdit}
            />
          </div>

          {/* Customer - Readonly after invoice selection */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("customer")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.customerId}
              onChange={(e) => handleChange("customerId", e.target.value)}
              options={customerOptions}
              placeholder={t("select_customer")}
              required
              fullWidth
              disabled={!!selectedInvoice}
            />
          </div>

          {/* Warehouse - Readonly after invoice selection */}
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
              disabled={!!selectedInvoice}
            />
          </div>

          {/* Return Quantity */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("return_quantity")} <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              min="1"
              max={maxQuantity}
              value={formData.returnQuantity}
              onChange={(e) => handleChange("returnQuantity", Number(e.target.value))}
              required
              fullWidth
              disabled={!originalItem}
            />
            {originalItem && (
              <div className="flex flex-col gap-1 mt-1">
                <p className={`text-xs ${isQuantityValid ? 'text-gray-500' : 'text-red-600'}`}>
                  {t("max_returnable")}: {maxQuantity} {t("units")}
                  {!isQuantityValid && ` - ${t("exceeds_maximum")}`}
                </p>
                <p className="text-xs text-gray-500">
                  {t("unit_price")}: {selectedProductOption?.unitPrice?.toLocaleString()} EGP
                </p>
                <p className="text-xs text-gray-500">
                  {t("original_quantity")}: {selectedProductOption?.invoicedQuantity} {t("units")}
                </p>
              </div>
            )}
          </div>

          {/* Refund Status */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("refund_status")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.refundStatus}
              onChange={(e) => handleChange("refundStatus", e.target.value)}
              options={refundStatusOptions}
              required
              fullWidth
            />
          </div>

          {/* Reason for Return */}
          <div className="col-span-2 space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("reason_for_return")} <span className="text-red-500">*</span>
            </label>
            <TextArea
              value={formData.reasonForReturn}
              onChange={(e) => handleChange("reasonForReturn", e.target.value)}
              placeholder={t("enter_reason_for_return")}
              rows={3}
              required
              fullWidth
            />
          </div>
        </div>

        {/* Invoice Summary Preview */}
        {selectedInvoice && (
          <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 space-y-3 border border-gray-100">
            <h3 className="text-md font-semibold text-gray-900 flex items-center gap-2">
              <FileText size={18} className="text-indigo-600" />
              {t("invoice_summary")}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500">{t("invoice_number")}</p>
                <p className="text-sm font-medium text-gray-900">{selectedInvoice.invoiceNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">{t("invoice_date")}</p>
                <p className="text-sm text-gray-700">{new Date(selectedInvoice.issuedDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">{t("total_amount")}</p>
                <p className="text-sm font-bold text-indigo-600">{selectedInvoice.totalAmount?.toLocaleString()} EGP</p>
              </div>
            </div>
            
            {/* Show selected product details */}
            {originalItem && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs font-medium text-gray-500 mb-2">{t("selected_product_details")}</p>
                <div className="bg-white rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t("product")}:</span>
                    <span className="font-medium text-gray-900">
                      {(originalItem.productId as any)?.productName || originalItem.sku}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t("original_quantity")}:</span>
                    <span className="text-gray-900">{originalItem.quantity}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t("unit_price")}:</span>
                    <span className="text-gray-900">{originalItem.unitPrice?.toLocaleString()} EGP</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t("return_quantity")}:</span>
                    <span className={`font-medium ${isQuantityValid ? 'text-indigo-600' : 'text-red-600'}`}>
                      {formData.returnQuantity}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
                    <span className="text-gray-500">{t("refund_amount")}:</span>
                    <span className="font-bold text-indigo-600">
                      {(originalItem.unitPrice * formData.returnQuantity).toLocaleString()} EGP
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting || isLoading} type="button">
            {t("cancel")}
          </Button>
          <Button
            variant="primary"
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 px-8"
            isLoading={isSubmitting || isLoading}
            disabled={isSubmitting || isLoading || !isQuantityValid || !originalItem}
          >
            {returnToEdit ? t("save") : t("create_return")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};