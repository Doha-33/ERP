import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, FileText, DollarSign, Package, User, Warehouse, AlertCircle, RefreshCw } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { SalesReturn } from "../../types";
import { useData } from "../../context/DataContext";

interface SalesReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<SalesReturn>) => Promise<void>;
  returnToEdit?: SalesReturn | null;
  isLoading?: boolean;
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
  const [formData, setFormData] = useState({
    originalInvoiceId: "",
    customerId: "",
    warehouseId: "",
    refundStatus: "PENDING",
    reasonForReturn: "",
    returnQuantity: 1,
    productId: "",
  });

  useEffect(() => {
    if (returnToEdit && isOpen) {
      const invoiceId = typeof returnToEdit.originalInvoiceId === "object"
        ? (returnToEdit.originalInvoiceId as any)?._id
        : returnToEdit.originalInvoiceId;
      const customerId = typeof returnToEdit.customerId === "object"
        ? (returnToEdit.customerId as any)?._id
        : returnToEdit.customerId;
      const warehouseId = typeof returnToEdit.warehouseId === "object"
        ? (returnToEdit.warehouseId as any)?._id
        : returnToEdit.warehouseId;
      const productId = typeof returnToEdit.items?.[0]?.productId === "object"
        ? (returnToEdit.items[0].productId as any)?._id
        : returnToEdit.items?.[0]?.productId;

      setFormData({
        originalInvoiceId: invoiceId || "",
        customerId: customerId || "",
        warehouseId: warehouseId || "",
        refundStatus: returnToEdit.refundStatus || "PENDING",
        reasonForReturn: returnToEdit.items?.[0]?.reasonForReturn || "",
        returnQuantity: returnToEdit.items?.[0]?.returnQuantity || 1,
        productId: productId || "",
      });
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
    }
  }, [returnToEdit, isOpen]);

  // Update customer and warehouse when invoice is selected
  const handleInvoiceChange = (invoiceId: string) => {
    const invoice = salesInvoices.find(i => (i._id || i.id) === invoiceId);
    setSelectedInvoice(invoice);
    setFormData(prev => ({
      ...prev,
      originalInvoiceId: invoiceId,
      customerId: typeof invoice?.customerId === "object" ? (invoice?.customerId as any)?._id : invoice?.customerId || "",
      warehouseId: typeof invoice?.warehouseId === "object" ? (invoice?.warehouseId as any)?._id : invoice?.warehouseId || "",
    }));
  };

  const refundStatusOptions = [
    { value: "PENDING", label: t("pending") },
    { value: "REFUNDED", label: t("refunded") },
    { value: "REJECTED", label: t("rejected") },
  ];

  const invoiceOptions = salesInvoices.map(i => ({
    value: i._id || i.id,
    label: `${i.invoiceNumber} - ${new Date(i.issuedDate).toLocaleDateString()}`,
  }));

  const customerOptions = customers.map(c => ({
    value: c._id || c.id,
    label: c.customerName,
  }));

  const warehouseOptions = warehouses.map(w => ({
    value: w._id || w.id,
    label: w.warehouseName,
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
        returnNumber: returnToEdit?.returnNumber || `RET-${Date.now()}`,
        returnDate: returnToEdit?.returnDate || new Date().toISOString(),
        items: [
          {
            productId: formData.productId,
            returnQuantity: formData.returnQuantity,
            reasonForReturn: formData.reasonForReturn,
          }
        ],
        originalInvoiceId: formData.originalInvoiceId,
        customerId: formData.customerId,
        warehouseId: formData.warehouseId,
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

  // Get selected product details
  const selectedProduct = products.find(p => (p._id || p.id) === formData.productId);

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
            />
          </div>

          {/* Product */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("product")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.productId}
              onChange={(e) => handleChange("productId", e.target.value)}
              options={productOptions}
              placeholder={t("select_product")}
              required
              fullWidth
            />
          </div>

          {/* Customer */}
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

          {/* Return Quantity */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("return_quantity")} <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              min="1"
              value={formData.returnQuantity}
              onChange={(e) => handleChange("returnQuantity", Number(e.target.value))}
              required
              fullWidth
            />
            {selectedProduct && (
              <p className="text-xs text-gray-500">
                {t("max_quantity")}: {selectedProduct.currentStock || 0}
              </p>
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
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <h3 className="text-md font-semibold text-gray-900 flex items-center gap-2">
              <FileText size={18} className="text-indigo-600" />
              {t("invoice_summary")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500">{t("invoice_number")}</p>
                <p className="text-sm font-medium">{selectedInvoice.invoiceNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">{t("invoice_date")}</p>
                <p className="text-sm">{new Date(selectedInvoice.issuedDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">{t("total_amount")}</p>
                <p className="text-sm font-bold text-indigo-600">{selectedInvoice.totalAmount?.toLocaleString()} EGP</p>
              </div>
            </div>
          </div>
        )}

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
            {returnToEdit ? t("save") : t("add_sales_return")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};