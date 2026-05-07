import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Edit2,
  FileText,
  Calendar,
  CreditCard,
  Warehouse,
  Package,
  DollarSign,
} from "lucide-react";
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

  // Helper function to extract ID from object or return value directly
  const extractId = (value: any): string => {
    if (!value) return "";
    if (typeof value === "object") {
      return value._id || value.id || "";
    }
    return value;
  };
  // خارج useEffect، داخل المكون
  const calculateDefaultDueDate = (daysToAdd: number = 30): string => {
    const date = new Date();
    date.setDate(date.getDate() + daysToAdd);
    return date.toISOString().split("T")[0];
  };
  useEffect(() => {
    if (!isOpen) return; // Early exit if modal is not open

    // Helper function to safely format date
    const formatDateForInput = (
      dateValue: string | Date | undefined,
    ): string => {
      if (!dateValue) return "";
      try {
        const date =
          typeof dateValue === "string" ? new Date(dateValue) : dateValue;
        if (isNaN(date.getTime())) return "";
        return date.toISOString().split("T")[0];
      } catch (error) {
        console.error("Error formatting date:", error);
        return "";
      }
    };

    // Generate unique invoice number
    const generateInvoiceNumber = (): string => {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");
      return `INV-${timestamp}-${random}`;
    };

    if (invoiceToEdit) {
      // Editing existing invoice
      const orderId = extractId(invoiceToEdit.salesOrderId);
      const warehouseId = extractId(invoiceToEdit.warehouseId);

      setFormData({
        salesOrderId: orderId || "",
        invoiceNumber: invoiceToEdit.invoiceNumber || generateInvoiceNumber(),
        paymentStatus: invoiceToEdit.paymentStatus || "UNPAID",
        issuedDate:
          formatDateForInput(invoiceToEdit.issuedDate) ||
          formatDateForInput(new Date()),
        dueDate: formatDateForInput(invoiceToEdit.dueDate),
        warehouseId: warehouseId || "",
        notes: invoiceToEdit.notes || "",
      });
    } else {
      // Creating new invoice
      // Optional: Auto-select the latest order or clear selection
      const latestOrder =
        salesOrders.length > 0 ? extractId(salesOrders[0]) : "";

      setFormData({
        salesOrderId: latestOrder, // Auto-select latest order (optional)
        invoiceNumber: generateInvoiceNumber(),
        paymentStatus: "UNPAID",
        issuedDate: formatDateForInput(new Date()),
        dueDate: calculateDefaultDueDate(), // Optional: calculate default due date (e.g., 30 days from now)
        warehouseId: "",
        notes: "",
      });
    }
  }, [invoiceToEdit, isOpen, salesOrders]); // Added salesOrders as dependency
  const paymentStatusOptions = [
    { value: "PAID", label: t("paid") },
    { value: "UNPAID", label: t("unpaid") },
    { value: "PARTIALLY_PAID", label: t("partially_paid") },
  ];

  const orderOptions = salesOrders.map((o) => ({
    value: extractId(o),
    label: o.orderNo,
  }));

  const warehouseOptions = warehouses.map((w) => ({
    value: extractId(w),
    label: w.warehouseName,
  }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Get selected order details
    const selectedOrder = salesOrders.find(
      (o) => extractId(o) === formData.salesOrderId,
    );

    if (!selectedOrder) {
      console.error("No order selected");
      setIsSubmitting(false);
      return;
    }

    // Extract IDs from all nested objects
    const customerId = extractId(selectedOrder.customerId);
    const warehouseId = extractId(formData.warehouseId);

    // Process items to extract product IDs
    const processedItems =
      selectedOrder.items?.map((item) => ({
        ...item,
        productId: extractId(item.productId), // Convert product object to ID string
        // Remove any nested objects that might cause issues
        product: undefined,
      })) || [];

    try {
      // Prepare clean data with only IDs, not objects
      const invoiceData: Partial<SalesInvoice> = {
        invoiceNumber: formData.invoiceNumber,
        paymentStatus: formData.paymentStatus,
        issuedDate: formData.issuedDate,
        dueDate: formData.dueDate || undefined,
        warehouseId: warehouseId, // Send as string ID
        salesOrderId: formData.salesOrderId, // Send as string ID
        customerId: customerId, // Send as string ID
        notes: formData.notes,
        // Order details
        items: processedItems,
        subtotal: selectedOrder.subtotal,
        taxAmount: selectedOrder.taxAmount,
        discountAmount: selectedOrder.discountAmount,
        totalAmount: selectedOrder.totalAmount,
      };

      console.log("Sending invoice data:", invoiceData);
      await onSave(invoiceData);
      onClose();
    } catch (error) {
      console.error("Error in form submission:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Get selected order details for preview
  const selectedOrder = salesOrders.find(
    (o) => extractId(o) === formData.salesOrderId,
  );

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500">{t("customer")}</p>
                <p className="text-sm font-medium">
                  {typeof selectedOrder.customerId === "object"
                    ? (selectedOrder.customerId as any)?.customerName ||
                      (selectedOrder.customerId as any)?.name ||
                      "-"
                    : selectedOrder.customerId || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">{t("order_date")}</p>
                <p className="text-sm">
                  {selectedOrder.orderDate
                    ? new Date(selectedOrder.orderDate).toLocaleDateString()
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">{t("items_count")}</p>
                <p className="text-sm">{selectedOrder.items?.length || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">{t("subtotal")}</p>
                <p className="text-sm">
                  {selectedOrder.subtotal?.toLocaleString()} EGP
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">{t("tax")}</p>
                <p className="text-sm">
                  {selectedOrder.taxAmount?.toLocaleString()} EGP
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">{t("total_amount")}</p>
                <p className="text-sm font-bold text-indigo-600">
                  {selectedOrder.totalAmount?.toLocaleString()} EGP
                </p>
              </div>
            </div>

            {/* Items Preview */}
            {selectedOrder.items && selectedOrder.items.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-2">{t("items")}</p>
                <div className="space-y-1">
                  {selectedOrder.items.slice(0, 3).map((item, idx) => (
                    <div
                      key={idx}
                      className="text-sm text-gray-600 flex justify-between"
                    >
                      <span>
                        {typeof item.productId === "object"
                          ? (item.productId as any)?.productName || item.sku
                          : item.sku || item.productId}{" "}
                        x {item.quantity}
                      </span>
                      <span>{item.total?.toLocaleString()} EGP</span>
                    </div>
                  ))}
                  {selectedOrder.items.length > 3 && (
                    <p className="text-xs text-gray-400">
                      +{selectedOrder.items.length - 3} more items
                    </p>
                  )}
                </div>
              </div>
            )}
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
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting || isLoading}
          >
            {t("cancel")}
          </Button>
          <Button
            variant="primary"
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 px-8"
            isLoading={isSubmitting || isLoading}
            disabled={
              isSubmitting ||
              isLoading ||
              !formData.salesOrderId ||
              !formData.warehouseId
            }
          >
            {invoiceToEdit ? t("save") : t("create_invoice")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
