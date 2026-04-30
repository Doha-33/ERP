import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { XCircle } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, TextArea } from "../../components/ui/Common";

interface ResponseRejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reason: string) => void;
  isLoading?: boolean;
}

export const ResponseRejectModal: React.FC<ResponseRejectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!reason.trim()) return;
    setIsSubmitting(true);
    try {
      await onSave(reason);
      setReason("");
      onClose();
    } catch (error) {
      console.error("Error in reject submission:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-orange-600">
          <XCircle size={20} />
          {t("reject_request")}
        </div>
      }
      size="md"
    >
      <div className="space-y-4 py-4">
        <p className="text-sm text-gray-600">
          {t("reject_request_description")}
        </p>
        <TextArea
          label={t("rejection_reason")}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={t("enter_rejection_reason")}
          rows={4}
          required
          fullWidth
        />
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <Button variant="secondary" onClick={onClose} disabled={isSubmitting || isLoading}>
          {t("cancel")}
        </Button>
        <Button
          variant="danger"
          onClick={handleSave}
          className="bg-red-600 hover:bg-red-700"
          isLoading={isSubmitting || isLoading}
          disabled={!reason.trim() || isSubmitting || isLoading}
        >
          {t("confirm_reject")}
        </Button>
      </div>
    </Modal>
  );
};