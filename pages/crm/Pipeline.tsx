
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, ChevronDown } from 'lucide-react';
import { Card, Button, Input, Select, Badge } from '../../components/ui/Common';
import { Modal } from '../../components/ui/Modal';
import { Table, Column } from '../../components/ui/Table';

interface Pipeline {
  id: string;
  pipelineName: string;
  totalDealValue: string;
  noOfDeals: number;
  stages: 'Win' | 'Lost' | 'In Pipeline';
}

export const Pipeline: React.FC = () => {
  const { t } = useTranslation();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);

  const [pipelines, setPipelines] = useState<Pipeline[]>([
    {
      id: '1',
      pipelineName: 'Sales',
      totalDealValue: '3456$',
      noOfDeals: 3,
      stages: 'Win',
    },
    {
      id: '2',
      pipelineName: 'Marketing',
      totalDealValue: '',
      noOfDeals: 0,
      stages: 'Lost',
    },
    {
      id: '3',
      pipelineName: '',
      totalDealValue: '',
      noOfDeals: 0,
      stages: 'In Pipeline',
    },
  ]);

  const columns: Column<Pipeline>[] = [
    { header: t('pipeline_name'), accessorKey: 'pipelineName' },
    { header: t('total_deal_value'), accessorKey: 'totalDealValue' },
    { header: t('no_of_deals'), accessorKey: 'noOfDeals' },
    { 
      header: t('stages'), 
      render: (item) => {
        const colors: Record<string, string> = {
          'Win': 'text-emerald-600',
          'Lost': 'text-red-600',
          'In Pipeline': 'text-blue-600'
        };
        return <span className={colors[item.stages]}>{item.stages}</span>;
      }
    },
    {
      header: t('actions'),
      render: (item) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { setSelectedPipeline(item); setIsEditModalOpen(true); }}
            className="p-1.5 text-gray-400 hover:text-primary transition-colors border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <Edit2 size={16} />
          </button>
          <button className="p-1.5 text-gray-400 hover:text-red-500 transition-colors border border-gray-200 dark:border-gray-700 rounded-lg">
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-blue-900 dark:text-white">{t('pipeline')}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{t('manage_your_pipeline')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="text-primary border-primary flex items-center gap-2">
            <ChevronDown size={16} />
            {t('export')}
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)} className="bg-primary hover:bg-primary/90 flex items-center gap-2">
            <Plus size={18} />
            {t('add_pipeline')}
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden border-none shadow-sm">
        <div className="p-6 space-y-6">
          <div className="flex justify-end">
            <Button variant="outline" className="flex items-center gap-2 text-gray-600 border-gray-200">
              <ChevronDown size={16} />
              {t('pipeline_name')}
            </Button>
          </div>

          <div className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
            <Table 
              data={pipelines}
              columns={columns}
              keyExtractor={(item) => item.id}
              selectable
              className="w-full"
              headerClassName="bg-blue-50/50 dark:bg-blue-900/10 text-blue-900 dark:text-blue-200"
            />
          </div>
        </div>
      </Card>

      {/* Add Modal */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title={<div className="flex items-center gap-2"><Plus size={20} className="text-primary" /> {t('add_pipeline')}</div>}
      >
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Input label={t('pipeline_name')} placeholder="aaaaaaa" required />
          <Input label={t('total_deal_value')} placeholder="aaaaaaa" required />
          <Input label={t('no_of_deals')} placeholder="444555" required />
          <Select label={t('stages')} options={[{ value: 'Win', label: 'Win' }]} required />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setIsAddModalOpen(false)} className="bg-slate-700 text-white hover:bg-slate-800">
            {t('cancel')}
          </Button>
          <Button className="bg-primary hover:bg-primary/90 flex items-center gap-2">
            <Plus size={18} />
            {t('add_pipeline')}
          </Button>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)}
        title={<div className="flex items-center gap-2"><Edit2 size={20} className="text-primary" /> {t('edit_pipeline')}</div>}
      >
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Input label={t('pipeline_name')} defaultValue={selectedPipeline?.pipelineName} placeholder="aaaaaaa" required />
          <Input label={t('total_deal_value')} defaultValue={selectedPipeline?.totalDealValue} placeholder="aaaaaaa" required />
          <Input label={t('no_of_deals')} defaultValue={selectedPipeline?.noOfDeals.toString()} placeholder="444555" required />
          <Select label={t('stages')} defaultValue={selectedPipeline?.stages} options={[{ value: 'Win', label: 'Win' }]} required />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setIsEditModalOpen(false)} className="bg-slate-700 text-white hover:bg-slate-800">
            {t('cancel')}
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            {t('save')}
          </Button>
        </div>
      </Modal>
    </div>
  );
};
