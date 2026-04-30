import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
  LayoutDashboard, 
  ClipboardList, 
  Wrench, 
  Building2, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Package,
  Activity,
  Loader2,
  Target,
  Zap
} from 'lucide-react';
import { Card, Badge } from '../../components/ui/Common';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { ManufacturingStatCard } from '../../components/manufacturing/ManufacturingStatCard';
import {manufacturingService} from '../../services/manufacturing.service';
import { ManufacturingOrder, WorkCenter, MaterialRequirement, ProductionReport } from '../../types';
import { toast } from 'sonner';

export const ManufacturingDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    orders: [] as ManufacturingOrder[],
    workCenters: [] as WorkCenter[],
    requirements: [] as MaterialRequirement[],
    reports: [] as ProductionReport[],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [orders, workCenters, requirements, reports] = await Promise.all([
        manufacturingService.getManufacturingOrders(),
        manufacturingService.getWorkCenters(),
        manufacturingService.getMaterialRequirements(),
        manufacturingService.getProductionReports(),
      ]);
      setData({ orders, workCenters, requirements, reports });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error(t('failed_to_fetch_dashboard'));
    } finally {
      setLoading(false);
    }
  };

  const activeOrders = data.orders.filter(o => o.state === 'In Progress' || o.state === 'Confirmed');
  const activeWCs = data.workCenters.filter(wc => wc.state === 'Active');
  const latestReport = (data.reports[0] || {}) as ProductionReport;
  const pendingReqs = data.requirements.filter(r => (r.required_qty || 0) > (r.available_qty || 0));
  
  // Calculate total produced vs planned
  const totalProduced = data.reports.reduce((sum, r) => sum + (r.produced_qty || 0), 0);
  const totalPlanned = data.reports.reduce((sum, r) => sum + (r.planned_qty || 0), 0);
  const overallCompletion = totalPlanned > 0 ? Math.round((totalProduced / totalPlanned) * 100) : 0;

  // Order status distribution
  const orderStatusCounts = data.orders.reduce((acc, order) => {
    const status = order.state || 'Unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const orderStatusData = Object.entries(orderStatusCounts).map(([name, value]) => ({
    name: t(name.toLowerCase().replace(' ', '_')),
    originalName: name,
    value: Math.round((value / (data.orders.length || 1)) * 100),
    count: value,
    color: name === 'Completed' || name === 'Done' ? '#10B981' 
          : name === 'In Progress' ? '#F59E0B' 
          : name === 'Confirmed' ? '#3B82F6'
          : name === 'Cancelled' ? '#EF4444'
          : '#94A3B8'
  }));

  // Production data for chart
  const productionData = [
    { name: t('mon'), target: 100, actual: 95 },
    { name: t('tue'), target: 100, actual: 105 },
    { name: t('wed'), target: 100, actual: 98 },
    { name: t('thu'), target: 100, actual: 110 },
    { name: t('fri'), target: 100, actual: 115 },
    { name: t('sat'), target: 50, actual: 45 },
    { name: t('sun'), target: 0, actual: 0 },
  ];

  // Efficiency data
  const efficiencyData = [
    { time: '08:00', efficiency: 85 },
    { time: '10:00', efficiency: 92 },
    { time: '12:00', efficiency: 88 },
    { time: '14:00', efficiency: 95 },
    { time: '16:00', efficiency: 90 },
    { time: '18:00', efficiency: 82 },
  ];

  // Weekly production trend
  const weeklyTrend = [
    { day: t('mon'), value: 450 },
    { day: t('tue'), value: 520 },
    { day: t('wed'), value: 480 },
    { day: t('thu'), value: 610 },
    { day: t('fri'), value: 590 },
    { day: t('sat'), value: 320 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="animate-spin text-indigo-600 h-12 w-12 mx-auto mb-4" />
          <p className="text-gray-500">{t('loading_dashboard')}...</p>
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
            {t('manufacturing_dashboard')}
          </h1>
          <p className="text-gray-500 mt-1">
            {t('mfg_overview_desc')}
          </p>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Loader2 size={16} className={loading ? "animate-spin" : ""} />
          {t('refresh')}
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <ManufacturingStatCard 
          title={t('active_orders')} 
          value={activeOrders.length} 
          icon={ClipboardList} 
          trend={12}
          color="bg-blue-50 text-blue-600"
        />
        <ManufacturingStatCard 
          title={t('production_efficiency')} 
          value={`${latestReport.avg_efficiency || '94.2'}%`} 
          icon={Activity} 
          trend={2.5}
          color="bg-green-50 text-green-600"
        />
        <ManufacturingStatCard 
          title={t('work_centers_active')} 
          value={`${activeWCs.length}/${data.workCenters.length}`} 
          icon={Building2} 
          color="bg-purple-50 text-purple-600"
        />
        <ManufacturingStatCard 
          title={t('pending_requirements')} 
          value={pendingReqs.length} 
          icon={AlertCircle} 
          trend={-5}
          color="bg-orange-50 text-orange-600"
        />
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Target size={18} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t('overall_completion')}</p>
              <p className="text-xl font-bold text-gray-900">{overallCompletion}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <Package size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t('total_produced_units')}</p>
              <p className="text-xl font-bold text-gray-900">{totalProduced.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <Zap size={18} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t('active_work_orders')}</p>
              <p className="text-xl font-bold text-gray-900">{data.orders.filter(o => o.state === 'In Progress').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Production Target vs Actual */}
        <Card className="bg-white p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Target size={18} className="text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{t('production_target_vs_actual')}</h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', backgroundColor: 'white' }}
                />
                <Bar dataKey="target" fill="#93C5FD" radius={[4, 4, 0, 0]} name={t('target')} />
                <Bar dataKey="actual" fill="#3B82F6" radius={[4, 4, 0, 0]} name={t('actual')} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Real Time Efficiency */}
        <Card className="bg-white p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-green-50 rounded-lg">
              <Activity size={18} className="text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{t('real_time_efficiency')}</h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={efficiencyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', backgroundColor: 'white' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="efficiency" 
                  stroke="#10B981" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#10B981' }}
                  activeDot={{ r: 6 }}
                  name={t('efficiency')}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Weekly Production Trend */}
      <Card className="bg-white p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-purple-50 rounded-lg">
            <TrendingUp size={18} className="text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{t('weekly_production_trend')}</h3>
        </div>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyTrend}>
              <defs>
                <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', backgroundColor: 'white' }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#8B5CF6" 
                fill="url(#colorTrend)" 
                strokeWidth={2}
                name={t('production_units')}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Status Distribution */}
        <Card className="bg-white p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <PieChart className="text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{t('order_status_distribution')}</h3>
          </div>
          {data.orders.length > 0 ? (
            <>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name, props) => [`${value}%`, props.payload.originalName]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {orderStatusData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-gray-600">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-900">{item.value}%</span>
                      <span className="text-xs text-gray-400">({item.count})</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-400">
              {t('no_orders_yet')}
            </div>
          )}
        </Card>

        {/* Recent Manufacturing Orders */}
        <Card className="bg-white p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg">
              <ClipboardList size={18} className="text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{t('recent_manufacturing_orders')}</h3>
          </div>
          <div className="space-y-3">
            {data.orders.slice(0, 5).map((order) => (
              <div key={order._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Package size={20} className="text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{order.product_name}</p>
                    <p className="text-sm text-gray-500">BOM: {order.bom_used}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{order.planned_quantity} Units</p>
                    <p className="text-xs text-gray-500">
                      {t('due')}: {new Date(order.end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge 
                    variant={
                      order.state === 'Completed' || order.state === 'Done' ? 'success' 
                      : order.state === 'In Progress' ? 'warning'
                      : order.state === 'Confirmed' ? 'info'
                      : order.state === 'Cancelled' ? 'danger'
                      : 'neutral'
                    }
                  >
                    {t(order.state?.toLowerCase().replace(' ', '_') || 'unknown')}
                  </Badge>
                </div>
              </div>
            ))}
            {data.orders.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                {t('no_orders_available')}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};