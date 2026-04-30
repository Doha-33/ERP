
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ReportLayout } from '../../../components/reports/ReportLayout';
import { Column } from '../../../components/ui/Table';
import hrService from '../../../services/hr.service';

export const SalaryTrendReport: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const reportData = await hrService.getSalaryTrendReport();
        setData(reportData || []);
      } catch (error) {
        console.error('Error fetching salary trend report:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const columns: Column<any>[] = [
    { header: t('period'), accessorKey: 'period' },
    { header: t('average_salary'), render: (e) => Number(e.avgSalary || 0).toFixed(2) },
    { header: t('median_salary'), render: (e) => Number(e.medianSalary || 0).toFixed(2) },
    { header: t('total_payroll'), render: (e) => Number(e.totalPayroll || 0).toFixed(2) },
    { 
      header: t('percentage_change'), 
      render: (e) => (
        <span className={`font-bold ${Number(e.percentChange) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {Number(e.percentChange || 0).toFixed(2)}%
        </span>
      )
    },
    { header: t('high_salary'), render: (e) => Number(e.maxSalary || 0).toFixed(2) },
    { header: t('low_salary'), render: (e) => Number(e.minSalary || 0).toFixed(2) },
  ];

  return (
    <ReportLayout
      title={t('salary_trend_report')}
      subtitle={t('analyze_salary_changes_and_averages_over_time')}
      data={data}
      columns={columns}
      isLoading={isLoading}
      filename="salary_trend_report"
    />
  );
};
