import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Building2, MapPin, User, Phone, Hash, Layers } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select } from "../../components/ui/Common";
import { Warehouse } from "../../types";
import { useData } from "../../context/DataContext";

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
  const { companies, branches } = useData();
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

  useEffect(() => {
    if (warehouseToEdit && isOpen) {
      const companyId = typeof warehouseToEdit.companyId === "object" 
        ? (warehouseToEdit.companyId as any)?._id 
        : warehouseToEdit.companyId;
      const branchId = typeof warehouseToEdit.branchId === "object" 
        ? (warehouseToEdit.branchId as any)?._id 
        : warehouseToEdit.branchId;

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
  }, [warehouseToEdit, isOpen]);

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
    value: c._id || c.id, 
    label: c.name 
  }));

  const branchOptions = branches.map(b => ({ 
    value: b._id || b.id, 
    label: b.name 
  }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSave(formData);
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
            <Input
              value={formData.code}
              onChange={(e) => handleChange("code", e.target.value)}
              placeholder="WH-001"
              required
              fullWidth
            />
          </div>

          {/* Warehouse Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("warehouse_name")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.warehouseName}
              onChange={(e) => handleChange("warehouseName", e.target.value)}
              placeholder={t("enter_warehouse_name")}
              required
              fullWidth
            />
          </div>

          {/* Type */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("type")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.type}
              onChange={(e) => handleChange("type", e.target.value)}
              options={typeOptions}
              required
              fullWidth
            />
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

          {/* Branch */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("branch")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.branchId}
              onChange={(e) => handleChange("branchId", e.target.value)}
              options={branchOptions}
              placeholder={t("select_branch")}
              required
              fullWidth
            />
          </div>

          {/* Manager Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("manager")}
            </label>
            <Input
              value={formData.managerName}
              onChange={(e) => handleChange("managerName", e.target.value)}
              placeholder={t("enter_manager_name")}
              fullWidth
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("phone_number")}
            </label>
            <Input
              value={formData.phoneNumber}
              onChange={(e) => handleChange("phoneNumber", e.target.value)}
              placeholder="+20123456789"
              fullWidth
            />
          </div>

          {/* Location */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("location")}
            </label>
            <Input
              value={formData.location}
              onChange={(e) => handleChange("location", e.target.value)}
              placeholder={t("enter_location")}
              fullWidth
            />
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
            {warehouseToEdit ? t("save") : t("add_warehouse")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};