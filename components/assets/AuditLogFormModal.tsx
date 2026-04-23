// src/components/assets/AuditLogFormModal.tsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Edit2, Plus, History, Paperclip, Link as LinkIcon, X, Trash2, Eye, Upload, Link } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea, FileUpload } from "../../components/ui/Common";
import { AuditLog as AuditLogType, Asset } from "../../types";
import { toast } from "sonner";

interface AuditLogFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAuditLog: AuditLogType | null;
  assets: Asset[];
  onSave: (data: Partial<AuditLogType>, attachments?: string[]) => Promise<void>;
}

export const AuditLogFormModal: React.FC<AuditLogFormModalProps> = ({
  isOpen,
  onClose,
  selectedAuditLog,
  assets,
  onSave,
}) => {
  const { t } = useTranslation();

  // Asset options for dropdown
  const assetOptions = assets.map(asset => ({
    value: asset._id || asset.id!,
    label: `${asset.assetName} - ${asset.serialNumber || asset.assetCode || ''}`,
  }));

  // Action Type Options
  const actionTypeOptions = [
    { value: "Create", label: t("action_create") },
    { value: "Update", label: t("action_update") },
    { value: "Delete", label: t("action_delete") },
    { value: "Transfer", label: t("action_transfer") },
    { value: "Maintenance", label: t("action_maintenance") },
    { value: "Disposal", label: t("action_disposal") },
    { value: "Allocation", label: t("action_allocation") },
    { value: "Status Change", label: t("action_status_change") },
  ];

  // Convert file to Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  };

  const isFileBase64 = (url: string) => {
    return url.startsWith('data:');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const processedData: Partial<AuditLogType> = {
      assetId: data.assetId as string,
      actionType: data.actionType as string,
      byWho: data.byWho as string,
      date: data.date as string,
      changeDescription: data.changeDescription as string,
    };

    await onSave(processedData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {selectedAuditLog ? <Edit2 size={20} /> : <Plus size={20} />}
          {selectedAuditLog ? t("edit_audit_log") : t("add_audit_log")}
        </div>
      }
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Asset Dropdown */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("asset")} <span className="text-red-500">*</span>
            </label>
            <Select
              name="assetId"
              defaultValue={
                typeof selectedAuditLog?.assetId === "object"
                  ? (selectedAuditLog.assetId as any)._id
                  : selectedAuditLog?.assetId || ""
              }
              options={assetOptions}
              placeholder={t("select_asset")}
              required
              fullWidth
            />
          </div>

          {/* Action Type Dropdown */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("action_type")} <span className="text-red-500">*</span>
            </label>
            <Select
              name="actionType"
              defaultValue={selectedAuditLog?.actionType || ""}
              options={actionTypeOptions}
              placeholder={t("select_action_type")}
              required
              fullWidth
            />
          </div>

          {/* By Who */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("by_who")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="byWho"
              defaultValue={selectedAuditLog?.byWho}
              placeholder={t("enter_person_name")}
              required
              fullWidth
            />
          </div>

          {/* Date */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("date")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="date"
              type="date"
              defaultValue={
                selectedAuditLog?.date
                  ? new Date(selectedAuditLog.date)
                      .toISOString()
                      .split("T")[0]
                  : new Date().toISOString().split("T")[0]
              }
              required
              fullWidth
            />
          </div>
        </div>

        {/* Change Description */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            {t("change_description")} <span className="text-red-500">*</span>
          </label>
          <TextArea
            name="changeDescription"
            defaultValue={selectedAuditLog?.changeDescription}
            placeholder={t("enter_change_description")}
            className="min-h-[100px]"
            required
            fullWidth
          />
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <Button variant="secondary" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button
            variant="primary"
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 px-8"
          >
            {selectedAuditLog ? t("save") : t("add_audit_log")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};