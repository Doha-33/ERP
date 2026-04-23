// src/components/assets/DisposalFormModal.tsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Edit2, Plus, Tag, CreditCard, Paperclip, Link as LinkIcon, X, Trash2, Eye, Upload, Link } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea, FileUpload } from "../../components/ui/Common";
import { Disposal as DisposalType, Asset } from "../../types";
import { toast } from "sonner";

interface DisposalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDisposal: DisposalType | null;
  assets: Asset[];
  onSave: (data: Partial<DisposalType>, attachments?: string[]) => Promise<void>;
}

export const DisposalFormModal: React.FC<DisposalFormModalProps> = ({
  isOpen,
  onClose,
  selectedDisposal,
  assets,
  onSave,
}) => {
  const { t } = useTranslation();
  const [attachments, setAttachments] = useState<string[]>(selectedDisposal?.attachments || []);
  const [isAddingAttachment, setIsAddingAttachment] = useState(false);
  const [attachmentType, setAttachmentType] = useState<'file' | 'link'>('link');
  const [attachmentUrl, setAttachmentUrl] = useState<string>("");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentName, setAttachmentName] = useState<string>("");
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  // Asset options for dropdown
  const assetOptions = assets.map(asset => ({
    value: asset._id || asset.id!,
    label: `${asset.assetName} - ${asset.serialNumber || asset.assetCode || ''}`,
  }));

  // Disposal Type Options
  const disposalTypeOptions = [
    { value: "Sale", label: t("sale") },
    { value: "Scrap", label: t("scrap") },
    { value: "Donation", label: t("donation") },
    { value: "Transfer", label: t("transfer") },
  ];

  // Payment Method Options
  const paymentMethodOptions = [
    { value: "Cash", label: t("cash") },
    { value: "Bank Transfer", label: t("bank_transfer") },
    { value: "Cheque", label: t("cheque") },
    { value: "Card", label: t("credit_card") },
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
      const maxSize = 5 * 1024 * 1024;
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
    return '🔗';
  };

  const isFileBase64 = (url: string) => {
    return url.startsWith('data:');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const processedData: Partial<DisposalType> = {
      assetId: data.assetId as string,
      assetName: data.assetName as string,
      model: data.model as string,
      serialNumber: data.serialNumber as string,
      brand: data.brand as string,
      category: data.category as string,
      purchaseDate: data.purchaseDate as string,
      purchaseCost: Number(data.purchaseCost),
      currentValue: Number(data.currentValue),
      disposalType: data.disposalType as string,
      disposalValue: Number(data.disposalValue),
      invoiceNumber: data.invoiceNumber as string,
      paymentMethod: data.paymentMethod as string,
      notes: data.notes as string,
      attachments: attachments,
    };

    await onSave(processedData, attachments);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {selectedDisposal ? <Edit2 size={20} /> : <Plus size={20} />}
          {selectedDisposal ? t("edit_disposal") : t("add_disposal")}
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
                typeof selectedDisposal?.assetId === "object"
                  ? (selectedDisposal.assetId as any)._id
                  : selectedDisposal?.assetId || ""
              }
              options={assetOptions}
              placeholder={t("select_asset")}
              required
              fullWidth
            />
          </div>

          {/* Asset Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("asset_name")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="assetName"
              defaultValue={selectedDisposal?.assetName}
              placeholder={t("enter_asset_name")}
              required
              fullWidth
            />
          </div>

          {/* Model */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("model")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="model"
              defaultValue={selectedDisposal?.model}
              placeholder={t("enter_model")}
              required
              fullWidth
            />
          </div>

          {/* Serial Number */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("serial_number")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="serialNumber"
              defaultValue={selectedDisposal?.serialNumber}
              placeholder={t("enter_serial_number")}
              required
              fullWidth
            />
          </div>

          {/* Brand */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("brand")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="brand"
              defaultValue={selectedDisposal?.brand}
              placeholder={t("enter_brand")}
              required
              fullWidth
            />
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("category")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="category"
              defaultValue={selectedDisposal?.category}
              placeholder={t("enter_category")}
              required
              fullWidth
            />
          </div>

          {/* Purchase Date */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("purchase_date")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="purchaseDate"
              type="date"
              defaultValue={
                selectedDisposal?.purchaseDate
                  ? new Date(selectedDisposal.purchaseDate)
                      .toISOString()
                      .split("T")[0]
                  : ""
              }
              required
              fullWidth
            />
          </div>

          {/* Purchase Cost */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("purchase_cost")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="purchaseCost"
              type="number"
              defaultValue={selectedDisposal?.purchaseCost}
              placeholder="0"
              required
              fullWidth
            />
          </div>

          {/* Current Value */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("current_value")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="currentValue"
              type="number"
              defaultValue={selectedDisposal?.currentValue}
              placeholder="0"
              required
              fullWidth
            />
          </div>

          {/* Disposal Type Dropdown */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("disposal_type")} <span className="text-red-500">*</span>
            </label>
            <Select
              name="disposalType"
              defaultValue={selectedDisposal?.disposalType || ""}
              options={disposalTypeOptions}
              placeholder={t("select_disposal_type")}
              required
              fullWidth
            />
          </div>

          {/* Disposal Value */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("disposal_value")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="disposalValue"
              type="number"
              defaultValue={selectedDisposal?.disposalValue}
              placeholder="0"
              required
              fullWidth
            />
          </div>

          {/* Invoice Number */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("invoice_number")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="invoiceNumber"
              defaultValue={selectedDisposal?.invoiceNumber}
              placeholder={t("enter_invoice_number")}
              required
              fullWidth
            />
          </div>

          {/* Payment Method Dropdown */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("payment_method")} <span className="text-red-500">*</span>
            </label>
            <Select
              name="paymentMethod"
              defaultValue={selectedDisposal?.paymentMethod || ""}
              options={paymentMethodOptions}
              placeholder={t("select_payment_method")}
              required
              fullWidth
            />
          </div>
        </div>

        {/* Attachments Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              {t("attachments")}
            </label>
            <Button
              type="button"
              size="sm"
              onClick={() => setIsAddingAttachment(true)}
              className="gap-1"
            >
              <Paperclip size={14} />
              {t("add_attachment")}
            </Button>
          </div>

          {/* Add New Attachment Form */}
          {isAddingAttachment && (
            <div className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex gap-2 border-b border-gray-200 pb-2">
                <button
                  type="button"
                  onClick={() => setAttachmentType('link')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors`}
                >
                  <Link size={14} />
                  {t("add_link")}
                </button>
              </div>

              {attachmentType === 'link' && (
                <div className="space-y-2">
                  <Input
                    placeholder={t("enter_url")}
                    value={attachmentUrl}
                    onChange={(e) => setAttachmentUrl(e.target.value)}
                    fullWidth
                  />
                  <p className="text-xs text-gray-500">
                    {t("supported_formats_pdf_images_documents")}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={resetAttachmentForm}
                >
                  {t("cancel")}
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleAddAttachment}
                  disabled={uploadingAttachment || (attachmentType === 'file' && !attachmentFile)}
                >
                  {uploadingAttachment ? t("uploading") : t("add")}
                </Button>
              </div>
            </div>
          )}

          {/* Attachments List */}
          {attachments.length > 0 && (
            <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-60 overflow-y-auto">
              {attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="text-xl">{getFileIcon(attachment)}</div>
                    <div className="flex-1 min-w-0">
                      {isFileBase64(attachment) ? (
                        <span className="text-sm text-gray-600 truncate block">
                          {t("uploaded_file")} {index + 1}
                        </span>
                      ) : (
                        <a
                          href={attachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-indigo-600 hover:underline truncate block"
                        >
                          {attachment.length > 50 ? attachment.substring(0, 50) + "..." : attachment}
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isFileBase64(attachment) && (
                      <button
                        type="button"
                        onClick={() => {
                          const win = window.open();
                          win?.document.write(`<iframe src="${attachment}" style="width:100%;height:100%;border:none;"></iframe>`);
                        }}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors"
                        title={t("preview")}
                      >
                        <Eye size={16} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(index)}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      title={t("remove")}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {attachments.length === 0 && !isAddingAttachment && (
            <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
              <LinkIcon size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">
                {t("no_attachments")}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {t("click_add_attachment_to_add")}
              </p>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            {t("notes")} <span className="text-red-500">*</span>
          </label>
          <TextArea
            name="notes"
            defaultValue={selectedDisposal?.notes}
            placeholder={t("enter_notes")}
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
            {selectedDisposal ? t("save") : t("add_disposal")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};