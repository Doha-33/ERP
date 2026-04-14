import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  RefreshCcw, 
  Search, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  Layers,
  Activity,
  User
} from 'lucide-react';
import { Card, Button, Input, Select, Badge, ExportDropdown } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';

interface WIPItem {
  id: string;
  orderNo: string;
  productName: string;
  currentOperation: string;
  workCenter: string;
  progress: number;
  startTime: string;
  estimatedCompletion: string;
  assignedTo: string;
  status: 'on_track' | 'delayed' | 'at_risk';
}

export const WorkInProgress: React.FC = () => {
  const { t } = useTranslation();

  const wipData: WIPItem[] = [
    {
      id: '1',
      orderNo: 'MO/2024/001',
      productName: 'Laptop Lenovo',
      currentOperation: 'Assembly',
      workCenter: 'Assembly Line A',
      progress: 65,
      startTime: '2024-03-23 08:00',
      estimatedCompletion: '2024-03-23 16:00',
      assignedTo: 'Ahmed Ali',
      status: 'on_track',
    },
    {
      id: '2',
      orderNo: 'MO/2024/002',
      productName: 'Office Chair',
      currentOperation: 'Cutting',
      workCenter: 'Cutting Machine 2',
      progress: 30,
      startTime: '2024-03-23 09:30',
      estimatedCompletion: '2024-03-23 14:00',
      assignedTo: 'Sara Mohamed',
      status: 'delayed',
    },
    {
      id: '3',
      orderNo: 'MO/2024/003',
      productName: 'Desk Lamp',
      currentOperation: 'Quality Check',
      workCenter: 'Packaging Unit',
      progress: 90,
      startTime: '2024-03-23 07:00',
      estimatedCompletion: '2024-03-23 11:00',
      assignedTo: 'John Doe',
      status: 'at_risk',
    },
  ];

  const getStatusBadge = (status: WIPItem['status']) => {
    const variants = {
      on_track: 'success',
      delayed: 'danger',
      at_risk: 'warning',
    } as const;

    return <Badge variant={variants[status]}>{t(status)}</Badge>;
  };

  const columns: Column<WIPItem>[] = [
    { header: t('order_no'), accessorKey: 'orderNo' },
    { header: t('product_name'), accessorKey: 'productName' },
    { header: t('current_operation'), accessorKey: 'currentOperation' },
    { header: t('work_center'), accessorKey: 'workCenter' },
    { 
      header: t('progress'), 
      accessorKey: 'progress',
      render: (item: WIPItem) => (
        <div className="flex items-center gap-2 min-w-[120px]">
          <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                item.status === 'on_track' ? 'bg-green-500' : 
                item.status === 'delayed' ? 'bg-red-500' : 'bg-orange-500'
              }`}
              style={{ width: `${item.progress}%` }}
            />
          </div>
          <span className="text-xs font-medium dark:text-gray-300">{item.progress}%</span>
        </div>
      )
    },
    { header: t('estimated_completion'), accessorKey: 'estimatedCompletion' },
    {
      header: t('status'),
      accessorKey: 'status',
      render: (item: WIPItem) => getStatusBadge(item.status),
    },
    {
      header: t('actions'),
      accessorKey: 'id',
      render: (item: WIPItem) => (
        <Button variant="secondary" size="sm">
          {t('view_details')}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('work_in_progress')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('monitor_active_production')}</p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown />
          <Button variant="secondary">
            <RefreshCcw size={18} />
            {t('refresh')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Layers size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('active_tasks')}</p>
              <p className="text-xl font-bold">18</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-green-500">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <Activity size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('on_track')}</p>
              <p className="text-xl font-bold">14</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-red-500">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('delayed')}</p>
              <p className="text-xl font-bold">4</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input placeholder={t('search_placeholder')} className="pl-10 w-64" />
            </div>
            <Select
              options={[
                { label: t('all_statuses'), value: 'all' },
                { label: t('on_track'), value: 'on_track' },
                { label: t('delayed'), value: 'delayed' },
                { label: t('at_risk'), value: 'at_risk' },
              ]}
              className="w-48"
            />
          </div>
        </div>
        <Table 
          columns={columns} 
          data={wipData} 
          keyExtractor={(item) => item.id}
        />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6 dark:text-white">{t('work_center_load')}</h3>
          <div className="space-y-6">
            {[
              { name: 'Assembly Line A', load: 85, color: 'bg-blue-500' },
              { name: 'Cutting Machine 2', load: 45, color: 'bg-green-500' },
              { name: 'Packaging Unit', load: 92, color: 'bg-orange-500' },
              { name: 'Painting Booth', load: 20, color: 'bg-purple-500' },
            ].map((wc) => (
              <div key={wc.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium dark:text-gray-300">{wc.name}</span>
                  <span className="text-gray-500">{wc.load}%</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${wc.color}`} 
                    style={{ width: `${wc.load}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6 dark:text-white">{t('recent_updates')}</h3>
          <div className="space-y-6">
            {[
              { user: 'Ahmed Ali', action: 'completed_operation', target: 'Cutting', time: '10 mins ago' },
              { user: 'Sara Mohamed', action: 'started_operation', target: 'Assembly', time: '25 mins ago' },
              { user: 'System', action: 'delayed_alert', target: 'MO/2024/002', time: '1 hour ago' },
              { user: 'John Doe', action: 'quality_check_passed', target: 'Desk Lamp', time: '2 hours ago' },
            ].map((update, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                  <User size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm dark:text-gray-300">
                    <span className="font-semibold">{update.user}</span> {t(update.action)} <span className="font-semibold">{update.target}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{update.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
