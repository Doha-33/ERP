
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ReportLayout } from '../../../components/reports/ReportLayout';
import { Column } from '../../../components/ui/Table';
import hrService from '../../../services/hr.service';

export const HeadcountGrowthReport: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const reportData = await hrService.getHeadcountGrowthReport();
        setData(reportData || []);
      } catch (error) {
        console.error('Error fetching headcount growth report:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const columns: Column<any>[] = [
    { header: t('period'), accessorKey: 'period' },
    { header: t('total_headcount'), accessorKey: 'totalHeadcount' },
    { header: t('new_hires'), accessorKey: 'newHires' },
    { header: t('separations'), accessorKey: 'separations' },
    { 
      header: t('growth_rate'), 
      render: (e) => (
        <span className={`font-bold ${Number(e.growthRate) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {Number(e.growthRate || 0).toFixed(2)}%
        </span>
      )
    },
    { header: t('contractors'), accessorKey: 'contractors' },
    { header: t('full_time'), accessorKey: 'fullTime' },
  ];

  return (
    <ReportLayout
      title={t('headcount_growth_report')}
      subtitle={t('track_headcount_changes_over_time')}
      data={data}
      columns={columns}
      isLoading={isLoading}
      filename="headcount_growth_report"
    />
  );
};
