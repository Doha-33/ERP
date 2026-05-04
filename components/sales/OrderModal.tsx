import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { X, Plus, Edit2, Package, Users, Building2, MapPin, Warehouse, User, CreditCard, Truck, FileText } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { SalesOrder } from "../../types";
import { useData } from "../../context/DataContext";

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<SalesOrder>) => Promise<void>;
  orderToEdit?: SalesOrder | null;
  isLoading?: boolean;
}

interface OrderItem {
  productId: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  orderToEdit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const { 
    customers, 
    companies, 
    branches, 
    warehouses, 
    employees, 
    products 
  } = useData();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    orderNo: "",
    customerId: "",
    companyId: "",
    branchId: "",
    warehouseId: "",
    salespersonId: "",
    paymentStatus: "UNPAID",
    deliveryStatus: "PENDING",
    status: "DRAFT",
    notes: "",
  });
  
  const [items, setItems] = useState<OrderItem[]>([
    { productId: "", sku: "", quantity: 1, unitPrice: 0, discount: 0, tax: 0, total: 0 }
  ]);
  
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const discountAmount = items.reduce((sum, item) => sum + (item.discount || 0), 0);
  const taxAmount = items.reduce((sum, item) => sum + (item.tax || 0), 0);
  const totalAmount = items.reduce((sum, item) => sum + (item.total || 0), 0);

  useEffect(() => {
    if (orderToEdit && isOpen) {
      setFormData({
        orderNo: orderToEdit.orderNo || "",
        customerId: typeof orderToEdit.customerId === "object" ? (orderToEdit.customerId as any)._id : orderToEdit.customerId || "",
        companyId: typeof orderToEdit.companyId === "object" ? (orderToEdit.companyId as any)._id : orderToEdit.companyId || "",
        branchId: typeof orderToEdit.branchId === "object" ? (orderToEdit.branchId as any)._id : orderToEdit.branchId || "",
        warehouseId: typeof orderToEdit.warehouseId === "object" ? (orderToEdit.warehouseId as any)._id : orderToEdit.warehouseId || "",
        salespersonId: typeof orderToEdit.salespersonId === "object" ? (orderToEdit.salespersonId as any)._id : orderToEdit.salespersonId || "",
        paymentStatus: orderToEdit.paymentStatus || "UNPAID",
        deliveryStatus: orderToEdit.deliveryStatus || "PENDING",
        status: orderToEdit.status || "DRAFT",
        notes: orderToEdit.notes || "",
      });
      
      if (orderToEdit.items && orderToEdit.items.length > 0) {
        setItems(orderToEdit.items.map(item => ({
          productId: typeof item.productId === "object" ? (item.productId as any)._id : item.productId,
          sku: item.sku || "",
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount || 0,
          tax: item.tax || 0,
          total: item.total || ((item.quantity * item.unitPrice) - (item.discount || 0) + (item.tax || 0))
        })));
      }
    } else if (!orderToEdit && isOpen) {
      setFormData({
        orderNo: "",
        customerId: "",
        companyId: "",
        branchId: "",
        warehouseId: "",
        salespersonId: "",
        paymentStatus: "UNPAID",
        deliveryStatus: "PENDING",
        status: "DRAFT",
        notes: "",
      });
      setItems([{ productId: "", sku: "", quantity: 1, unitPrice: 0, discount: 0, tax: 0, total: 0 }]);
    }
  }, [orderToEdit, isOpen]);

  const customerOptions = customers.map(c => ({ value: c._id || c.id, label: c.customerName }));
  const companyOptions = companies.map(c => ({ value: c._id || c.id, label: c.name }));
  const branchOptions = branches.map(b => ({ value: b._id || b.id, label: b.name }));
  const warehouseOptions = warehouses.map(w => ({ value: w._id || w.id, label: w.warehouseName }));
  const salespersonOptions = employees.map(e => ({ value: e._id || e.id, label: e.fullName }));
  const productOptions = products.map(p => ({ value: p._id || p.id, label: `${p.productName} (${p.sku})` }));

  const paymentStatusOptions = [
    { value: "UNPAID", label: t("unpaid") },
    { value: "PAID", label: t("paid") },
    { value: "PARTIALLY_PAID", label: t("partially_paid") },
  ];

  const deliveryStatusOptions = [
    { value: "PENDING", label: t("pending") },
    { value: "SHIPPED", label: t("shipped") },
    { value: "DELIVERED", label: t("delivered") },
    { value: "CANCELLED", label: t("cancelled") },
  ];

  const orderStatusOptions = [
    { value: "DRAFT", label: t("draft") },
    { value: "CONFIRMED", label: t("confirmed") },
    { value: "CANCELLED", label: t("cancelled") },
  ];

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Recalculate total
    const item = newItems[index];
    newItems[index].total = (item.quantity * item.unitPrice) - item.discount + item.tax;
    
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { productId: "", sku: "", quantity: 1, unitPrice: 0, discount: 0, tax: 0, total: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const submitData = {
      ...formData,
      items: items.map(item => ({
        productId: item.productId,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        tax: item.tax,
        total: item.total
      })),
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount,
      orderDate: new Date().toISOString(),
    };
    
    try {
      await onSave(submitData);
      onClose();
    } catch (error) {
      console.error("Error in form submission:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {orderToEdit ? <Edit2 size={20} /> : <Plus size={20} />}
          {orderToEdit ? t("edit_order") : t("add_order")}
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
              value={formData.orderNo}
              onChange={(e) => handleChange("orderNo", e.target.value)}
              placeholder="SO-001"
              required
              fullWidth
            />
            <Select
              label={t("customer")}
              value={formData.customerId}
              onChange={(e) => handleChange("customerId", e.target.value)}
              options={customerOptions}
              placeholder={t("select_customer")}
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
              placeholder={t("select_branch")}
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
            <Select
              label={t("salesperson")}
              value={formData.salespersonId}
              onChange={(e) => handleChange("salespersonId", e.target.value)}
              options={salespersonOptions}
              placeholder={t("select_salesperson")}
              required
              fullWidth
            />
          </div>
        </div>

        {/* Order Items */}
        <div className="border-b border-gray-100 pb-4">
          <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package size={18} className="text-indigo-600" />
            {t("order_items")}
          </h3>
          
          <div className="space-y-3">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-3 px-2 py-2 bg-gray-50 rounded-lg text-xs font-medium text-gray-500">
              <div className="col-span-5">{t("product")}</div>
              <div className="col-span-2">{t("quantity")}</div>
              <div className="col-span-2">{t("unit_price")}</div>
              <div className="col-span-2">{t("total")}</div>
              <div className="col-span-1"></div>
            </div>
            
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end p-3 bg-gray-50 rounded-lg">
                <div className="md:col-span-5">
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
                  <div className="text-sm font-semibold text-gray-900 mt-2 pt-2">
                    {(item.quantity * item.unitPrice).toLocaleString()} EGP
                  </div>
                </div>
                <div className="md:col-span-1 flex justify-end">
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            <Button
              type="button"
              variant="secondary"
              onClick={addItem}
              className="w-full border-dashed border-2 border-gray-300 text-gray-500 hover:border-indigo-300 hover:text-indigo-600"
            >
              <Plus size={18} />
              {t("add_item")}
            </Button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="border-b border-gray-100 pb-4">
          <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard size={18} className="text-indigo-600" />
            {t("order_summary")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
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
            <Select
              label={t("order_status")}
              value={formData.status}
              onChange={(e) => handleChange("status", e.target.value)}
              options={orderStatusOptions}
              required
              fullWidth
            />
          </div>
        </div>

        {/* Totals */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{t("subtotal")}</span>
            <span className="text-sm font-medium">{subtotal.toLocaleString()} EGP</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{t("discount")}</span>
            <span className="text-sm font-medium text-red-600">- {discountAmount.toLocaleString()} EGP</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{t("tax")}</span>
            <span className="text-sm font-medium">+ {taxAmount.toLocaleString()} EGP</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <span className="text-base font-bold text-gray-900">{t("total")}</span>
            <span className="text-lg font-bold text-indigo-600">{totalAmount.toLocaleString()} EGP</span>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">{t("notes")}</label>
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
            {orderToEdit ? t("save") : t("add_order")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};