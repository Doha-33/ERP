
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ReportLayout } from '../../../components/reports/ReportLayout';
import { Column } from '../../../components/ui/Table';
import { Badge } from '../../../components/ui/Common';
import hrService from '../../../services/hr.service';

export const HiringReport: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const reportData = await hrService.getHiringReport();
        setData(reportData || []);
      } catch (error) {
        console.error('Error fetching hiring report:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const columns: Column<any>[] = [
    { header: t('period'), accessorKey: 'period' },
    { header: t('total_applications'), accessorKey: 'applications' },
    { header: t('interviews_conducted'), accessorKey: 'interviews' },
    { header: t('offers_made'), accessorKey: 'offers' },
    { header: t('hires_confirmed'), accessorKey: 'hires' },
    { 
      header: t('conversion_rate'), 
      render: (e) => `${Number(e.conversionRate || 0).toFixed(2)}%`
    },
    { 
      header: t('time_to_hire'), 
      render: (e) => `${e.avgTimeToHire} ${t('days')}`
    },
    { 
      header: t('status'), 
      render: (e) => (
        <Badge variant={e.status === 'Completed' ? 'success' : 'warning'}>
          {t((e.status || 'ongoing').toLowerCase())}
        </Badge>
      )
    },
  ];

  return (
    <ReportLayout
      title={t('hiring_and_recruitment_report')}
      subtitle={t('monitor_hiring_performance_and_metrics')}
      data={data}
      columns={columns}
      isLoading={isLoading}
      filename="hiring_report"
    />
  );
};
