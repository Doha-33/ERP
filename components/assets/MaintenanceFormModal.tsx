// src/components/modals/MaintenanceFormModal.tsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Edit2, Plus, Paperclip, Link as LinkIcon, X, Trash2, Eye } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, TextArea, Select, FileUpload } from "../../components/ui/Common";
import { Maintenance as MaintenanceType, Asset } from "../../types";
import { toast } from "sonner";

interface MaintenanceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMaintenance: MaintenanceType | null;
  assets: Asset[];
  onSave: (data: Partial<MaintenanceType>, attachments?: string[]) => Promise<void>;
}

export const MaintenanceFormModal: React.FC<MaintenanceFormModalProps> = ({
  isOpen,
  onClose,
  selectedMaintenance,
  assets,
  onSave,
}) => {
  const { t } = useTranslation();
  const [attachments, setAttachments] = useState<string[]>(selectedMaintenance?.attachments || []);
  const [isAddingAttachment, setIsAddingAttachment] = useState(false);
  const [attachmentType, setAttachmentType] = useState<'file' | 'link'>('link');
  const [attachmentUrl, setAttachmentUrl] = useState<string>("");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentName, setAttachmentName] = useState<string>("");
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  // Maintenance Type Options (from API error message)
  const maintenanceTypeOptions = [
    { value: "Preventive", label: t("preventive") },
    { value: "Corrective", label: t("corrective") },
    { value: "Repair", label: t("repair") },
    { value: "Service", label: t("service") },
  ];

  // Status Options (from API error message)
  const statusOptions = [
    { value: "Scheduled", label: t("scheduled") },
    { value: "In Progress", label: t("in_progress") },
    { value: "Completed", label: t("completed") },
    { value: "Cancelled", label: t("cancelled") },
  ];

  // Asset options for dropdown
  const assetOptions = assets.map(asset => ({
    value: asset._id || asset.id!,
    label: `${asset.assetName} - ${asset.serialNumber || asset.assetCode || ''}`,
  }));

  // Convert file to Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  };

  const handleAddAttachment = async () => {
    if (attachmentType === 'link') {
      if (!attachmentUrl.trim()) {
        toast.error(t("please_enter_url"));
        return;
      }
      
      let url = attachmentUrl.trim();
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      setAttachments([...attachments, url]);
      toast.success(t("attachment_added"));
      resetAttachmentForm();
    } else {
      if (!attachmentFile) {
        toast.error(t("please_select_file"));
        return;
      }
      
      setUploadingAttachment(true);
      toast.loading(t("uploading_attachment"));
      
      try {
        const base64 = await fileToBase64(attachmentFile);
        setAttachments([...attachments, base64]);
        toast.dismiss();
        toast.success(t("attachment_added"));
        resetAttachmentForm();
      } catch (error) {
        toast.dismiss();
        toast.error(t("failed_to_upload_attachment"));
      } finally {
        setUploadingAttachment(false);
      }
    }
  };

  const resetAttachmentForm = () => {
    setIsAddingAttachment(false);
    setAttachmentUrl("");
    setAttachmentFile(null);
    setAttachmentName("");
    setAttachmentType('link');
  };

  const handleRemoveAttachment = (index: number) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
    toast.success(t("attachment_removed"));
  };

  const handleFileSelect = (file: File | null) => {
    if (file) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error(t("file_too_large", { maxSize: "5MB" }));
        return;
      }
      setAttachmentFile(file);
      setAttachmentName(file.name);
    } else {
      setAttachmentFile(null);
      setAttachmentName("");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const processedData: Partial<MaintenanceType> = {
      assetId: data.assetId as string,
      maintenanceType: data.maintenanceType as string,
      scheduledDate: data.scheduledDate as string,
      technician: data.technician as string,
      cost: Number(data.cost),
      state: data.state as string,
      description: data.description as string,
    };

    await onSave(processedData, attachments);
  };

  const getFileIcon = (url: string) => {
    if (url.startsWith('data:')) {
      if (url.includes('application/pdf')) return '📄';
      if (url.includes('image/')) return '🖼️';
      if (url.includes('text/')) return '📝';
      return '📎';
    }
    
    const extension = url.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') return '📄';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) return '🖼️';
    if (extension === 'doc' || extension === 'docx') return '📝';
    if (extension === 'xls' || extension === 'xlsx') return '📊';
    return '🔗';
  };

  const isFileBase64 = (url: string) => {
    return url.startsWith('data:');
  };

  // Get assetId value for default
  const getDefaultAssetId = () => {
    if (!selectedMaintenance?.assetId) return "";
    if (typeof selectedMaintenance.assetId === 'object') {
      return (selectedMaintenance.assetId as any)._id;
    }
    return selectedMaintenance.assetId;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {selectedMaintenance ? <Edit2 size={20} /> : <Plus size={20} />}
          {selectedMaintenance ? t("edit_maintenance") : t("add_maintenance")}
        </div>
      }
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Asset Dropdown */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("asset")} <span className="text-red-500">*</span>
            </label>
            <Select
              name="assetId"
              defaultValue={getDefaultAssetId()}
              options={assetOptions}
              placeholder={t("select_asset")}
              required
              fullWidth
            />
          </div>

          {/* Maintenance Type Dropdown */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("maintenance_type")} <span className="text-red-500">*</span>
            </label>
            <Select
              name="maintenanceType"
              defaultValue={selectedMaintenance?.maintenanceType || ""}
              options={maintenanceTypeOptions}
              required
              fullWidth
            />
          </div>

          {/* Scheduled Date */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("scheduled_date")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="scheduledDate"
              type="date"
              defaultValue={
                selectedMaintenance?.scheduledDate
                  ? new Date(selectedMaintenance.scheduledDate)
                      .toISOString()
                      .split("T")[0]
                  : ""
              }
              required
              fullWidth
            />
          </div>

          {/* Technician */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("technician")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="technician"
              defaultValue={selectedMaintenance?.technician}
              required
              fullWidth
            />
          </div>

          {/* Cost */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("cost")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="cost"
              type="number"
              defaultValue={selectedMaintenance?.cost}
              required
              fullWidth
            />
          </div>

          {/* Status Dropdown */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("status")} <span className="text-red-500">*</span>
            </label>
            <Select
              name="state"
              defaultValue={selectedMaintenance?.state || ""}
              options={statusOptions}
              required
              fullWidth
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("description")} <span className="text-red-500">*</span>
          </label>
          <TextArea
            name="description"
            defaultValue={selectedMaintenance?.description}
            className="min-h-[120px]"
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
            {selectedMaintenance ? t("save") : t("add_maintenance")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Import Upload and Link icons at the top
import { Upload, Link } from "lucide-react";