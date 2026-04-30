
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ReportLayout } from '../../../components/reports/ReportLayout';
import { Column } from '../../../components/ui/Table';
import hrService from '../../../services/hr.service';

export const TurnoverReport: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const reportData = await hrService.getTurnoverReport();
        setData(reportData || []);
      } catch (error) {
        console.error('Error fetching turnover report:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const columns: Column<any>[] = [
    { header: t('period'), accessorKey: 'period' },
    { header: t('starting_headcount'), accessorKey: 'startingHeadcount' },
    { header: t('ending_headcount'), accessorKey: 'endingHeadcount' },
    { header: t('total_separations'), accessorKey: 'separations' },
    { 
      header: t('turnover_rate'), 
      render: (e) => (
        <span className="font-bold">
          {Number(e.turnoverRate || 0).toFixed(2)}%
        </span>
      )
    },
    { header: t('voluntary_turnover'), render: (e) => `${Number(e.voluntaryRate || 0).toFixed(2)}%` },
    { header: t('involuntary_turnover'), render: (e) => `${Number(e.involuntaryRate || 0).toFixed(2)}%` },
  ];

  return (
    <ReportLayout
      title={t('turnover_report')}
      subtitle={t('analyze_employee_turnover_rates_and_trends')}
      data={data}
      columns={columns}
      isLoading={isLoading}
      filename="turnover_report"
    />
  );
};
