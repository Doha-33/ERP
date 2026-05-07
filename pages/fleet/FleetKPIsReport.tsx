import React, { useState, useEffect } from 'react';
import { useTranslation }from 'react-i18next';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Truck,
  Fuel,
  Wrench,
  AlertTriangle,
  BarChart3,
  Target,
  Award,
  Users
} from 'lucide-react';
import { Card, Badge, ExportDropdown } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { fleetService } from '../../services/fleet.service';
import { toast } from 'sonner';

interface KPI {
  id: string;
  metric: string;
  value: string;
  target: string;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
  category: string;
}

interface MainKPIs {
  avgFuelCost: number;
  avgMaintenanceCost: number;
  topMileageVehicle: string;
  accidentRate: string;
  totalVehicles: number;
  activeVehiclesCount: number;
  totalTripsCount: number;
  fuelEfficiency: number;
}

export const FleetKPIsReport: React.FC = () => {
  const { t } = useTranslation();
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [mainKpis, setMainKpis] = useState<MainKPIs | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchKPIs = async () => {
    try {
      setLoading(true);
      const data = await fleetService.getKPIs();
      setKpis(data.table || []);
      setMainKpis(data.main || null);
    } catch (error: any) {
      console.error("Failed to fetch KPIs:", error);
      toast.error(error.message || t('failed_to_fetch_data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKPIs();
  }, []);

  const filteredKPIs = kpis.filter(kpi => {
    const matchesCategory = categoryFilter === 'all' || kpi.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchesSearch = kpi.metric.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          kpi.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={16} className="text-green-600" />;
      case 'down':
        return <TrendingDown size={16} className="text-red-600" />;
      default:
        return <Minus size={16} className="text-gray-400" />;
    }
  };

  const getTrendText = (trend: string) => {
    switch (trend) {
      case 'up':
        return t('increasing');
      case 'down':
        return t('decreasing');
      default:
        return t('stable');
    }
  };

  const getStatusVariant = (status: string): 'success' | 'warning' | 'danger' | 'info' | 'neutral' => {
    switch (status) {
      case 'good':
        return 'success';
      case 'warning':
        return 'warning';
      case 'critical':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'good':
        return t('good');
      case 'warning':
        return t('warning');
      case 'critical':
        return t('critical');
      default:
        return status;
    }
  };

  const columns: Column<KPI>[] = [
    { 
      header: t('metric'), 
      accessorKey: 'metric',
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
            <Target size={14} className="text-indigo-600" />
          </div>
          <span className="font-medium text-gray-900">{item.metric}</span>
        </div>
      )
    },
    { 
      header: t('category'), 
      accessorKey: 'category',
      render: (item) => (
        <Badge variant="info" className="bg-gray-100 text-gray-700">
          {item.category}
        </Badge>
      )
    },
    { 
      header: t('value'), 
      accessorKey: 'value',
      render: (item) => (
        <span className="text-lg font-semibold text-gray-900">{item.value}</span>
      )
    },
    { 
      header: t('target'), 
      accessorKey: 'target',
      render: (item) => (
        <span className="text-gray-600">{item.target}</span>
      )
    },
    {
      header: t('trend'),
      accessorKey: 'trend',
      render: (item) => (
        <div className="flex items-center gap-2">
          {getTrendIcon(item.trend)}
          <span className="text-sm text-gray-600">{getTrendText(item.trend)}</span>
        </div>
      ),
    },
    {
      header: t('status'),
      accessorKey: 'status',
      render: (item) => (
        <Badge variant={getStatusVariant(item.status)}>
          {getStatusText(item.status)}
        </Badge>
      ),
    },
  ];

  const kpiCards = [
    {
      title: t('average_fuel_cost_per_km'),
      value: `${mainKpis?.avgFuelCost?.toLocaleString() || '0'} EGP`,
      icon: Fuel,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      trend: mainKpis?.avgFuelCost && mainKpis.avgFuelCost < 5 ? 'down' : 'up',
      trendValue: '-2.5%'
    },
    {
      title: t('average_maintenance_cost_per_vehicle'),
      value: `${mainKpis?.avgMaintenanceCost?.toLocaleString() || '0'} EGP`,
      icon: Wrench,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      trend: mainKpis?.avgMaintenanceCost && mainKpis.avgMaintenanceCost < 1000 ? 'down' : 'up',
      trendValue: '-5%'
    },
    {
      title: t('top_mileage_vehicle'),
      value: mainKpis?.topMileageVehicle || t('none'),
      icon: Truck,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      trend: 'stable',
      trendValue: '0%'
    },
    {
      title: t('accident_rate'),
      value: mainKpis?.accidentRate || '0%',
      icon: AlertTriangle,
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      trend: mainKpis?.accidentRate && parseInt(mainKpis.accidentRate) < 5 ? 'down' : 'up',
      trendValue: '+1.2%'
    },
  ];

  const secondaryCards = [
    {
      title: t('total_vehicles'),
      value: mainKpis?.totalVehicles?.toLocaleString() || '0',
      icon: Truck,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      title: t('active_vehicles'),
      value: mainKpis?.activeVehiclesCount?.toLocaleString() || '0',
      icon: Truck,
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600'
    },
    {
      title: t('total_trips'),
      value: mainKpis?.totalTripsCount?.toLocaleString() || '0',
      icon: BarChart3,
      bgColor: 'bg-cyan-50',
      iconColor: 'text-cyan-600'
    },
    {
      title: t('fuel_efficiency'),
      value: mainKpis?.fuelEfficiency ? `${mainKpis.fuelEfficiency} km/L` : 'N/A',
      icon: Award,
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600'
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-500">{t('loading')}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('fleet_kpis_report')}
          </h1>
          <p className="text-gray-500 mt-1">
            {t('detailed_kpi_analysis')}
          </p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown data={kpis} filename="fleet-kpis" />
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${card.bgColor} rounded-xl flex items-center justify-center`}>
                <card.icon size={24} className={card.iconColor} />
              </div>
              {(card.trend === 'up' || card.trend === 'down') && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  card.trend === 'up' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                }`}>
                  {card.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  <span>{card.trendValue}</span>
                </div>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Secondary Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {secondaryCards.map((card, index) => (
          <div
            key={index}
            className="bg-gray-50 rounded-xl p-4 border border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                <card.icon size={18} className={card.iconColor} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{card.title}</p>
                <p className="text-lg font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* KPI Table */}
      <Card className="bg-white">
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('search_kpi_placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-64"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">{t('all_categories')}</option>
                <option value="fuel">{t('fuel')}</option>
                <option value="maintenance">{t('maintenance')}</option>
                <option value="accidents">{t('accidents')}</option>
                <option value="utilization">{t('utilization')}</option>
              </select>
            </div>
            <div className="text-sm text-gray-500">
              {t('showing')} {filteredKPIs.length} {t('of')} {kpis.length} {t('kpis')}
            </div>
          </div>
        </div>
        <Table 
          columns={columns} 
          data={filteredKPIs} 
          keyExtractor={(item) => item.id}
          isLoading={loading}
          selectable
        />
      </Card>

      {/* Performance Summary */}
      <Card className="bg-white">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <BarChart3 size={18} className="text-indigo-600" />
            </div>
            <h3 className="font-bold text-gray-900">{t('performance_summary')}</h3>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-sm font-medium text-green-700">{t('good_performing_kpis')}</p>
              </div>
              <p className="text-2xl font-bold text-green-700">
                {kpis.filter(k => k.status === 'good').length}
              </p>
              <p className="text-xs text-green-600 mt-1">{t('meeting_or_exceeding_targets')}</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <p className="text-sm font-medium text-amber-700">{t('warning_kpis')}</p>
              </div>
              <p className="text-2xl font-bold text-amber-700">
                {kpis.filter(k => k.status === 'warning').length}
              </p>
              <p className="text-xs text-amber-600 mt-1">{t('needs_attention')}</p>
            </div>
            <div className="p-4 bg-red-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <p className="text-sm font-medium text-red-700">{t('critical_kpis')}</p>
              </div>
              <p className="text-2xl font-bold text-red-700">
                {kpis.filter(k => k.status === 'critical').length}
              </p>
              <p className="text-xs text-red-600 mt-1">{t('immediate_action_required')}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};