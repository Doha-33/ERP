import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Building2, MapPin, User, Phone, Hash, Layers } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select } from "../../components/ui/Common";
import { Warehouse } from "../../types";
import { useData } from "../../context/DataContext";
import { toast } from "sonner";

interface WarehouseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Warehouse>) => Promise<void>;
  warehouseToEdit?: Warehouse | null;
  isLoading?: boolean;
}

export const WarehouseModal: React.FC<WarehouseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  warehouseToEdit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const { companies, branches, fetchCompanies, fetchBranches } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    warehouseName: "",
    type: "MAIN_WAREHOUSE",
    companyId: "",
    branchId: "",
    managerName: "",
    phoneNumber: "",
    location: "",
    state: "ACTIVE",
  });

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

  useEffect(() => {
    if (warehouseToEdit && isOpen) {
      const companyId = extractId(warehouseToEdit.companyId);
      const branchId = extractId(warehouseToEdit.branchId);

      setFormData({
        code: warehouseToEdit.code || "",
        warehouseName: warehouseToEdit.warehouseName || "",
        type: warehouseToEdit.type || "MAIN_WAREHOUSE",
        companyId: companyId || "",
        branchId: branchId || "",
        managerName: warehouseToEdit.managerName || "",
        phoneNumber: warehouseToEdit.phoneNumber || "",
        location: warehouseToEdit.location || "",
        state: warehouseToEdit.state || "ACTIVE",
      });
    } else if (!warehouseToEdit && isOpen) {
      setFormData({
        code: "",
        warehouseName: "",
        type: "MAIN_WAREHOUSE",
        companyId: "",
        branchId: "",
        managerName: "",
        phoneNumber: "",
        location: "",
        state: "ACTIVE",
      });
    }
  }, [warehouseToEdit, isOpen, extractId]);

  const typeOptions = [
    { value: "MAIN_WAREHOUSE", label: t("main_warehouse") },
    { value: "SUB_WAREHOUSE", label: t("sub_warehouse") },
    { value: "STORE", label: t("store") },
    { value: "DISTRIBUTION_CENTER", label: t("distribution_center") },
    { value: "COLD_STORAGE", label: t("cold_storage") },
    { value: "RAW_MATERIALS", label: t("raw_materials") },
    { value: "FINISHED_GOODS", label: t("finished_goods") },
  ];

  const statusOptions = [
    { value: "ACTIVE", label: t("active") },
    { value: "INACTIVE", label: t("inactive") },
  ];

  const companyOptions = companies.map(c => ({ 
    value: extractId(c), 
    label: c.name 
  }));

  const branchOptions = filteredBranches.map(b => ({ 
    value: extractId(b), 
    label: b.name 
  }));

  // Generate warehouse code automatically
  const generateWarehouseCode = useCallback(() => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `WH-${timestamp}-${random}`;
  }, []);

  // Auto-generate code when creating new
  useEffect(() => {
    if (!warehouseToEdit && isOpen && !formData.code) {
      setFormData(prev => ({ ...prev, code: generateWarehouseCode() }));
    }
  }, [warehouseToEdit, isOpen, generateWarehouseCode, formData.code]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation
    if (!formData.code.trim()) {
      toast.error(t("warehouse_code_required"));
      return;
    }
    if (!formData.warehouseName.trim()) {
      toast.error(t("warehouse_name_required"));
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
        code: formData.code,
        warehouseName: formData.warehouseName,
        type: formData.type,
        companyId: formData.companyId,
        branchId: formData.branchId,
        managerName: formData.managerName || undefined,
        phoneNumber: formData.phoneNumber || undefined,
        location: formData.location || undefined,
        state: formData.state,
      };
      
      console.log("Saving warehouse:", saveData);
      await onSave(saveData);
      onClose();
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error(t("failed_to_save_warehouse"));
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {warehouseToEdit ? <Edit2 size={20} /> : <Plus size={20} />}
          {warehouseToEdit ? t("edit_warehouse") : t("add_warehouse")}
        </div>
      }
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Warehouse Code */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("warehouse_code")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Hash size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={formData.code}
                onChange={(e) => handleChange("code", e.target.value)}
                placeholder="WH-001"
                required
                fullWidth
                className="pl-10"
                disabled={!!warehouseToEdit}
              />
            </div>
          </div>

          {/* Warehouse Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("warehouse_name")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building2 size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={formData.warehouseName}
                onChange={(e) => handleChange("warehouseName", e.target.value)}
                placeholder={t("enter_warehouse_name")}
                required
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Type */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("type")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Layers size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Select
                value={formData.type}
                onChange={(e) => handleChange("type", e.target.value)}
                options={typeOptions}
                required
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Company */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("company")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.companyId}
              onChange={(e) => handleChange("companyId", e.target.value)}
              options={companyOptions}
              placeholder={t("select_company")}
              required
              fullWidth
            />
          </div>

          {/* Branch - Filtered by selected company */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("branch")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.branchId}
              onChange={(e) => handleChange("branchId", e.target.value)}
              options={branchOptions}
              placeholder={formData.companyId ? t("select_branch") : t("select_company_first")}
              required
              fullWidth
              disabled={!formData.companyId}
            />
            {formData.companyId && branchOptions.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                {t("no_branches_available_for_this_company")}
              </p>
            )}
          </div>

          {/* Manager Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("manager")}
            </label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={formData.managerName}
                onChange={(e) => handleChange("managerName", e.target.value)}
                placeholder={t("enter_manager_name")}
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("phone_number")}
            </label>
            <div className="relative">
              <Phone size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={formData.phoneNumber}
                onChange={(e) => handleChange("phoneNumber", e.target.value)}
                placeholder="+20123456789"
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("location")}
            </label>
            <div className="relative">
              <MapPin size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                placeholder={t("enter_location")}
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("status")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.state}
              onChange={(e) => handleChange("state", e.target.value)}
              options={statusOptions}
              required
              fullWidth
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
          <Button 
            variant="secondary" 
            onClick={onClose} 
            disabled={isSubmitting || isLoading}
            type="button"
          >
            {t("cancel")}
          </Button>
          <Button
            variant="primary"
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 px-8"
            isLoading={isSubmitting || isLoading}
            disabled={isSubmitting || isLoading}
          >
            {warehouseToEdit ? t("update_warehouse") : t("add_warehouse")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};