import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, FileText, Calendar, CreditCard, Warehouse, Package, DollarSign } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { SalesInvoice } from "../../types";
import { useData } from "../../context/DataContext";

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<SalesInvoice>) => Promise<void>;
  invoiceToEdit?: SalesInvoice | null;
  isLoading?: boolean;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  invoiceToEdit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const { salesOrders, warehouses, customers } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    salesOrderId: "",
    invoiceNumber: "",
    paymentStatus: "UNPAID",
    issuedDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    warehouseId: "",
    notes: "",
  });

  useEffect(() => {
    if (invoiceToEdit && isOpen) {
      const orderId = typeof invoiceToEdit.salesOrderId === "object"
        ? (invoiceToEdit.salesOrderId as any)?._id
        : invoiceToEdit.salesOrderId;
      const warehouseId = typeof invoiceToEdit.warehouseId === "object"
        ? (invoiceToEdit.warehouseId as any)?._id
        : invoiceToEdit.warehouseId;

      setFormData({
        salesOrderId: orderId || "",
        invoiceNumber: invoiceToEdit.invoiceNumber || `INV-${Date.now()}`,
        paymentStatus: invoiceToEdit.paymentStatus || "UNPAID",
        issuedDate: invoiceToEdit.issuedDate
          ? new Date(invoiceToEdit.issuedDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        dueDate: invoiceToEdit.dueDate
          ? new Date(invoiceToEdit.dueDate).toISOString().split("T")[0]
          : "",
        warehouseId: warehouseId || "",
        notes: invoiceToEdit.notes || "",
      });
    } else if (!invoiceToEdit && isOpen) {
      setFormData({
        salesOrderId: "",
        invoiceNumber: `INV-${Date.now()}`,
        paymentStatus: "UNPAID",
        issuedDate: new Date().toISOString().split("T")[0],
        dueDate: "",
        warehouseId: "",
        notes: "",
      });
    }
  }, [invoiceToEdit, isOpen]);

  const paymentStatusOptions = [
    { value: "PAID", label: t("paid") },
    { value: "UNPAID", label: t("unpaid") },
    { value: "PARTIALLY_PAID", label: t("partially_paid") },
  ];

  const orderOptions = salesOrders.map(o => ({
    value: o._id || o.id,
    label: o.orderNo,
  }));

  const warehouseOptions = warehouses.map(w => ({
    value: w._id || w.id,
    label: w.warehouseName,
  }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Get selected order details
    const selectedOrder = salesOrders.find(o => (o._id || o.id) === formData.salesOrderId);
    
    try {
      await onSave({
        ...formData,
        salesOrderId: formData.salesOrderId,
        customerId: selectedOrder?.customerId,
        items: selectedOrder?.items,
        subtotal: selectedOrder?.subtotal,
        taxAmount: selectedOrder?.taxAmount,
        discountAmount: selectedOrder?.discountAmount,
        totalAmount: selectedOrder?.totalAmount,
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

  // Get selected order details for preview
  const selectedOrder = salesOrders.find(o => (o._id || o.id) === formData.salesOrderId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {invoiceToEdit ? <Edit2 size={20} /> : <Plus size={20} />}
          {invoiceToEdit ? t("edit_invoice") : t("add_invoice")}
        </div>
      }
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Invoice Number */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("invoice_number")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.invoiceNumber}
              onChange={(e) => handleChange("invoiceNumber", e.target.value)}
              placeholder="INV-001"
              required
              fullWidth
            />
          </div>

          {/* Sales Order */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("sales_order")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.salesOrderId}
              onChange={(e) => handleChange("salesOrderId", e.target.value)}
              options={orderOptions}
              placeholder={t("select_order")}
              required
              fullWidth
            />
          </div>

          {/* Issued Date */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("issued_date")} <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={formData.issuedDate}
              onChange={(e) => handleChange("issuedDate", e.target.value)}
              required
              fullWidth
            />
          </div>

          {/* Due Date */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("due_date")}
            </label>
            <Input
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleChange("dueDate", e.target.value)}
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

          {/* Payment Status */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("payment_status")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.paymentStatus}
              onChange={(e) => handleChange("paymentStatus", e.target.value)}
              options={paymentStatusOptions}
              required
              fullWidth
            />
          </div>
        </div>

        {/* Order Summary Preview */}
        {selectedOrder && (
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <h3 className="text-md font-semibold text-gray-900 flex items-center gap-2">
              <Package size={18} className="text-indigo-600" />
              {t("order_summary")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">{t("customer")}</p>
                <p className="text-sm font-medium">{selectedOrder.customerId?.customerName || selectedOrder.customerId?.name || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">{t("order_date")}</p>
                <p className="text-sm">{new Date(selectedOrder.orderDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">{t("items_count")}</p>
                <p className="text-sm">{selectedOrder.items?.length || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">{t("total_amount")}</p>
                <p className="text-sm font-bold text-indigo-600">{selectedOrder.totalAmount?.toLocaleString()} EGP</p>
              </div>
            </div>
          </div>
        )}

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
            {invoiceToEdit ? t("save") : t("add_invoice")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};