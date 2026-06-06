import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Trash2, Users, Percent, FileText } from "lucide-react";
import { Card, Button, Input, TextArea } from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { Modal } from "../../components/ui/Modal";
import { useCRM } from "../../context/crm/CRMContext";
import { CRMGroup } from "../../types";
import { toast } from "sonner";

export const GroupsTab: React.FC = () => {
  const { t } = useTranslation();
  const { groups, loading, addGroup, updateGroup, deleteGroup } = useCRM();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CRMGroup | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    nameEn: "",
    description: "",
    discountPercentage: 0,
  });

  const extractId = useCallback((value: any): string => {
    if (!value) return "";
    return value._id || value.id || "";
  }, []);

  const handleOpenCreate = () => {
    setEditingGroup(null);
    setFormData({
      name: "",
      nameEn: "",
      description: "",
      discountPercentage: 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (group: CRMGroup) => {
    setEditingGroup(group);
    setFormData({
      name: group.name || "",
      nameEn: group.nameEn || "",
      description: group.description || "",
      discountPercentage: group.discountPercentage || 0,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error(t("group_name_required") || "Group Name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const data: Partial<CRMGroup> = {
        name: formData.name,
        nameEn: formData.nameEn,
        description: formData.description,
        discountPercentage: Number(formData.discountPercentage) || 0,
      };

      if (editingGroup) {
        await updateGroup(extractId(editingGroup), data);
        toast.success(t("group_updated_successfully") || "Group updated successfully");
      } else {
        await addGroup(data);
        toast.success(t("group_created_successfully") || "Group created successfully");
      }
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Error saving group:", error);
      toast.error(error.message || t("failed_to_save_group") || "Failed to save group");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteGroup(deleteId);
      toast.success(t("group_deleted_successfully") || "Group deleted successfully");
      setDeleteId(null);
    } catch (error: any) {
      console.error("Error deleting group:", error);
      toast.error(error.message || t("failed_to_delete_group") || "Failed to delete group");
    }
  };

  const columns: Column<CRMGroup>[] = useMemo(
    () => [
      {
        header: t("group_name") || "Group Name / اسم المجموعة",
        render: (g) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <Users size={18} className="text-indigo-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900">{g.name}</span>
              {g.nameEn && <span className="text-xs text-gray-500">{g.nameEn}</span>}
            </div>
          </div>
        ),
      },
      {
        header: t("description") || "Description / الوصف",
        render: (g) => <span className="text-sm text-gray-600">{g.description || "-"}</span>,
      },
      {
        header: t("discount_percentage") || "Discount / نسبة الخصم",
        render: (g) => (
          <div className="flex items-center gap-1 font-medium text-emerald-600">
            <Percent size={14} />
            <span>{g.discountPercentage}%</span>
          </div>
        ),
      },
      {
        header: t("actions") || "Actions / إجراءات",
        className: "text-center",
        render: (g) => (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleOpenEdit(g)}
              className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
              title={t("edit") || "Edit"}
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => setDeleteId(extractId(g))}
              className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg border border-gray-200 transition-colors"
              title={t("delete") || "Delete"}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ),
      },
    ],
    [t, extractId]
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{t("manage_crm_groups") || "Customer Groups / مجموعات العملاء"}</h2>
          <p className="text-sm text-gray-500 mt-1">
            {t("manage_customer_discounts_description") || "Define customer categories and assign discount rates."}
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleOpenCreate}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus size={18} />
          {t("add_group") || "Add Group"}
        </Button>
      </div>

      <Table
        data={groups}
        columns={columns}
        keyExtractor={extractId}
        emptyMessage={t("no_groups_found") || "No customer groups created yet"}
        isLoading={loading}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          <div className="flex items-center gap-2">
            {editingGroup ? <Edit2 size={20} /> : <Plus size={20} />}
            {editingGroup ? (t("edit_group") || "Edit Group") : (t("add_group") || "Add Group")}
          </div>
        }
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("group_name_ar") || "Group Name (Arabic) / الاسم بالعربية"} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="مثال: الموزعين"
              required
              fullWidth
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("group_name_en") || "Group Name (English) / الاسم بالإنجليزية"}
            </label>
            <Input
              value={formData.nameEn}
              onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
              placeholder="e.g. Distributors"
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
                placeholder="12.5"
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              <FileText size={14} className="inline mr-1" />
              {t("description") || "Description / الوصف"}
            </label>
            <TextArea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t("enter_description") || "Enter description"}
              rows={3}
              fullWidth
            />
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
              {editingGroup ? (t("update") || "Update") : (t("create") || "Create")}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title={t("delete_group_title") || "Delete Customer Group"}
        message={t("delete_group_message") || "Are you sure you want to delete this customer group? This action cannot be undone."}
      />
    </div>
  );
};
