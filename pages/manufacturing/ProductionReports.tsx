import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
  FileText, 
  Download, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  AlertTriangle,
  CheckCircle2,
  BarChart2,
  Loader2,
  Calendar,
  Package,
  DollarSign
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
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { ReportCard } from '../../components/manufacturing/ReportCard';
import {manufacturingService} from '../../services/manufacturing.service';
import { ProductionReport as PRType } from '../../types';
import { toast } from 'sonner';

export const ProductionReports: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<PRType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await manufacturingService.getProductionReports();
      setReports(data);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      toast.error(t('failed_to_fetch_reports'));
    } finally {
      setLoading(false);
    }
  };

  const latestReport = reports[0] || {} as PRType;

  // Aggregate statistics
  const totalProductionCost = reports.reduce((sum, r) => sum + (r.total_production_cost || 0), 0);
  const avgCompletion = reports.length > 0 
    ? Math.round(reports.reduce((sum, r) => sum + (r.completion || 0), 0) / reports.length)
    : 0;
  const totalMaterialCost = reports.reduce((sum, r) => sum + (r.material_cost || 0), 0);
  const totalScrapQty = reports.reduce((sum, r) => sum + (r.scrap_qty || 0), 0);
  const totalProduced = reports.reduce((sum, r) => sum + (r.produced_qty || 0), 0);
  const totalPlanned = reports.reduce((sum, r) => sum + (r.planned_qty || 0), 0);

  // Mock data for charts (in real implementation, this would come from API)
  const monthlyProduction = [
    { month: t('jan'), completed: 450, planned: 500 },
    { month: t('feb'), completed: 520, planned: 500 },
    { month: t('mar'), completed: 480, planned: 550 },
    { month: t('apr'), completed: 610, planned: 600 },
    { month: t('may'), completed: 590, planned: 600 },
    { month: t('jun'), completed: 650, planned: 650 },
  ];

  const efficiencyData = [
    { name: t('efficient'), value: 65, color: '#10B981' },
    { name: t('average'), value: 25, color: '#F59E0B' },
    { name: t('inefficient'), value: 10, color: '#EF4444' },
  ];

  const filteredReports = reports.filter((report) =>
    report.mo_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.finished_product?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.responsible?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const reportCards = [
    {
      title: t('total_production_cost'),
      value: `${totalProductionCost.toLocaleString()} EGP`,
      trend: "up" as const,
      trendValue: "15.4",
      icon: BarChart2,
      color: "bg-blue-50 text-blue-600"
    },
    {
      title: t('avg_completion'),
      value: `${avgCompletion}%`,
      trend: "up" as const,
      trendValue: "2.1",
      icon: CheckCircle2,
      color: "bg-green-50 text-green-600"
    },
    {
      title: t('material_cost'),
      value: `${totalMaterialCost.toLocaleString()} EGP`,
      trend: "down" as const,
      trendValue: "8.5",
      icon: Clock,
      color: "bg-orange-50 text-orange-600"
    },
    {
      title: t('scrap_qty'),
      value: totalScrapQty.toLocaleString(),
      trend: "up" as const,
      trendValue: "12.2",
      icon: AlertTriangle,
      color: "bg-red-50 text-red-600"
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('production_reports')}
          </h1>
          <p className="text-gray-500 mt-1">
            {t('analyze_mfg_performance')}
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="secondary" 
            onClick={fetchReports}
            className="border-gray-200"
          >
            <Filter size={18} />
            {t('refresh')}
          </Button>
          <Button 
            variant="secondary" 
            className="border-gray-200"
          >
            <Download size={18} />
            {t('export_report')}
          </Button>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportCards.map((card, index) => (
          <ReportCard key={index} {...card} />
        ))}
      </div>

      {/* Secondary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <Package size={18} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("total_produced")}</p>
              <p className="text-xl font-bold text-gray-900">{totalProduced.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Calendar size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("total_planned")}</p>
              <p className="text-xl font-bold text-gray-900">{totalPlanned.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <DollarSign size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("cost_per_unit")}</p>
              <p className="text-xl font-bold text-gray-900">
                {totalProduced > 0 ? Math.round(totalProductionCost / totalProduced).toLocaleString() : 0} EGP
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Production Trend */}
        <Card className="bg-white p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <BarChart2 size={18} className="text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{t('monthly_production_trend')}</h3>
          </div>
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
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', backgroundColor: 'white' }}
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

        {/* Latest Report Summary */}
        <Card className="bg-white p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-green-50 rounded-lg">
              <FileText size={18} className="text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{t('latest_report_summary')}</h3>
          </div>
          <div className="flex-1 space-y-4">
            {latestReport.summary ? (
              <div className="p-4 bg-gray-50 rounded-xl italic text-gray-600 border border-gray-100">
                "{latestReport.summary}"
              </div>
            ) : (
              <div className="text-gray-400 italic p-4 text-center">{t('no_summary_available')}</div>
            )}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="p-4 border border-gray-100 rounded-xl bg-gray-50">
                <p className="text-xs text-gray-500 uppercase mb-1">{t('mo_number')}</p>
                <p className="font-semibold text-gray-900">{latestReport.mo_number || '-'}</p>
              </div>
              <div className="p-4 border border-gray-100 rounded-xl bg-gray-50">
                <p className="text-xs text-gray-500 uppercase mb-1">{t('responsible')}</p>
                <p className="font-semibold text-gray-900 truncate">{latestReport.responsible || '-'}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Efficiency Pie Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-white p-6 lg:col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-purple-50 rounded-lg">
              <PieChart className="text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{t('efficiency_distribution')}</h3>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={efficiencyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="name"
                >
                  {efficiencyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {efficiencyData.map((item, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-gray-600">{item.name}</span>
                <span className="text-sm font-semibold text-gray-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Production Efficiency Tips */}
        <Card className="bg-white p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-amber-50 rounded-lg">
              <AlertTriangle size={18} className="text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{t('production_insights')}</h3>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-xl border border-green-100">
              <p className="text-sm font-medium text-green-800 mb-1">✓ {t('improvement_tip_1')}</p>
              <p className="text-xs text-green-600">{t('improvement_tip_1_desc')}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-sm font-medium text-blue-800 mb-1">✓ {t('improvement_tip_2')}</p>
              <p className="text-xs text-blue-600">{t('improvement_tip_2_desc')}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
              <p className="text-sm font-medium text-purple-800 mb-1">✓ {t('improvement_tip_3')}</p>
              <p className="text-xs text-purple-600">{t('improvement_tip_3_desc')}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Reports Table */}
      <Card className="bg-white p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gray-100 rounded-lg">
              <FileText size={18} className="text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{t('detailed_production_reports_list')}</h3>
          </div>
          <Input
            placeholder={t('search_reports_placeholder')}
            icon={<Filter size={18} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
            fullWidth={false}
          />
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="animate-spin text-gray-400" size={24} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left text-sm font-medium text-gray-500 px-4 py-2">{t('mo_number')}</th>
                  <th className="text-left text-sm font-medium text-gray-500 px-4 py-2">{t('finished_product')}</th>
                  <th className="text-left text-sm font-medium text-gray-500 px-4 py-2">{t('responsible')}</th>
                  <th className="text-left text-sm font-medium text-gray-500 px-4 py-2">{t('completion')}</th>
                  <th className="text-left text-sm font-medium text-gray-500 px-4 py-2">{t('production_cost')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr key={report._id} className="border-t hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-900">{report.mo_number}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{report.finished_product}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{report.responsible}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{report.completion}%</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{report.total_production_cost ? `${report.total_production_cost.toLocaleString()} EGP` : '-'}</td>
                  </tr>
                ))}
                {filteredReports.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-sm text-gray-500 py-4">
                      {t('no_reports_found')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

      </Card>
    </div>
  );
};