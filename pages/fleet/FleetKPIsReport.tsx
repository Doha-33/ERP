import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Download, 
  Filter, 
  Calendar,
  Truck,
  Fuel,
  Wrench,
  AlertTriangle
} from 'lucide-react';
import { Card, Button, Select, Badge, ExportDropdown } from '../../components/ui/Common';
import { Table } from '../../components/ui/Table';

interface KPI {
  id: string;
  metric: string;
  value: string;
  target: string;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
  category: string;
}

export const FleetKPIsReport: React.FC = () => {
  const { t } = useTranslation();

  const kpis: KPI[] = [
    {
      id: 'KPI-001',
      metric: t('fuel_efficiency'),
      value: '8.5 km/L',
      target: '9.0 km/L',
      trend: 'up',
      status: 'good',
      category: t('fuel'),
    },
    {
      id: 'KPI-002',
      metric: t('maintenance_cost_per_vehicle'),
      value: '1,200 EGP',
      target: '1,000 EGP',
      trend: 'down',
      status: 'warning',
      category: t('maintenance'),
    },
    {
      id: 'KPI-003',
      metric: t('accident_rate'),
      value: '0.05',
      target: '0.02',
      trend: 'stable',
      status: 'critical',
      category: t('accidents'),
    },
  ];

  const columns = [
    { header: t('metric'), accessorKey: 'metric' as keyof KPI },
    { header: t('category'), accessorKey: 'category' as keyof KPI },
    { header: t('value'), accessorKey: 'value' as keyof KPI },
    { header: t('target'), accessorKey: 'target' as keyof KPI },
    {
      header: t('trend'),
      accessorKey: 'trend' as keyof KPI,
      render: (item: KPI) => (
        <div className="flex items-center gap-2">
          {item.trend === 'up' ? (
            <TrendingUp size={16} className="text-green-500" />
          ) : item.trend === 'down' ? (
            <TrendingDown size={16} className="text-red-500" />
          ) : (
            <Minus size={16} className="text-gray-400" />
          )}
          <span className="text-xs">{t(item.trend)}</span>
        </div>
      ),
    },
    {
      header: t('status'),
      accessorKey: 'status' as keyof KPI,
      render: (item: KPI) => (
        <Badge
          variant={
            item.status === 'good' ? 'success' : item.status === 'warning' ? 'warning' : 'danger'
          }
        >
          {t(item.status)}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('fleet_kpis_report')}</h1>
          <p className="text-gray-500">{t('detailed_kpi_analysis')}</p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <Fuel size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('average_fuel_cost_per_km')}</p>
            <p className="text-xl font-bold text-gray-900">2.4 EGP</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg">
            <Wrench size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('average_maintenance_cost_per_vehicle')}</p>
            <p className="text-xl font-bold text-gray-900">1,500 EGP</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
            <Truck size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('top_mileage_vehicles')}</p>
            <p className="text-xl font-bold text-gray-900">V-001 (Toyota)</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-lg">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('accident_rate')}</p>
            <p className="text-xl font-bold text-gray-900">0.05</p>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center">
            <Select
              options={[
                { label: t('all_categories'), value: 'all' },
                { label: t('fuel'), value: 'fuel' },
                { label: t('maintenance'), value: 'maintenance' },
                { label: t('accidents'), value: 'accidents' },
              ]}
              className="w-48"
            />
          </div>
        </div>
        <Table 
          columns={columns} 
          data={kpis} 
          keyExtractor={(item) => item.id}
        />
      </Card>
    </div>
  );
};
