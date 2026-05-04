import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Package, X, Calendar, DollarSign, Percent } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { Quotation } from "../../types";
import { useData } from "../../context/DataContext";

interface QuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Quotation>) => Promise<void>;
  quotationToEdit?: Quotation | null;
  isLoading?: boolean;
}

interface QuotationItem {
  productId: string;
  productName: string;
  qty: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
}

export const QuotationModal: React.FC<QuotationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  quotationToEdit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const { customers, products } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    quotationNo: "",
    customerId: "",
    quotationDate: new Date().toISOString().split("T")[0],
    expirationDate: "",
    notes: "",
    termsAndConditions: "",
    status: "DRAFT",
  });
  
  const [items, setItems] = useState<QuotationItem[]>([
    { productId: "", productName: "", qty: 1, unitPrice: 0, discount: 0, tax: 0, total: 0 }
  ]);

  const subtotal = items.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);
  const discountAmount = items.reduce((sum, item) => sum + (item.discount || 0), 0);
  const taxAmount = items.reduce((sum, item) => sum + (item.tax || 0), 0);
  const totalAmount = items.reduce((sum, item) => sum + (item.total || 0), 0);

  useEffect(() => {
    if (quotationToEdit && isOpen) {
      const customerId = typeof quotationToEdit.customerId === "object" 
        ? (quotationToEdit.customerId as any)._id 
        : quotationToEdit.customerId;
      
      setFormData({
        quotationNo: quotationToEdit.quotationNo || "",
        customerId: customerId || "",
        quotationDate: quotationToEdit.quotationDate ? new Date(quotationToEdit.quotationDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        expirationDate: quotationToEdit.expirationDate ? new Date(quotationToEdit.expirationDate).toISOString().split("T")[0] : "",
        notes: quotationToEdit.notes || "",
        termsAndConditions: quotationToEdit.termsAndConditions || "",
        status: quotationToEdit.status || "DRAFT",
      });
      
      if (quotationToEdit.items && quotationToEdit.items.length > 0) {
        setItems(quotationToEdit.items.map(item => ({
          productId: typeof item.productId === "object" ? (item.productId as any)._id : item.productId,
          productName: item.productName || "",
          qty: item.qty,
          unitPrice: item.unitPrice,
          discount: item.discount || 0,
          tax: item.tax || 0,
          total: item.total || ((item.qty * item.unitPrice) - (item.discount || 0) + (item.tax || 0))
        })));
      }
    } else if (!quotationToEdit && isOpen) {
      setFormData({
        quotationNo: `QT-${Date.now()}`,
        customerId: "",
        quotationDate: new Date().toISOString().split("T")[0],
        expirationDate: "",
        notes: "",
        termsAndConditions: "",
        status: "DRAFT",
      });
      setItems([{ productId: "", productName: "", qty: 1, unitPrice: 0, discount: 0, tax: 0, total: 0 }]);
    }
  }, [quotationToEdit, isOpen]);

  const customerOptions = customers.map(c => ({ value: c._id || c.id, label: c.customerName }));
  const productOptions = products.map(p => ({ value: p._id || p.id, label: `${p.productName} (${p.sku})` }));

  const statusOptions = [
    { value: "DRAFT", label: t("draft") },
    { value: "SENT", label: t("sent") },
    { value: "EXPIRED", label: t("expired") },
  ];

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index: number, field: keyof QuotationItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Update product name if product is selected
    if (field === "productId") {
      const selectedProduct = products.find(p => (p._id || p.id) === value);
      if (selectedProduct) {
        newItems[index].productName = selectedProduct.productName;
        newItems[index].unitPrice = selectedProduct.salesPrice || 0;
      }
    }
    
    // Recalculate total
    const item = newItems[index];
    newItems[index].total = (item.qty * item.unitPrice) - item.discount + item.tax;
    
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { productId: "", productName: "", qty: 1, unitPrice: 0, discount: 0, tax: 0, total: 0 }]);
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
        productName: item.productName,
        qty: item.qty,
        unitPrice: item.unitPrice,
        discount: item.discount,
        tax: item.tax,
        total: item.total
      })),
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount,
      quotationDate: new Date(formData.quotationDate).toISOString(),
      expirationDate: formData.expirationDate ? new Date(formData.expirationDate).toISOString() : null,
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
          {quotationToEdit ? <Edit2 size={20} /> : <Plus size={20} />}
          {quotationToEdit ? t("edit_quotation") : t("add_quotation")}
        </div>
      }
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto px-2">
        {/* Quotation Information */}
        <div className="border-b border-gray-100 pb-4">
          <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText size={18} className="text-indigo-600" />
            {t("quotation_information")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
            <Input
              label={t("quotation_no")}
              value={formData.quotationNo}
              onChange={(e) => handleChange("quotationNo", e.target.value)}
              placeholder="QT-001"
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
            <Input
              label={t("quotation_date")}
              type="date"
              value={formData.quotationDate}
              onChange={(e) => handleChange("quotationDate", e.target.value)}
              required
              fullWidth
            />
            <Input
              label={t("expiration_date")}
              type="date"
              value={formData.expirationDate}
              onChange={(e) => handleChange("expirationDate", e.target.value)}
              fullWidth
            />
            <Select
              label={t("status")}
              value={formData.status}
              onChange={(e) => handleChange("status", e.target.value)}
              options={statusOptions}
              required
              fullWidth
            />
          </div>
        </div>

        {/* Quotation Items */}
        <div className="border-b border-gray-100 pb-4">
          <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package size={18} className="text-indigo-600" />
            {t("quotation_items")}
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
                    value={item.qty}
                    onChange={(e) => handleItemChange(index, "qty", Number(e.target.value))}
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
                    {(item.qty * item.unitPrice).toLocaleString()} EGP
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

        {/* Quotation Summary */}
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

        {/* Additional Information */}
        <div className="space-y-3">
          <TextArea
            label={t("notes")}
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder={t("enter_notes")}
            rows={2}
            fullWidth
          />
          <TextArea
            label={t("terms_and_conditions")}
            value={formData.termsAndConditions}
            onChange={(e) => handleChange("termsAndConditions", e.target.value)}
            placeholder={t("enter_terms")}
            rows={2}
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
            {quotationToEdit ? t("save") : t("add_quotation")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Add this import at the top
import { FileText } from "lucide-react";