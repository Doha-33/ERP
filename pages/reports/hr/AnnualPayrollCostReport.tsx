
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ReportLayout } from '../../../components/reports/ReportLayout';
import { Column } from '../../../components/ui/Table';
import hrService from '../../../services/hr.service';

export const AnnualPayrollCostReport: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const reportData = await hrService.getAnnualPayrollCostReport();
        setData(reportData || []);
      } catch (error) {
        console.error('Error fetching annual payroll cost report:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const columns: Column<any>[] = [
    { header: t('department_name'), accessorKey: 'departmentName' },
    { header: t('total_base_salary'), render: (d) => Number(d.totalBase || 0).toFixed(2) },
    { header: t('total_allowances'), render: (d) => Number(d.totalAllowances || 0).toFixed(2) },
    { header: t('total_bonuses'), render: (d) => Number(d.totalBonuses || 0).toFixed(2) },
    { header: t('total_deductions'), render: (d) => Number(d.totalDeductions || 0).toFixed(2) },
    { header: t('net_payroll_cost'), render: (d) => Number(d.netPayrollCost || 0).toFixed(2) },
  ];

  return (
    <ReportLayout
      title={t('annual_payroll_cost_by_department')}
      subtitle={t('view_payroll_costs_grouped_by_department')}
      data={data}
      columns={columns}
      isLoading={isLoading}
      filename="annual_payroll_cost_report"
    />
  );
};
