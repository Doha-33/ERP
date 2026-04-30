
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ReportLayout } from '../../../components/reports/ReportLayout';
import { Column } from '../../../components/ui/Table';
import { Badge } from '../../../components/ui/Common';
import hrService from '../../../services/hr.service';

export const DocumentsExpiryReport: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const reportData = await hrService.getDocumentsExpiryReport();
        setData(reportData || []);
      } catch (error) {
        console.error('Error fetching documents expiry report:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter(e => (e.employeeName || '').toLowerCase().includes(searchTerm.toLowerCase()));
  }, [data, searchTerm]);

  const columns: Column<any>[] = [
    { header: t('employee_id'), accessorKey: 'employeeCode' },
    { 
      header: t('employee_name'), 
      render: (e) => (
        <div className="flex items-center gap-2">
          {e.avatar && <img src={e.avatar} alt={e.employeeName} className="w-8 h-8 rounded-full object-cover" />}
          <span className="font-bold">{e.employeeName}</span>
        </div>
      )
    },
    { header: t('document_type'), accessorKey: 'documentType' },
    { header: t('document_number'), accessorKey: 'documentNumber' },
    { header: t('expiry_date'), accessorKey: 'expiryDate' },
    { 
      header: t('days_remaining'), 
      render: (e) => (
        <span className={Number(e.daysRemaining) < 30 ? 'text-red-600 font-bold' : ''}>
          {e.daysRemaining} {t('days')}
        </span>
      )
    },
    { 
      header: t('state'), 
      render: (e) => (
        <Badge variant={Number(e.daysRemaining) < 0 ? 'danger' : Number(e.daysRemaining) < 30 ? 'warning' : 'success'}>
          {Number(e.daysRemaining) < 0 ? t('expired') : Number(e.daysRemaining) < 30 ? t('expiring_soon') : t('active')}
        </Badge>
      )
    },
  ];

  return (
    <ReportLayout
      title={t('documents_expiry_report')}
      subtitle={t('view_employee_documents_nearing_expiration')}
      data={filteredData}
      columns={columns}
      isLoading={isLoading}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder={t('search_by_name')}
      filename="documents_expiry_report"
    />
  );
};
