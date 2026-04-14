import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FileText, 
  Download, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  AlertTriangle,
  CheckCircle2,
  BarChart2
} from 'lucide-react';
import { Card, Button, Select, Input, Badge } from '../../components/ui/Common';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area
} from 'recharts';

const ReportCard = ({ title, value, trend, trendValue, icon: Icon, color }: any) => (
  <Card className="p-6">
    <div className="flex justify-between items-start">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={24} />
      </div>
      <div className={`flex items-center gap-1 text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
        {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        {trendValue}%
      </div>
    </div>
    <div className="mt-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <h3 className="text-2xl font-bold mt-1 dark:text-white">{value}</h3>
    </div>
  </Card>
);

export const ProductionReports: React.FC = () => {
  const { t } = useTranslation();

  const monthlyProduction = [
    { month: 'Jan', completed: 450, planned: 500 },
    { month: 'Feb', completed: 520, planned: 500 },
    { month: 'Mar', completed: 480, planned: 550 },
    { month: 'Apr', completed: 610, planned: 600 },
    { month: 'May', completed: 590, planned: 600 },
    { month: 'Jun', completed: 650, planned: 650 },
  ];

  const downtimeData = [
    { day: 'Mon', mechanical: 45, electrical: 20, other: 10 },
    { day: 'Tue', mechanical: 30, electrical: 15, other: 5 },
    { day: 'Wed', mechanical: 60, electrical: 40, other: 15 },
    { day: 'Thu', mechanical: 20, electrical: 10, other: 5 },
    { day: 'Fri', mechanical: 35, electrical: 25, other: 10 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('production_reports')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('analyze_mfg_performance')}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary">
            <Filter size={18} />
            {t('filters')}
          </Button>
          <Button variant="primary">
            <Download size={18} />
            {t('export_report')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ReportCard 
          title={t('total_production')} 
          value="12,450 Units" 
          trend="up" 
          trendValue="15.4" 
          icon={BarChart2}
          color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        />
        <ReportCard 
          title={t('on_time_delivery')} 
          value="98.2%" 
          trend="up" 
          trendValue="2.1" 
          icon={CheckCircle2}
          color="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
        />
        <ReportCard 
          title={t('average_downtime')} 
          value="1.4 hrs/day" 
          trend="down" 
          trendValue="8.5" 
          icon={Clock}
          color="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
        />
        <ReportCard 
          title={t('quality_rejects')} 
          value="0.8%" 
          trend="down" 
          trendValue="12.2" 
          icon={AlertTriangle}
          color="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6 dark:text-white">{t('monthly_production_trend')}</h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyProduction}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="top" align="right" iconType="circle" />
                <Area 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="#3B82F6" 
                  fillOpacity={1} 
                  fill="url(#colorCompleted)" 
                  strokeWidth={3}
                  name={t('completed')}
                />
                <Area 
                  type="monotone" 
                  dataKey="planned" 
                  stroke="#94A3B8" 
                  fill="transparent" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name={t('planned')}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6 dark:text-white">{t('downtime_analysis_by_type')}</h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={downtimeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="top" align="right" iconType="circle" />
                <Bar dataKey="mechanical" stackId="a" fill="#3B82F6" radius={[0, 0, 0, 0]} name={t('mechanical')} />
                <Bar dataKey="electrical" stackId="a" fill="#F59E0B" radius={[0, 0, 0, 0]} name={t('electrical')} />
                <Bar dataKey="other" stackId="a" fill="#6B7280" radius={[4, 4, 0, 0]} name={t('other')} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6 dark:text-white">{t('detailed_production_logs')}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="py-4 px-4 font-semibold text-sm text-gray-600 dark:text-gray-400">{t('date')}</th>
                <th className="py-4 px-4 font-semibold text-sm text-gray-600 dark:text-gray-400">{t('work_center')}</th>
                <th className="py-4 px-4 font-semibold text-sm text-gray-600 dark:text-gray-400">{t('product')}</th>
                <th className="py-4 px-4 font-semibold text-sm text-gray-600 dark:text-gray-400">{t('output')}</th>
                <th className="py-4 px-4 font-semibold text-sm text-gray-600 dark:text-gray-400">{t('efficiency')}</th>
                <th className="py-4 px-4 font-semibold text-sm text-gray-600 dark:text-gray-400">{t('status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="py-4 px-4 text-sm dark:text-gray-300">2024-03-2{i}</td>
                  <td className="py-4 px-4 text-sm dark:text-gray-300">Assembly Line {i}</td>
                  <td className="py-4 px-4 text-sm dark:text-gray-300 font-medium">Laptop Lenovo X1</td>
                  <td className="py-4 px-4 text-sm dark:text-gray-300">120 Units</td>
                  <td className="py-4 px-4 text-sm dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden min-w-[60px]">
                        <div 
                          className="h-full bg-green-500" 
                          style={{ width: `${90 + i}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium">{90 + i}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm">
                    <Badge variant="success">{t('completed')}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
