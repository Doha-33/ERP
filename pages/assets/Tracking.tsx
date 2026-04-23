import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Edit2, Trash2, MapPin, History, FileText, Clock } from 'lucide-react';
import { Button, Input, ExportDropdown, Badge } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { TrackingFormModal } from '../../components/assets/TrackingFormModal';
import { useData } from '../../context/DataContext';
import { Tracking as TrackingType, Asset } from '../../types';
import { toast } from 'sonner';

export const Tracking: React.FC = () => {
  const { t } = useTranslation();
  const { trackings, assets, assetsLoading, addTracking, updateTracking, deleteTracking } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTracking, setSelectedTracking] = useState<TrackingType | null>(null);
  const [trackingIdToDelete, setTrackingIdToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTrackings = trackings.filter(tr => {
    const asset = tr.assetId as any;
    const assetName = asset?.assetName || '';
    const assetCode = asset?.assetCode || '';
    return assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           assetCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
           tr.currentLocation?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSave = async (data: Partial<TrackingType>) => {
    try {
      if (selectedTracking) {
        await updateTracking(selectedTracking._id || selectedTracking.id!, data);
        toast.success(t('tracking_updated_successfully'));
      } else {
        await addTracking(data);
        toast.success(t('tracking_added_successfully'));
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save tracking:', error);
      toast.error(t('failed_to_save_tracking'));
    }
  };

  const handleDelete = async () => {
    if (!trackingIdToDelete) return;
    try {
      await deleteTracking(trackingIdToDelete);
      setIsDeleteModalOpen(false);
      setTrackingIdToDelete(null);
      toast.success(t('tracking_deleted_successfully'));
    } catch (error) {
      console.error('Failed to delete tracking:', error);
      toast.error(t('failed_to_delete_tracking'));
    }
  };

  // Helper function to truncate text
  const truncateText = (text: string, maxLength: number = 30) => {
    if (!text) return '-';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const columns: Column<TrackingType>[] = [
    { header: t('code'), accessorKey: 'trackingCode' },
    { 
      header: t('asset'), 
      render: (item) => {
        const asset = item.assetId as any;
        const foundAsset = typeof asset === 'object' ? asset : assets.find(a => (a._id || a.id) === asset);
        const name = foundAsset?.assetName || foundAsset?.name;
        const code = foundAsset?.assetCode || foundAsset?.code;
        return (
          <div className="flex flex-col">
            <span className="font-medium text-sm text-gray-900 dark:text-white">{name || t('unknown_asset')}</span>
            <span className="text-xs text-gray-500 font-mono">{code || t('no_code')}</span>
          </div>
        );
      }
    },
    { 
      header: t('current_location'), 
      accessorKey: 'currentLocation',
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
            <MapPin size={12} className="text-blue-600" />
          </div>
          <span className="text-sm">{item.currentLocation}</span>
        </div>
      )
    },
    { 
      header: t('movement_history'), 
      accessorKey: 'movementHistory',
      render: (item) => (
        <div className="flex items-center gap-2 max-w-[250px]">
          <History size={14} className="text-gray-400 flex-shrink-0" />
          <span 
            className="text-sm text-gray-600 dark:text-gray-300 truncate cursor-help"
            title={item.movementHistory}
          >
            {truncateText(item.movementHistory, 40)}
          </span>
        </div>
      )
    },
    { 
      header: t('notes'), 
      accessorKey: 'notes',
      render: (item) => (
        <div className="flex items-center gap-2 max-w-[200px]">
          <FileText size={14} className="text-gray-400 flex-shrink-0" />
          <span 
            className="text-sm text-gray-500 dark:text-gray-400 truncate cursor-help"
            title={item.notes || ''}
          >
            {truncateText(item.notes || '-', 20)}
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
              setSelectedTracking(item);
              setIsModalOpen(true);
            }}
            className="p-1.5 text-gray-400 hover:text-primary transition-colors border border-gray-200 rounded-lg"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={() => {
              setTrackingIdToDelete(item._id || item.id!);
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('tracking')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('manage_your_tracking')}</p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown data={trackings} filename="tracking" />
          <Button
            variant="primary"
            onClick={() => {
              setSelectedTracking(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t('add_tracking')}
          </Button>
        </div>
      </div>

      <div className="p-4 flex flex-wrap gap-4 items-center">
        <Input 
          placeholder={t('search_tracking')} 
          icon={<Search size={18} />} 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
          fullWidth={false}
        />
      </div>

      <Table 
        columns={columns} 
        data={filteredTrackings} 
        keyExtractor={(item) => item._id || item.id!}
        isLoading={assetsLoading}
        selectable
      />

      <TrackingFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedTracking={selectedTracking}
        assets={assets}
        onSave={handleSave}
      />

      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={t('delete_tracking')}
        message={t('are_you_sure_delete_tracking')}
      />
    </div>
  );
};