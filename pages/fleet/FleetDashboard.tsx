import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Truck, 
  Users, 
  Fuel, 
  Wrench, 
  AlertTriangle, 
  TrendingUp, 
  Calendar,
  DollarSign,
  MapPin
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
import { Card, StatCard, Select, Badge } from '../../components/ui/Common';

export const FleetDashboard: React.FC = () => {
  const { t } = useTranslation();

  const stats = [
    { title: t('active_vehicles'), value: '45', icon: Truck, color: 'blue' },
    { title: t('active_drivers'), value: '42', icon: Users, color: 'green' },
    { title: t('vehicles_under_maintenance'), value: '3', icon: Wrench, color: 'orange' },
    { title: t('accidents_this_month'), value: '2', icon: AlertTriangle, color: 'red' },
  ];

  const fuelData = [
    { name: 'Week 1', cost: 12000 },
    { name: 'Week 2', cost: 15000 },
    { name: 'Week 3', cost: 11000 },
    { name: 'Week 4', cost: 18000 },
  ];

  const accidentData = [
    { name: t('low'), value: 5, color: '#10B981' },
    { name: t('medium'), value: 2, color: '#F59E0B' },
    { name: t('high'), value: 1, color: '#EF4444' },
  ];

  const maintenanceData = [
    { name: 'Jan', cost: 25000 },
    { name: 'Feb', cost: 32000 },
    { name: 'Mar', cost: 28000 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('fleet_dashboard')}</h1>
          <p className="text-gray-500">{t('overview_of_fleet_performance')}</p>
        </div>
        <div className="flex gap-3">
          <Select
            options={[
              { label: t('this_month'), value: 'month' },
              { label: t('this_quarter'), value: 'quarter' },
              { label: t('this_year'), value: 'year' },
            ]}
            className="w-40"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={<stat.icon size={24} />}
            color={stat.color === 'red' ? 'orange' : stat.color as any}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">{t('fuel_cost_this_month')}</h3>
          </div>
          <div className="p-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fuelData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cost" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">{t('maintenance_cost_this_month')}</h3>
          </div>
          <div className="p-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={maintenanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="cost" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">{t('accidents_by_damage_level')}</h3>
          </div>
          <div className="p-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={accidentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {accidentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              {accidentData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">{t('upcoming_maintenance')}</h3>
          </div>
          <div className="p-4 space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <Wrench size={18} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">V-00{item} (Toyota Corolla)</p>
                    <p className="text-xs text-gray-500">Oil Change • Due in 3 days</p>
                  </div>
                </div>
                <Badge variant="warning">{t('due_soon')}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
