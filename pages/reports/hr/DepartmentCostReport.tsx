
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ReportLayout } from '../../../components/reports/ReportLayout';
import { Column } from '../../../components/ui/Table';
import hrService from '../../../services/hr.service';

export const DepartmentCostReport: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const reportData = await hrService.getDepartmentCostReport();
        setData(reportData || []);
      } catch (error) {
        console.error('Error fetching department cost report:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const columns: Column<any>[] = [
    { header: t('department_name'), accessorKey: 'departmentName' },
    { header: t('headcount'), accessorKey: 'headcount' },
    { header: t('total_salary'), render: (e) => Number(e.totalSalary || 0).toFixed(2) },
    { header: t('total_allowances'), render: (e) => Number(e.totalAllowances || 0).toFixed(2) },
    { header: t('total_benefits'), render: (e) => Number(e.totalBenefits || 0).toFixed(2) },
    { header: t('total_cost'), render: (e) => Number(e.totalCost || 0).toFixed(2) },
    { 
      header: t('cost_percentage'), 
      render: (e) => `${Number(e.costPercent || 0).toFixed(2)}%`
    },
  ];

  return (
    <ReportLayout
      title={t('department_cost_report')}
      subtitle={t('view_total_hr_costs_per_department')}
      data={data}
      columns={columns}
      isLoading={isLoading}
      filename="department_cost_report"
    />
  );
};
