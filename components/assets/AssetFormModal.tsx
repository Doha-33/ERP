// src/components/modals/AssetFormModal.tsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Edit2, Plus, X, FileText, Paperclip, Link as LinkIcon } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, TextArea, Select, FileUpload } from "../../components/ui/Common";
import { Asset } from "../../types";
import { toast } from "sonner";

interface AssetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAsset: Asset | null;
  onSave: (data: Partial<Asset>, imageBase64?: string, attachments?: string[]) => Promise<void>;
}

export const AssetFormModal: React.FC<AssetFormModalProps> = ({
  isOpen,
  onClose,
  selectedAsset,
  onSave,
}) => {
  const { t } = useTranslation();
  const [isImageCompressing, setIsImageCompressing] = useState(false);
  const [imageBase64, setImageBase64] = useState<string>(selectedAsset?.image || "");
  const [attachments, setAttachments] = useState<string[]>(selectedAsset?.attachments || []);
  const [newAttachmentUrl, setNewAttachmentUrl] = useState<string>("");
  const [isAddingAttachment, setIsAddingAttachment] = useState(false);

  // Compress image function
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          const maxWidth = 800;
          const maxHeight = 800;

          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.6);
          resolve(compressedBase64);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleImageUpload = async (file: File | null) => {
    if (file) {
      setIsImageCompressing(true);
      toast.loading(t("compressing_image"));

      try {
        const compressedImage = await compressImage(file);
        setImageBase64(compressedImage);
        toast.dismiss();
        toast.success(t("image_uploaded_successfully"));
      } catch (error) {
        toast.dismiss();
        toast.error(t("failed_to_compress_image"));
      } finally {
        setIsImageCompressing(false);
      }
    } else {
      setImageBase64("");
    }
  };

  const handleAddAttachment = () => {
    if (newAttachmentUrl.trim()) {
      let url = newAttachmentUrl.trim();
      // Add https:// if no protocol is specified
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      setAttachments([...attachments, url]);
      setNewAttachmentUrl("");
      setIsAddingAttachment(false);
      toast.success(t("attachment_added"));
    }
  };

  const handleRemoveAttachment = (index: number) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
    toast.success(t("attachment_removed"));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const processedData: Partial<Asset> = {
      assetName: data.assetName as string,
      model: data.model as string,
      serialNumber: data.serialNumber as string,
      brand: data.brand as string,
      warrantyPeriod: Number(data.warrantyPeriod),
      warrantyEndDate: data.warrantyEndDate as string,
      warrantyNumber: data.warrantyNumber as string,
      barcode: data.barcode as string,
      category: data.category as string,
      location: data.location as string,
      cost: Number(data.cost),
      purchaseDate: data.purchaseDate as string,
      assignedTo: data.assignedTo as string,
      state: data.state as string,
      notes: data.notes as string,
    };

    // Send image and attachments separately
    await onSave(processedData, imageBase64, attachments);
  };

  // Form options
  const formCategoryOptions = [
    { value: "IT Equipment", label: t("it_equipment") },
    { value: "Furniture", label: t("furniture") },
    { value: "Vehicle", label: t("vehicle") },
    { value: "Machinery", label: t("machinery") },
  ];

  const formStatusOptions = [
    { value: "Present", label: t("present") },
    { value: "Active", label: t("active") },
    { value: "In Maintenance", label: t("in_maintenance") },
    { value: "Retired", label: t("retired") },
    { value: "Lost", label: t("lost") },
    { value: "Scrap", label: t("scrap") },
  ];

  const getFileIcon = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') return '📄';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) return '🖼️';
    if (extension === 'doc' || extension === 'docx') return '📝';
    if (extension === 'xls' || extension === 'xlsx') return '📊';
    return '🔗';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {selectedAsset ? <Edit2 size={20} /> : <Plus size={20} />}
          {selectedAsset ? t("edit_asset_register") : t("add_asset_register")}
        </div>
      }
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Asset Image Upload */}
          <div className="md:col-span-2">
            <FileUpload
              label={t("asset_image")}
              accept="image/*"
              onChange={handleImageUpload}
            />
            {imageBase64 && (
              <div className="mt-2">
                <img
                  src={imageBase64}
                  alt="Preview"
                  className="w-20 h-20 rounded object-cover border"
                />
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("asset_name")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="assetName"
              defaultValue={selectedAsset?.assetName}
              required
              fullWidth
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("model")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="model"
              defaultValue={selectedAsset?.model}
              required
              fullWidth
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("serial_number")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="serialNumber"
              defaultValue={selectedAsset?.serialNumber}
              required
              fullWidth
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("brand")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="brand"
              defaultValue={selectedAsset?.brand}
              required
              fullWidth
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("warranty_period")} ({t("months")}){" "}
              <span className="text-red-500">*</span>
            </label>
            <Input
              name="warrantyPeriod"
              type="number"
              defaultValue={selectedAsset?.warrantyPeriod}
              required
              fullWidth
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("warranty_end_date")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="warrantyEndDate"
              type="date"
              defaultValue={
                selectedAsset?.warrantyEndDate
                  ? new Date(selectedAsset.warrantyEndDate)
                      .toISOString()
                      .split("T")[0]
                  : ""
              }
              required
              fullWidth
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("warranty_number")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="warrantyNumber"
              defaultValue={selectedAsset?.warrantyNumber}
              required
              fullWidth
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("barcode")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="barcode"
              defaultValue={selectedAsset?.barcode}
              required
              fullWidth
            />
          </div>

          {/* Category Dropdown */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("category")} <span className="text-red-500">*</span>
            </label>
            <Select
              name="category"
              defaultValue={selectedAsset?.category || ""}
              options={formCategoryOptions}
              required
              fullWidth
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("location")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="location"
              defaultValue={selectedAsset?.location}
              required
              fullWidth
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("cost")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="cost"
              type="number"
              defaultValue={selectedAsset?.cost}
              required
              fullWidth
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("purchase_date")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="purchaseDate"
              type="date"
              defaultValue={
                selectedAsset?.purchaseDate
                  ? new Date(selectedAsset.purchaseDate)
                      .toISOString()
                      .split("T")[0]
                  : ""
              }
              required
              fullWidth
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("assigned_to")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="assignedTo"
              defaultValue={selectedAsset?.assignedTo}
              required
              fullWidth
            />
          </div>

          {/* States Dropdown */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("states")} <span className="text-red-500">*</span>
            </label>
            <Select
              name="state"
              defaultValue={selectedAsset?.state || ""}
              options={formStatusOptions}
              required
              fullWidth
            />
          </div>
        </div>

        {/* Attachments Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("attachments")}
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddingAttachment(true)}
              className="gap-1"
            >
              <Paperclip size={14} />
              {t("add_attachment")}
            </Button>
          </div>

          {/* Add New Attachment Input */}
          {isAddingAttachment && (
            <div className="flex gap-2 items-center">
              <div className="flex-1">
                <Input
                  placeholder={t("attachment_url_placeholder")}
                  value={newAttachmentUrl}
                  onChange={(e) => setNewAttachmentUrl(e.target.value)}
                  fullWidth
                />
              </div>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleAddAttachment}
              >
                {t("add")}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setIsAddingAttachment(false);
                  setNewAttachmentUrl("");
                }}
              >
                {t("cancel")}
              </Button>
            </div>
          )}

          {/* Attachments List */}
          {attachments.length > 0 && (
            <div className="border border-gray-200 dark:border-dark-border rounded-lg divide-y divide-gray-200 dark:divide-dark-border">
              {attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-dark-surface transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="text-xl">{getFileIcon(attachment)}</div>
                    <a
                      href={attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline truncate flex-1"
                    >
                      {attachment.length > 50 ? attachment.substring(0, 50) + "..." : attachment}
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(index)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {attachments.length === 0 && !isAddingAttachment && (
            <div className="text-center py-6 border-2 border-dashed border-gray-300 dark:border-dark-border rounded-lg">
              <LinkIcon size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("no_attachments")}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {t("click_add_attachment_to_add")}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("notes")} <span className="text-red-500">*</span>
          </label>
          <TextArea
            name="notes"
            defaultValue={selectedAsset?.notes}
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
            disabled={isImageCompressing}
          >
            {selectedAsset ? t("save") : t("add_asset_register")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};