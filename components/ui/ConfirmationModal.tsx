import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from './Modal';
import { Button } from './Common';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string | React.ReactNode;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message
}) => {
  const { t } = useTranslation();

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const footer = (
    <div className="flex justify-end gap-2">
      <Button variant="ghost" onClick={onClose}>
        {t('cancel')}
      </Button>
      <Button 
        className="bg-red-600 hover:bg-red-700 text-white"
        onClick={handleConfirm}
      >
        {t('delete')}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={<span className="text-red-600">{title || t('confirm_delete')}</span>}
      footer={footer}
      className="max-w-md"
    >
      <div className="py-2">
        <p className="text-gray-600 dark:text-gray-300">
          {message || t('are_you_sure_delete')}
        </p>
      </div>
    </Modal>
  );
};