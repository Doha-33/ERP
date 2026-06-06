import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation }from "react-i18next";
import { Plus, Edit2, Trash2, Coins, Percent, Landmark } from "lucide-react";
import { Card, Button, Input, Select } from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { Modal } from "../../components/ui/Modal";
import { useCRM } from "../../context/crm/CRMContext";
import financeService from "../../services/finance.service";
import { CRMPricelist, Currency } from "../../types";
import { toast } from "sonner";

export const PricelistsTab: React.FC = () => {
  const { t } = useTranslation();
  const { pricelists, loading, addPricelist, updatePricelist, deletePricelist } = useCRM();

  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPricelist, setEditingPricelist] = useState<CRMPricelist | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    nameEn: "",
    currencyId: "",
    discountPercentage: 0,
  });

  // Helper function to extract ID from object or string
  const extractId = useCallback((value: any): string => {
    if (!value) return "";
    if (typeof value === "object") {
      return value._id || value.id || "";
    }
    return value;
  }, []);

  // Helper function to extract currency ID
  const extractCurrencyId = useCallback((currency: any): string => {
    if (!currency) return "";
    if (typeof currency === "object") {
      return currency._id || currency.id || "";
    }
    return currency;
  }, []);

  // Fetch currencies on mount
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const data = await financeService.getCurrencies();
        setCurrencies(data || []);
        if (data && data.length > 0) {
          const baseCurrency = data.find(c => c.isBaseCurrency) || data[0];
          setFormData(prev => ({
            ...prev,
            currencyId: extractId(baseCurrency)
          }));
        }
      } catch (err) {
        console.error("Failed to load currencies", err);
      }
    };
    fetchCurrencies();
  }, []);

  const handleOpenCreate = () => {
    setEditingPricelist(null);
    const firstCurrencyId = currencies.length > 0 ? extractId(currencies[0]) : "";
    setFormData({
      name: "",
      nameEn: "",
      currencyId: firstCurrencyId,
      discountPercentage: 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pricelist: CRMPricelist) => {
    setEditingPricelist(pricelist);
    setFormData({
      name: pricelist.name || "",
      nameEn: pricelist.nameEn || "",
      currencyId: extractCurrencyId(pricelist.currencyId),
      discountPercentage: pricelist.discountPercentage || 0,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error(t("pricelist_name_required") || "Price List Name is required");
      return;
    }
    if (!formData.currencyId) {
      toast.error(t("currency_selection_required") || "Currency selection is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const data: Partial<CRMPricelist> = {
        name: formData.name,
        nameEn: formData.nameEn,
        currencyId: formData.currencyId,
        discountPercentage: Number(formData.discountPercentage) || 0,
      };

      if (editingPricelist) {
        await updatePricelist(extractId(editingPricelist), data);
        toast.success(t("pricelist_updated_successfully") || "Price list updated successfully");
      } else {
        await addPricelist(data);
        toast.success(t("pricelist_created_successfully") || "Price list created successfully");
      }
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Error saving pricelist:", error);
      toast.error(error.message || t("failed_to_save_pricelist") || "Failed to save price list");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePricelist(deleteId);
      toast.success(t("pricelist_deleted_successfully") || "Price list deleted successfully");
      setDeleteId(null);
    } catch (error: any) {
      console.error("Error deleting pricelist:", error);
      toast.error(error.message || t("failed_to_delete_pricelist") || "Failed to delete price list");
    }
  };

  // Safe function to get currency display - handles both string ID and object
  const getCurrencyDisplay = useCallback((currencyId: any): string => {
    if (!currencyId) return "-";
    
    // If currencyId is an object with name and code
    if (typeof currencyId === "object" && currencyId !== null) {
      return `${currencyId.name || ""} (${currencyId.code || ""})`;
    }
    
    // If it's a string ID, find from currencies array
    const id = typeof currencyId === "string" ? currencyId : extractId(currencyId);
    const currency = currencies.find(c => extractId(c) === id);
    
    if (currency) {
      return `${currency.name} (${currency.code})`;
    }
    
    return id || "-";
  }, [currencies, extractId]);

  const currencyOptions = useMemo(() => {
    return currencies.map(c => ({
      value: extractId(c),
      label: `${c.name} (${c.code})`
    }));
  }, [currencies, extractId]);

  const columns: Column<CRMPricelist>[] = useMemo(
    () => [
      {
        header: t("pricelist_name") || "Price List Name / اسم لقائمة",
        render: (p) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Coins size={18} className="text-amber-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900">{p.name}</span>
              {p.nameEn && <span className="text-xs text-gray-500">{p.nameEn}</span>}
            </div>
          </div>
        ),
      },
      {
        header: t("currency") || "Currency / العملة",
        render: (p) => {
          const displayValue = getCurrencyDisplay(p.currencyId);
          return (
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <Landmark size={14} className="text-gray-400" />
              <span>{displayValue}</span>
            </div>
          );
        },
      },
      {
        header: t("discount_percentage") || "Discount / نسبة الخصم",
        render: (p) => (
          <div className="flex items-center gap-1 font-medium text-emerald-600">
            <Percent size={14} />
            <span>{p.discountPercentage}%</span>
          </div>
        ),
      },
      {
        header: t("actions") || "Actions / إجراءات",
        className: "text-center",
        render: (p) => (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleOpenEdit(p)}
              className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
              title={t("edit") || "Edit"}
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => setDeleteId(extractId(p))}
              className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg border border-gray-200 transition-colors"
              title={t("delete") || "Delete"}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ),
      },
    ],
    [t, extractId, getCurrencyDisplay]
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{t("manage_crm_pricelists") || "Price Lists / قوائم الأسعار"}</h2>
          <p className="text-sm text-gray-500 mt-1">
            {t("manage_customer_pricelists_description") || "Set customized price rules with multi-currency support."}
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleOpenCreate}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus size={18} />
          {t("add_pricelist") || "Add Price List"}
        </Button>
      </div>

      <Table
        data={pricelists}
        columns={columns}
        keyExtractor={extractId}
        emptyMessage={t("no_pricelists_found") || "No price lists created yet"}
        isLoading={loading}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          <div className="flex items-center gap-2">
            {editingPricelist ? <Edit2 size={20} /> : <Plus size={20} />}
            {editingPricelist ? (t("edit_pricelist") || "Edit Price List") : (t("add_pricelist") || "Add Price List")}
          </div>
        }
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("pricelist_name_ar") || "Price List Name (Arabic) / الاسم بالعربية"} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="مثال: قائمة التجار"
              required
              fullWidth
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("pricelist_name_en") || "Price List Name (English) / الاسم بالإنجليزية"}
            </label>
            <Input
              value={formData.nameEn}
              onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
              placeholder="e.g. Distributor Pricelist"
              fullWidth
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("currency") || "Currency / العملة"} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.currencyId}
              onChange={(e) => setFormData({ ...formData, currencyId: e.target.value })}
              options={currencyOptions}
              required
              fullWidth
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("discount_percentage") || "Discount Percentage / نسبة الخصم (%)"}
            </label>
            <div className="relative">
              <Percent size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.discountPercentage || ""}
                onChange={(e) => setFormData({ ...formData, discountPercentage: parseFloat(e.target.value) || 0 })}
                placeholder="20"
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              type="button"
            >
              {t("cancel") || "Cancel"}
            </Button>
            <Button
              variant="primary"
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              {editingPricelist ? (t("update") || "Update") : (t("create") || "Create")}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title={t("delete_pricelist_title") || "Delete Price List"}
        message={t("delete_pricelist_message") || "Are you sure you want to delete this price list? This action cannot be undone."}
      />
    </div>
  );
};