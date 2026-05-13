import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Trash2, Package, DollarSign, Calendar, Building2, Users, Hash, FileText } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { PurchaseRequest } from "../../types";
import { useData } from "../../context/DataContext";

interface PurchaseRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<PurchaseRequest>) => Promise<void>;
  requestToEdit?: PurchaseRequest | null;
  isLoading?: boolean;
}

interface RequestItem {
  productId: string;
  itemName: string;
  requiredQuantity: number;
  estimatedUnitCost: number;
  totalCost: number;
}

export const PurchaseRequestModal: React.FC<PurchaseRequestModalProps> = ({
  isOpen,
  onClose,
  onSave,
  requestToEdit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const { departments, products, companies, branches, fetchDepartments } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    prNumber: "",
    requestDate: new Date().toISOString().split("T")[0],
    department: "",
    companyId: "",
    branchId: "",
    status: "PENDING",
    notes: "",
  });
  
  const [items, setItems] = useState<RequestItem[]>([
    { productId: "", itemName: "", requiredQuantity: 1, estimatedUnitCost: 0, totalCost: 0 }
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

  // Filter departments based on selected branch
  const filteredDepartments = useMemo(() => {
    if (!formData.branchId) return departments;
    // If departments have branchId reference, filter them
    return departments.filter(dept => {
      const deptBranchId = extractId((dept as any).branchId);
      return !deptBranchId || deptBranchId === formData.branchId;
    });
  }, [departments, formData.branchId, extractId]);

  useEffect(() => {
    if (requestToEdit && isOpen) {
      const companyId = extractId(requestToEdit.companyId);
      const branchId = extractId(requestToEdit.branchId);

      setFormData({
        prNumber: requestToEdit.prNumber || "",
        requestDate: requestToEdit.requestDate 
          ? new Date(requestToEdit.requestDate).toISOString().split("T")[0] 
          : new Date().toISOString().split("T")[0],
        department: requestToEdit.department || "",
        companyId: companyId || "",
        branchId: branchId || "",
        status: requestToEdit.status || "PENDING",
        notes: requestToEdit.notes || "",
      });
      
      if (requestToEdit.items && requestToEdit.items.length > 0) {
        setItems(requestToEdit.items.map(item => ({
          productId: extractId(item.productId),
          itemName: item.itemName,
          requiredQuantity: item.requiredQuantity,
          estimatedUnitCost: item.estimatedUnitCost,
          totalCost: item.totalCost || (item.requiredQuantity * item.estimatedUnitCost)
        })));
      }
    } else if (!requestToEdit && isOpen) {
      const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      setFormData({
        prNumber: `PR-${randomNum}`,
        requestDate: new Date().toISOString().split("T")[0],
        department: "",
        companyId: "",
        branchId: "",
        status: "PENDING",
        notes: "",
      });
      setItems([{ productId: "", itemName: "", requiredQuantity: 1, estimatedUnitCost: 0, totalCost: 0 }]);
    }
  }, [requestToEdit, isOpen, extractId]);

  const companyOptions = companies.map(c => ({ 
    value: extractId(c), 
    label: c.name 
  }));

  const branchOptions = filteredBranches.map(b => ({ 
    value: extractId(b), 
    label: b.name 
  }));

  const departmentOptions = filteredDepartments.map(d => ({ 
    value: (d as any).departmentName || d.name, 
    label: (d as any).departmentName || d.name 
  }));

  const productOptions = products.map(p => ({ 
    value: extractId(p), 
    label: `${p.productName} (${p.sku})` 
  }));

  const statusOptions = [
    { value: "PENDING", label: t("pending") },
    { value: "APPROVED", label: t("approved") },
    { value: "REJECTED", label: t("rejected") },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation
    if (!formData.prNumber) {
      toast.error(t("pr_number_required"));
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
    if (!formData.department) {
      toast.error(t("department_required"));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSave({
        ...formData,
        items: items.map(item => ({
          productId: item.productId,
          itemName: item.itemName,
          requiredQuantity: item.requiredQuantity,
          estimatedUnitCost: item.estimatedUnitCost,
          totalCost: item.totalCost
        })),
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
        branchId: "", // Reset branch
        department: "" // Reset department when company changes
      }));
    } 
    // Reset department when branch changes
    else if (field === "branchId") {
      setFormData(prev => ({ 
        ...prev, 
        branchId: value,
        department: "" // Reset department when branch changes
      }));
    }
    else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleItemChange = (index: number, field: keyof RequestItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // If product is selected, auto-fill item name
    if (field === "productId" && value) {
      const selectedProduct = products.find(p => extractId(p) === value);
      if (selectedProduct) {
        newItems[index].itemName = selectedProduct.productName;
      }
    }
    
    // Recalculate total
    if (field === "requiredQuantity" || field === "estimatedUnitCost") {
      newItems[index].totalCost = newItems[index].requiredQuantity * newItems[index].estimatedUnitCost;
    }
    
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { productId: "", itemName: "", requiredQuantity: 1, estimatedUnitCost: 0, totalCost: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const totalRequestValue = items.reduce((sum, item) => sum + item.totalCost, 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {requestToEdit ? <Edit2 size={20} /> : <Plus size={20} />}
          {requestToEdit ? t("edit_purchase_request") : t("add_purchase_request")}
        </div>
      }
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto px-2">
        {/* Request Information */}
        <div className="border-b border-gray-100 pb-4">
          <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText size={18} className="text-indigo-600" />
            {t("request_information")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
            <Input
              label={t("pr_number")}
              value={formData.prNumber}
              onChange={(e) => handleChange("prNumber", e.target.value)}
              placeholder="PR-001"
              required
              fullWidth
            />
            <Input
              label={t("request_date")}
              type="date"
              value={formData.requestDate}
              onChange={(e) => handleChange("requestDate", e.target.value)}
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
              label={t("department")}
              value={formData.department}
              onChange={(e) => handleChange("department", e.target.value)}
              options={departmentOptions}
              placeholder={formData.branchId ? t("select_department") : t("select_branch_first")}
              required
              fullWidth
              disabled={!formData.branchId}
            />
          </div>
        </div>

        {/* Request Items */}
        <div className="border-b border-gray-100 pb-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-semibold text-gray-900 flex items-center gap-2">
              <Package size={18} className="text-indigo-600" />
              {t("request_items")}
            </h3>
            <Button type="button" variant="secondary" onClick={addItem} size="sm">
              <Plus size={16} />
              {t("add_item")}
            </Button>
          </div>
          
          <div className="space-y-3">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-3 px-2 py-2 bg-gray-50 rounded-lg text-xs font-medium text-gray-500">
              <div className="col-span-4">{t("product_item")}</div>
              <div className="col-span-2">{t("quantity")}</div>
              <div className="col-span-2">{t("unit_cost")}</div>
              <div className="col-span-2">{t("total")}</div>
              <div className="col-span-2"></div>
            </div>
            
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end p-3 bg-gray-50 rounded-lg">
                <div className="md:col-span-4">
                  <Select
                    label={index === 0 ? t("product") : ""}
                    value={item.productId}
                    onChange={(e) => handleItemChange(index, "productId", e.target.value)}
                    options={productOptions}
                    placeholder={t("select_product")}
                    fullWidth
                  />
                  <Input
                    label={index === 0 ? t("item_name") : ""}
                    value={item.itemName}
                    onChange={(e) => handleItemChange(index, "itemName", e.target.value)}
                    placeholder={t("enter_item_name")}
                    required
                    fullWidth
                    className="mt-2"
                  />
                </div>
                <div className="md:col-span-2">
                  <Input
                    label={index === 0 ? t("quantity") : ""}
                    type="number"
                    value={item.requiredQuantity}
                    onChange={(e) => handleItemChange(index, "requiredQuantity", Number(e.target.value))}
                    min="1"
                    required
                    fullWidth
                  />
                </div>
                <div className="md:col-span-2">
                  <Input
                    label={index === 0 ? t("unit_cost") : ""}
                    type="number"
                    value={item.estimatedUnitCost}
                    onChange={(e) => handleItemChange(index, "estimatedUnitCost", Number(e.target.value))}
                    min="0"
                    required
                    fullWidth
                  />
                </div>
                <div className="md:col-span-2">
                  <div className="text-sm font-semibold text-indigo-600 mt-2 pt-2">
                    {item.totalCost.toLocaleString()} EGP
                  </div>
                </div>
                <div className="md:col-span-2 flex justify-end">
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
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex justify-between items-center">
            <span className="text-base font-semibold text-gray-900">{t("total_request_value")}</span>
            <span className="text-xl font-bold text-indigo-600">{totalRequestValue.toLocaleString()} EGP</span>
          </div>
        </div>

        {/* Notes & Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <TextArea
            label={t("notes")}
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder={t("enter_notes")}
            rows={3}
            fullWidth
          />
          {requestToEdit && (
            <Select
              label={t("status")}
              value={formData.status}
              onChange={(e) => handleChange("status", e.target.value)}
              options={statusOptions}
              required
              fullWidth
            />
          )}
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
            {requestToEdit ? t("save") : t("add_purchase_request")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Add missing import
import { toast } from "sonner";