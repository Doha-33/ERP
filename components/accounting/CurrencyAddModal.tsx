import React from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select } from "../../components/ui/Common";

interface CurrencyAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  loading: boolean;
}

export const CurrencyAddModal: React.FC<CurrencyAddModalProps> = ({
  isOpen,
  onClose,
  onSave,
  loading,
}) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const processedData = {
      code: formData.get('code') as string,
      name: formData.get('name') as string,
      symbol: formData.get('symbol') as string,
      isBaseCurrency: formData.get('isBaseCurrency') === 'true',
      isActive: true,
    };

    try {
      await onSave(processedData);
      onClose();
    } catch (error) {
      console.error("Error in form submission:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Plus size={20} />
          {t("add_currency")}
        </div>
      }
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-x-8 gap-y-4">
          {/* Currency Code */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("code")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="code"
              placeholder="USD"
              required
              fullWidth
            />
          </div>

          {/* Currency Symbol */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("symbol")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="symbol"
              placeholder="$"
              required
              fullWidth
            />
          </div>

          {/* Currency Name */}
          <div className="col-span-2 space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("name")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="name"
              placeholder={t("enter_currency_name")}
              required
              fullWidth
            />
          </div>

          {/* Base Currency */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("base_currency")} <span className="text-red-500">*</span>
            </label>
            <Select
              name="isBaseCurrency"
              options={[
                { value: 'false', label: t('no') },
                { value: 'true', label: t('yes') }
              ]}
              required
              fullWidth
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting || loading}>
            {t("cancel")}
          </Button>
          <Button
            variant="primary"
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 px-8"
            isLoading={isSubmitting || loading}
            disabled={isSubmitting || loading}
          >
            {t("create_currency")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};