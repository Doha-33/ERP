import React, { useState, useEffect } from 'react';
import { useTranslation }from 'react-i18next';
import { 
  Truck, 
  Users, 
  Wrench, 
  AlertTriangle,
  Fuel,
  DollarSign,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from 'recharts';
import { Card, Select, Badge } from '../../components/ui/Common';
import { fleetService } from '../../services/fleet.service';
import { toast } from 'sonner';

interface DashboardData {
  period: {
    selected: string;
    label: string;
    options: Array<{ label: string; value: string }>;
  };
  cards: {
    activeVehicles: number;
    activeDrivers: number;
    vehiclesUnderMaintenance: number;
    accidentsThisPeriod: number;
  };
  charts: {
    fuelCostThisPeriod: Array<{ label: string; value: number }>;
    maintenanceCostThisPeriod: Array<{ label: string; value: number }>;
    accidentsByDamageLevel: Array<{ label: string; value: number }>;
  };
  upcomingMaintenance: any[];
}

export const FleetDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('this_month');
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fleetService.getDashboardStats(selectedPeriod);
      setDashboardData(response);
    } catch (error: any) {
      console.error("Failed to fetch dashboard data:", error);
      toast.error(error.message || t('failed_to_fetch_data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod]);

  const getDamageColor = (label: string) => {
    const colorMap: { [key: string]: string } = {
      'Low': '#10B981',
      'Medium': '#F59E0B',
      'High': '#EF4444',
      'Severe': '#7F1D1D'
    };
    return colorMap[label] || '#6B7280';
  };

  const statCards = [
    { 
      title: t('active_vehicles'), 
      value: dashboardData?.cards.activeVehicles?.toLocaleString() || '0', 
      icon: Truck, 
      bgColor: 'bg-blue-50', 
      iconColor: 'text-blue-600',
      trend: '+12%',
      trendUp: true
    },
    { 
      title: t('active_drivers'), 
      value: dashboardData?.cards.activeDrivers?.toLocaleString() || '0', 
      icon: Users, 
      bgColor: 'bg-green-50', 
      iconColor: 'text-green-600',
      trend: '+5%',
      trendUp: true
    },
    { 
      title: t('vehicles_under_maintenance'), 
      value: dashboardData?.cards.vehiclesUnderMaintenance?.toLocaleString() || '0', 
      icon: Wrench, 
      bgColor: 'bg-orange-50', 
      iconColor: 'text-orange-600',
      trend: '-2%',
      trendUp: false
    },
    { 
      title: t('accidents_this_period'), 
      value: dashboardData?.cards.accidentsThisPeriod?.toLocaleString() || '0', 
      icon: AlertTriangle, 
      bgColor: 'bg-red-50', 
      iconColor: 'text-red-600',
      trend: '+8%',
      trendUp: true
    },
  ];

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          <p className="text-lg font-bold text-indigo-600">
            {payload[0].value?.toLocaleString()} EGP
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
          <p className="text-sm font-medium text-gray-900">{payload[0].name}</p>
          <p className="text-lg font-bold text-indigo-600">{payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  // Format period options for select
  const periodOptions = dashboardData?.period.options.map(opt => ({
    label: opt.label,
    value: opt.value
  })) || [
    { label: t('this_month'), value: 'this_month' },
    { label: t('this_quarter'), value: 'this_quarter' },
    { label: t('this_year'), value: 'this_year' },
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
            {t('fleet_dashboard')}
          </h1>
          <p className="text-gray-500 mt-1">
            {t('overview_of_fleet_performance')}
          </p>
        </div>
        <div className="flex gap-3">
          <Select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            options={periodOptions}
            className="w-48"
          />
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                <stat.icon size={24} className={stat.iconColor} />
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                stat.trendUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
              }`}>
                {stat.trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                <span>{stat.trend}</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fuel Cost Chart */}
        <Card className="bg-white">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Fuel size={18} className="text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900">{t('fuel_cost')}</h3>
              <Badge variant="info" className="ml-auto bg-blue-50 text-blue-700">
                {dashboardData?.period.label}
              </Badge>
            </div>
          </div>
          <div className="p-4 h-80">
            {dashboardData?.charts.fuelCostThisPeriod && dashboardData.charts.fuelCostThisPeriod.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardData.charts.fuelCostThisPeriod}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="label" tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400">{t('no_data_available')}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Maintenance Cost Chart */}
        <Card className="bg-white">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-50 rounded-lg">
                <Wrench size={18} className="text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900">{t('maintenance_cost')}</h3>
              <Badge variant="info" className="ml-auto bg-green-50 text-green-700">
                {dashboardData?.period.label}
              </Badge>
            </div>
          </div>
          <div className="p-4 h-80">
            {dashboardData?.charts.maintenanceCostThisPeriod && dashboardData.charts.maintenanceCostThisPeriod.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dashboardData.charts.maintenanceCostThisPeriod}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="label" tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={{ fill: '#10B981', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400">{t('no_data_available')}</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Accidents by Damage Level */}
        <Card className="bg-white lg:col-span-1">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-50 rounded-lg">
                <AlertTriangle size={18} className="text-red-600" />
              </div>
              <h3 className="font-bold text-gray-900">{t('accidents_by_damage_level')}</h3>
            </div>
          </div>
          <div className="p-4">
            {dashboardData?.charts.accidentsByDamageLevel && 
             dashboardData.charts.accidentsByDamageLevel.some(d => d.value > 0) ? (
              <>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dashboardData.charts.accidentsByDamageLevel}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        nameKey="label"
                      >
                        {dashboardData.charts.accidentsByDamageLevel.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getDamageColor(entry.label)} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  {dashboardData.charts.accidentsByDamageLevel.map((item, index) => (
                    item.value > 0 && (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getDamageColor(item.label) }} />
                        <span className="text-sm text-gray-600">{item.label}</span>
                        <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                      </div>
                    )
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-400">{t('no_accidents_data')}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Upcoming Maintenance */}
        <Card className="bg-white lg:col-span-2">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Calendar size={18} className="text-orange-600" />
                </div>
                <h3 className="font-bold text-gray-900">{t('upcoming_maintenance')}</h3>
              </div>
              <Badge variant="info" className="bg-orange-50 text-orange-700">
                {dashboardData?.upcomingMaintenance?.length || 0} {t('pending')}
              </Badge>
            </div>
          </div>
          <div className="p-4">
            {dashboardData?.upcomingMaintenance && dashboardData.upcomingMaintenance.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.upcomingMaintenance.map((m: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                        <Wrench size={18} className="text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{m.plateNumber || m.vehicleId}</p>
                        <p className="text-sm text-gray-500">{m.model || m.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-700">
                          {m.date ? new Date(m.date).toLocaleDateString() : t('not_scheduled')}
                        </p>
                        <p className="text-xs text-gray-400">{t('due_on')}</p>
                      </div>
                      <Badge variant="warning" className="bg-amber-50 text-amber-700">
                        {t('due_soon')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-gray-500 text-center">{t('no_upcoming_maintenance')}</p>
                <p className="text-sm text-gray-400 mt-1">{t('all_vehicles_are_in_good_condition')}</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};