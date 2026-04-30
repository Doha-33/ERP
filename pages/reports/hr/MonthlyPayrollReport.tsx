
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ReportLayout } from '../../../components/reports/ReportLayout';
import { Column } from '../../../components/ui/Table';
import hrService from '../../../services/hr.service';

export const MonthlyPayrollReport: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const reportData = await hrService.getMonthlyPayrollReport();
        setData(reportData || []);
      } catch (error) {
        console.error('Error fetching monthly payroll report:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter(p => {
      const matchesSearch = (p.employeeName || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMonth = selectedMonth === 0 || p.month === selectedMonth;
      return matchesSearch && matchesMonth;
    });
  }, [data, searchTerm, selectedMonth]);

  const columns: Column<any>[] = [
    { header: t('date'), render: (p) => p.report_date || new Date().toLocaleDateString() },
    { header: t('employee_id'), accessorKey: 'employeeCode' },
    { 
      header: t('employee_name'), 
      render: (p) => (
        <div className="flex items-center gap-2">
          {p.avatar && <img src={p.avatar} alt={p.employeeName} className="w-8 h-8 rounded-full object-cover" />}
          <span className="font-bold">{p.employeeName}</span>
        </div>
      )
    },
    { header: t('base_salary'), render: (p) => Number(p.basicSalary || 0).toFixed(2) },
    { 
      header: t('allowances'), 
      render: (p) => Number(p.totalAllowances || 0).toFixed(2)
    },
    { header: t('bonuses'), render: (p) => Number(p.bonus || 0).toFixed(2) },
    { header: t('deductions'), render: (p) => Number(p.totalDeductions || 0).toFixed(2) },
    { header: t('net_salary'), render: (p) => Number(p.netSalary || 0).toFixed(2) },
    { header: t('payroll_month'), render: (p) => `${p.month}/${p.year}` },
  ];

  return (
    <ReportLayout
      title={t('monthly_payroll_report')}
      subtitle={t('view_payroll_details_by_month')}
      data={filteredData}
      columns={columns}
      isLoading={isLoading}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder={t('search_by_name')}
      filename="monthly_payroll_report"
      filters={
        <select 
          className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
        >
          <option value="0">{t('all_months')}</option>
          {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
            <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('default', { month: 'long' })}</option>
          ))}
        </select>
      }
    />
  );
};
