
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../ui/Modal';
import { Button, Input } from '../ui/Common';

interface ResponseRejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reason: string) => void;
}

export const ResponseRejectModal: React.FC<ResponseRejectModalProps> = ({ isOpen, onClose, onSave }) => {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');

  const handleSave = () => {
    if (!reason.trim()) return;
    onSave(reason);
    setReason('');
    onClose();
  };

  const footer = (
    <div className="flex gap-3">
      <Button variant="ghost" className="bg-slate-700 text-white hover:bg-slate-800" onClick={onClose}>{t('cancel')}</Button>
      <Button className="bg-[#4361EE] hover:bg-blue-700 min-w-[100px]" onClick={handleSave}>{t('save')}</Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('reason_of_rejected')}
      footer={footer}
      className="max-w-xl"
    >
      <div className="py-4">
        <Input 
          label={t('reason') + ' *'} 
          placeholder={t('reason')}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        />
      </div>
    </Modal>
  );
};
