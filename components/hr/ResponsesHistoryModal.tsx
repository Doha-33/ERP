
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../ui/Modal';
import { ActionHistory } from '../../types';
import { Table, Column } from '../ui/Table';

interface ResponsesHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: ActionHistory[];
}

export const ResponsesHistoryModal: React.FC<ResponsesHistoryModalProps> = ({ isOpen, onClose, history }) => {
  const { t } = useTranslation();

  const columns: Column<ActionHistory>[] = [
    { header: t('created_at'), accessorKey: 'createdAt', className: 'text-gray-500' },
    { header: t('by'), accessorKey: 'by', className: 'text-gray-800 font-medium' },
    { header: t('role'), accessorKey: 'role', className: 'text-gray-500' },
    { header: t('date_of_action'), accessorKey: 'date', className: 'text-gray-500' },
    { header: t('time_of_action'), accessorKey: 'time', className: 'text-gray-500' },
    { 
      header: t('actions'), 
      render: (item) => (
        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
          item.action === 'Approved' ? 'bg-green-50 text-green-600' :
          item.action === 'Rejected' ? 'bg-red-50 text-red-600' :
          'bg-orange-50 text-orange-600'
        }`}>
          {t((item.action || 'Pending').toLowerCase())}
        </span>
      )
    },
    { header: t('rejected_reason'), accessorKey: 'rejectedReason', className: 'text-gray-400 italic' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('action_history')}
      className="max-w-5xl"
    >
      <div className="py-4">
        <Table 
          data={history}
          columns={columns}
          keyExtractor={(item) => item.id}
          minWidth="min-w-[800px]"
        />
      </div>
    </Modal>
  );
};
