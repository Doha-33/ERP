import React from 'react';
import { useTranslation } from 'react-i18next';
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
  Activity
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
  Cell
} from 'recharts';

const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
  <Card className="p-6">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
        <h3 className="text-2xl font-bold mt-1 dark:text-white">{value}</h3>
        {trend && (
          <p className={`text-xs mt-2 flex items-center gap-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp size={12} className={trend < 0 ? 'rotate-180' : ''} />
            {Math.abs(trend)}% {trend > 0 ? 'increase' : 'decrease'}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={24} />
      </div>
    </div>
  </Card>
);

export const ManufacturingDashboard: React.FC = () => {
  const { t } = useTranslation();

  const productionData = [
    { name: 'Mon', target: 100, actual: 95 },
    { name: 'Tue', target: 100, actual: 105 },
    { name: 'Wed', target: 100, actual: 98 },
    { name: 'Thu', target: 100, actual: 110 },
    { name: 'Fri', target: 100, actual: 115 },
    { name: 'Sat', target: 50, actual: 45 },
    { name: 'Sun', target: 0, actual: 0 },
  ];

  const orderStatusData = [
    { name: 'Done', value: 45, color: '#10B981' },
    { name: 'In Progress', value: 25, color: '#F59E0B' },
    { name: 'Confirmed', value: 20, color: '#3B82F6' },
    { name: 'Draft', value: 10, color: '#6B7280' },
  ];

  const efficiencyData = [
    { time: '08:00', efficiency: 85 },
    { time: '10:00', efficiency: 92 },
    { time: '12:00', efficiency: 88 },
    { time: '14:00', efficiency: 95 },
    { time: '16:00', efficiency: 90 },
    { time: '18:00', efficiency: 82 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('manufacturing_dashboard')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('mfg_overview_desc')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={t('active_orders')} 
          value="24" 
          icon={ClipboardList} 
          trend={12}
          color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        />
        <StatCard 
          title={t('production_efficiency')} 
          value="94.2%" 
          icon={Activity} 
          trend={2.5}
          color="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
        />
        <StatCard 
          title={t('work_centers_active')} 
          value="10/12" 
          icon={Building2} 
          color="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
        />
        <StatCard 
          title={t('pending_requirements')} 
          value="8" 
          icon={AlertCircle} 
          trend={-5}
          color="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6 dark:text-white">{t('production_target_vs_actual')}</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="target" fill="#93C5FD" radius={[4, 4, 0, 0]} name={t('target')} />
                <Bar dataKey="actual" fill="#3B82F6" radius={[4, 4, 0, 0]} name={t('actual')} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6 dark:text-white">{t('real_time_efficiency')}</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={efficiencyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-1">
          <h3 className="text-lg font-semibold mb-6 dark:text-white">{t('order_status_distribution')}</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {orderStatusData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t(item.name.toLowerCase().replace(' ', '_'))}</span>
                </div>
                <span className="text-sm font-semibold dark:text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-6 dark:text-white">{t('recent_manufacturing_orders')}</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                    <Package size={20} />
                  </div>
                  <div>
                    <p className="font-medium dark:text-white">MO/2024/00{i}</p>
                    <p className="text-sm text-gray-500">Laptop Lenovo X1 Carbon</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-right">
                  <div>
                    <p className="text-sm font-medium dark:text-white">50 Units</p>
                    <p className="text-xs text-gray-500">Due: 2024-03-2{i}</p>
                  </div>
                  <Badge variant={i % 2 === 0 ? 'warning' : 'success'}>
                    {i % 2 === 0 ? t('in_progress') : t('done')}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
