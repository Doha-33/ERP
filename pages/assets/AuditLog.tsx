import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Edit2, Trash2, User, Clock, FileText, History } from 'lucide-react';
import { Card, Button, Input, Select, Badge, ExportDropdown } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';

interface AuditLog {
  id: string;
  assetId: string;
  actionType: string;
  byWho: string;
  changeDescription: string;
  date: string;
}

export const AuditLog: React.FC = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLog | null>(null);

  const auditLogData: AuditLog[] = [
    {
      id: '1',
      assetId: '122',
      actionType: 'scrap',
      byWho: 'Ahmed',
      changeDescription: 'year',
      date: '2/2/2020',
    },
  ];

  const columns: Column<AuditLog>[] = [
    { header: t('asset_id'), accessorKey: 'assetId' },
    { header: t('action_type'), accessorKey: 'actionType' },
    { header: t('by_who'), accessorKey: 'byWho' },
    { header: t('change_description'), accessorKey: 'changeDescription' },
    { header: t('date'), accessorKey: 'date' },
    {
      header: t('actions'),
      accessorKey: 'id',
      render: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedAuditLog(item);
              setIsModalOpen(true);
            }}
            className="p-1 hover:bg-gray-100 rounded text-blue-600"
          >
            <Edit2 size={16} />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded text-red-600">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('audit_log')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('manage_your_audit_log')}</p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown />
          <Button
            variant="primary"
            onClick={() => {
              setSelectedAuditLog(null);
              setIsModalOpen(true);
            }}
          >
            <Plus size={18} />
            {t('add_audit_log')}
          </Button>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap gap-4 items-center justify-end">
          <Select
            options={[
              { label: t('asset_id'), value: 'asset_id' },
            ]}
            className="w-48"
          />
        </div>
        <div className="overflow-x-auto">
          <Table 
            columns={columns} 
            data={auditLogData} 
            keyExtractor={(item) => item.id}
          />
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedAuditLog ? t('edit_audit_log') : t('add_audit_log')}
        size="lg"
      >
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('asset_id')} *</label>
              <Input defaultValue={selectedAuditLog?.assetId} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('action_type')} *</label>
              <Select
                options={[
                  { label: 'aaaa', value: 'aaaa' },
                ]}
                defaultValue={selectedAuditLog?.actionType}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('by_who')} *</label>
              <Select
                options={[
                  { label: 'aaaa', value: 'aaaa' },
                ]}
                defaultValue={selectedAuditLog?.byWho}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('date')} *</label>
              <Input type="date" defaultValue={selectedAuditLog?.date} required />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('change_description')} *</label>
            <Input defaultValue={selectedAuditLog?.changeDescription} required />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              {t('cancel')}
            </Button>
            <Button variant="primary" type="submit">
              {selectedAuditLog ? t('save') : t('add_audit_log')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
