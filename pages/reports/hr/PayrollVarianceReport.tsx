
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ReportLayout } from '../../../components/reports/ReportLayout';
import { Column } from '../../../components/ui/Table';
import hrService from '../../../services/hr.service';

export const PayrollVarianceReport: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const reportData = await hrService.getPayrollVarianceReport();
        setData(reportData || []);
      } catch (error) {
        console.error('Error fetching payroll variance report:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const columns: Column<any>[] = [
    { header: t('period'), accessorKey: 'period' },
    { header: t('current_payroll'), render: (e) => Number(e.currentPayroll || 0).toFixed(2) },
    { header: t('previous_payroll'), render: (e) => Number(e.previousPayroll || 0).toFixed(2) },
    { 
      header: t('variance'), 
      render: (e) => (
        <span className={`font-bold ${Number(e.variance) > 0 ? 'text-red-600' : 'text-green-600'}`}>
          {Number(e.variance || 0).toFixed(2)}
        </span>
      )
    },
    { 
      header: t('variance_percent'), 
      render: (e) => (
        <span className={`font-bold ${Number(e.variancePercent) > 0 ? 'text-red-600' : 'text-green-600'}`}>
          {Number(e.variancePercent || 0).toFixed(2)}%
        </span>
      )
    },
    { header: t('explanation'), accessorKey: 'explanation' },
  ];

  return (
    <ReportLayout
      title={t('payroll_variance_report')}
      subtitle={t('compare_payroll_costs_between periods')}
      data={data}
      columns={columns}
      isLoading={isLoading}
      filename="payroll_variance_report"
    />
  );
};
