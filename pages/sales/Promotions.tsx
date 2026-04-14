
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Filter, Download, Edit2, Trash2 } from 'lucide-react';
import { Card, Button, Input, Select, Badge } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { Promotion } from '../../types';
import { useData } from '../../context/DataContext';
import { PromotionModal } from '../../components/sales/PromotionModal';

export const Promotions: React.FC = () => {
  const { t } = useTranslation();
  const { promotions, addPromotion, updatePromotion, deletePromotion } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filtered = useMemo(() => {
    return promotions.filter(p => 
      p.promotionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.benefitDescription.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [promotions, searchTerm]);

  const columns: Column<Promotion>[] = [
    { header: t('promotion_name'), accessorKey: 'promotionName' },
    { header: t('type'), accessorKey: 'type' },
    { header: t('condition_type'), accessorKey: 'conditionType' },
    { header: t('value'), accessorKey: 'value' },
    { header: t('benefit'), accessorKey: 'benefitDescription' },
    { header: t('start_date'), accessorKey: 'startDate' },
    { header: t('end_date'), accessorKey: 'endDate' },
    { 
      header: t('state'), 
      render: (item) => (
        <Badge status={item.status === 'ACTIVE' ? 'Active' : item.status === 'SCHEDULED' ? 'Warning' : 'Inactive'}>
          {t(item.status.toLowerCase())}
        </Badge>
      )
    },
    {
      header: t('actions'),
      render: (item) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { setEditingPromotion(item); setIsModalOpen(true); }}
            className="p-1.5 text-gray-400 hover:text-primary transition-colors border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={() => deletePromotion(item.id)}
            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('promotions')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('manage_your_promotions')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" className="flex items-center gap-2">
            <Download size={18} />
            {t('export')}
          </Button>
          <Button onClick={() => { setEditingPromotion(null); setIsModalOpen(true); }} className="flex items-center gap-2">
            <Plus size={18} />
            {t('add_promotions')}
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-[300px]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input 
                placeholder={t('search')} 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <Table 
          data={filtered}
          columns={columns}
          keyExtractor={(item) => item.id}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          className="border-none"
        />
      </Card>

      <PromotionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(promotion) => {
          if (editingPromotion) updatePromotion(promotion);
          else addPromotion(promotion);
          setIsModalOpen(false);
        }}
        promotionToEdit={editingPromotion}
      />
    </div>
  );
};
