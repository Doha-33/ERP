import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Edit2, Trash2, History, Paperclip, Clock } from 'lucide-react';
import { Button, Input, ExportDropdown, Badge } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { AuditLogFormModal } from '../../components/assets/AuditLogFormModal';
import { useData } from '../../context/DataContext';
import { AuditLog as AuditLogType, Asset } from '../../types';
import { toast } from 'sonner';

export const AuditLog: React.FC = () => {
  const { t } = useTranslation();
  const { auditLogs, assets, assetsLoading, addAuditLog, updateAuditLog, deleteAuditLog } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLogType | null>(null);
  const [auditLogIdToDelete, setAuditLogIdToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = auditLogs.filter(log => {
    const asset = log.assetId as any;
    const assetName = asset?.assetName || '';
    const assetCode = asset?.assetCode || '';
    return assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           assetCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
           log.actionType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           log.byWho?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSave = async (data: Partial<AuditLogType>) => {
    try {
      const processedData = {
        ...data      };

      if (selectedAuditLog) {
        await updateAuditLog(selectedAuditLog._id || selectedAuditLog.id!, processedData);
        toast.success(t('audit_log_updated_successfully'));
      } else {
        await addAuditLog(processedData);
        toast.success(t('audit_log_added_successfully'));
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save audit log:', error);
      toast.error(t('failed_to_save_audit_log'));
    }
  };

  const handleDelete = async () => {
    if (!auditLogIdToDelete) return;
    try {
      await deleteAuditLog(auditLogIdToDelete);
      setIsDeleteModalOpen(false);
      setAuditLogIdToDelete(null);
      toast.success(t('audit_log_deleted_successfully'));
    } catch (error) {
      console.error('Failed to delete audit log:', error);
      toast.error(t('failed_to_delete_audit_log'));
    }
  };

  const getActionTypeBadge = (actionType: string) => {
    const type = actionType?.toLowerCase();
    
    const typeMap: Record<string, { label: string; color: string }> = {
      create: { label: t("action_create"), color: "green" },
      update: { label: t("action_update"), color: "blue" },
      delete: { label: t("action_delete"), color: "red" },
      transfer: { label: t("action_transfer"), color: "purple" },
      maintenance: { label: t("action_maintenance"), color: "orange" },
      disposal: { label: t("action_disposal"), color: "red" },
      allocation: { label: t("action_allocation"), color: "indigo" },
      "status change": { label: t("action_status_change"), color: "amber" },
    };

    const { label, color } = typeMap[type] || { 
      label: actionType || t("unknown"), 
      color: "gray" 
    };

    const colorClasses = {
      green: "bg-green-50 text-green-700 border-green-200",
      blue: "bg-blue-50 text-blue-700 border-blue-200",
      red: "bg-red-50 text-red-700 border-red-200",
      purple: "bg-purple-50 text-purple-700 border-purple-200",
      orange: "bg-orange-50 text-orange-700 border-orange-200",
      indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
      amber: "bg-amber-50 text-amber-700 border-amber-200",
      gray: "bg-gray-50 text-gray-700 border-gray-200",
    };

    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colorClasses[color as keyof typeof colorClasses]}`}>
        <span>{label}</span>
      </div>
    );
  };

  const columns: Column<AuditLogType>[] = [
    { header: t('audit_code'), accessorKey: 'auditCode' },
    { 
      header: t('asset'), 
      render: (item) => {
        const asset = item.assetId as any;
        const foundAsset = typeof asset === 'object' ? asset : assets.find(a => (a._id || a.id) === asset);
        const assetName = foundAsset?.assetName || foundAsset?.name;
        const assetCode = foundAsset?.assetCode || foundAsset?.code;
        
        return (
          <div className="flex flex-col">
            <span className="font-medium text-sm text-gray-900">{assetName || t('unknown_asset')}</span>
            <span className="text-xs text-gray-500 font-mono">{assetCode || t('no_code')}</span>
          </div>
        );
      }
    },
    { 
      header: t('action_type'), 
      accessorKey: 'actionType',
      render: (item) => getActionTypeBadge(item.actionType)
    },
    { 
      header: t('by_who'), 
      accessorKey: 'byWho',
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-xs font-medium text-gray-600">
              {item.byWho?.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="text-sm">{item.byWho}</span>
        </div>
      )
    },
    { 
      header: t('change_description'), 
      accessorKey: 'changeDescription',
      render: (item) => (
        <div 
          className="max-w-[250px] truncate cursor-help"
          title={item.changeDescription}
        >
          {item.changeDescription?.length > 30 
            ? `${item.changeDescription.substring(0, 30)}...` 
            : item.changeDescription}
        </div>
      )
    },
    { 
      header: t('date'), 
      render: (item) => (
        <div className="flex items-center gap-1">
          <Clock size={12} className="text-gray-400" />
          <span className="text-sm">
            {item.date ? new Date(item.date).toLocaleDateString() : '-'}
          </span>
        </div>
      )
    },
    {
      header: t('actions'),
      render: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedAuditLog(item);
              setIsModalOpen(true);
            }}
            className="p-1.5 text-gray-400 hover:text-primary transition-colors border border-gray-200 rounded-lg"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={() => {
              setAuditLogIdToDelete(item._id || item.id!);
              setIsDeleteModalOpen(true);
            }}
            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors border border-gray-200 rounded-lg"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('audit_log')}</h1>
          <p className="text-gray-500">{t('manage_your_audit_log')}</p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown data={auditLogs} filename="audit-logs" />
          <Button
            variant="primary"
            onClick={() => {
              setSelectedAuditLog(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t('add_audit_log')}
          </Button>
        </div>
      </div>

      <div className="p-4 flex flex-wrap gap-4 items-center">
        <Input 
          placeholder={t('search_audit_log')} 
          icon={<Search size={18} />} 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
          fullWidth={false}
        />
      </div>

      <Table 
        columns={columns} 
        data={filteredLogs} 
        keyExtractor={(item) => item._id || item.id!}
        isLoading={assetsLoading}
        selectable
      />

      <AuditLogFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedAuditLog={selectedAuditLog}
        assets={assets}
        onSave={handleSave}
      />

      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={t('delete_audit_log')}
        message={t('are_you_sure_delete_audit_log')}
      />
    </div>
  );
};