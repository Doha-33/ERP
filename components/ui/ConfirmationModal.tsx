
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from './Modal';
import { Button } from './Common';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message
}) => {
  const { t } = useTranslation();

  const footer = (
    <>
      <Button variant="ghost" onClick={onClose} className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">
        {t('cancel')}
      </Button>
      <Button variant="danger" onClick={onConfirm}>
        {t('delete')}
      </Button>
    </>
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