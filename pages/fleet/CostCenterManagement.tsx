import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { Card, Button, Input, Select, Badge, ExportDropdown, TextArea } from '../../components/ui/Common';
import { Table } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';

interface CostCenter {
  id: string;
  name: string;
  code: string;
  description: string;
  status: 'active' | 'inactive';
  createdAt: string;
  createdBy: string;
}

export const CostCenterManagement: React.FC = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCostCenter, setSelectedCostCenter] = useState<CostCenter | null>(null);

  const costCenters: CostCenter[] = [
    {
      id: 'CC-001',
      name: 'Operations - Fleet',
      code: 'OPS-FLT',
      description: 'Main fleet operations cost center',
      status: 'active',
      createdAt: '2025-01-01',
      createdBy: 'Admin',
    },
    {
      id: 'CC-002',
      name: 'Logistics - Delivery',
      code: 'LOG-DEL',
      description: 'Logistics and delivery cost center',
      status: 'active',
      createdAt: '2025-01-05',
      createdBy: 'Admin',
    },
  ];

  const columns = [
    { header: t('cost_center_name'), accessorKey: 'name' as keyof CostCenter },
    { header: t('cost_center_code'), accessorKey: 'code' as keyof CostCenter },
    { header: t('description'), accessorKey: 'description' as keyof CostCenter },
    {
      header: t('status'),
      accessorKey: 'status' as keyof CostCenter,
      render: (item: CostCenter) => (
        <Badge
          variant={item.status === 'active' ? 'success' : 'neutral'}
        >
          {t(item.status)}
        </Badge>
      ),
    },
    { header: t('created_at'), accessorKey: 'createdAt' as keyof CostCenter },
    { header: t('created_by'), accessorKey: 'createdBy' as keyof CostCenter },
    {
      header: t('actions'),
      accessorKey: 'id' as keyof CostCenter,
      render: (item: CostCenter) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedCostCenter(item);
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
          <h1 className="text-2xl font-bold text-gray-900">{t('cost_center_management')}</h1>
          <p className="text-gray-500">{t('manage_your_cost_center')}</p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown />
          <Button
            variant="primary"
            onClick={() => {
              setSelectedCostCenter(null);
              setIsModalOpen(true);
            }}
          >
            <Plus size={18} />
            {t('add_cost_center')}
          </Button>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input placeholder={t('search_placeholder')} className="pl-10 w-64" />
            </div>
          </div>
        </div>
        <Table 
          columns={columns} 
          data={costCenters} 
          keyExtractor={(item) => item.id}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedCostCenter ? t('edit_cost_center') : t('add_cost_center')}
      >
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('cost_center_name')} *</label>
              <Input defaultValue={selectedCostCenter?.name} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('cost_center_code')} *</label>
              <Input defaultValue={selectedCostCenter?.code} required />
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('description')}</label>
              <TextArea defaultValue={selectedCostCenter?.description} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('status')} *</label>
              <Select
                options={[
                  { label: t('active'), value: 'active' },
                  { label: t('inactive'), value: 'inactive' },
                ]}
                defaultValue={selectedCostCenter?.status}
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              {t('cancel')}
            </Button>
            <Button variant="primary" type="submit">
              {selectedCostCenter ? t('save') : t('add_cost_center')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
