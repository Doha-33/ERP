
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ReportLayout } from '../../../components/reports/ReportLayout';
import { Column } from '../../../components/ui/Table';
import { Badge } from '../../../components/ui/Common';

interface PayrollFileLog {
  id: string;
  fileName: string;
  payrollPeriod: string;
  bankName: string;
  fileType: string;
  totalEmployees: number;
  totalAmount: number;
  uploadDate: string;
  uploadedBy: string;
  status: 'Processing' | 'Submitted' | 'Rejected';
}

const mockFileLogs: PayrollFileLog[] = [];

export const PayrollFileLogsReport: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    return mockFileLogs.filter(f => {
      const matchesSearch = f.fileName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [searchTerm]);

  const columns: Column<PayrollFileLog>[] = [
    { header: t('file_name'), accessorKey: 'fileName' },
    { header: t('payroll_period'), accessorKey: 'payrollPeriod' },
    { header: t('bank_name'), accessorKey: 'bankName' },
    { header: t('file_type'), accessorKey: 'fileType' },
    { header: t('total_employees'), accessorKey: 'totalEmployees' },
    { header: t('total_amount'), render: (f) => f.totalAmount.toFixed(2) },
    { header: t('upload_date'), accessorKey: 'uploadDate' },
    { header: t('uploaded_by'), accessorKey: 'uploadedBy' },
    { 
      header: t('status'), 
      render: (f) => (
        <Badge variant={f.status === 'Submitted' ? 'success' : f.status === 'Processing' ? 'warning' : 'danger'}>
          {t(f.status.toLowerCase())}
        </Badge>
      )
    },
  ];

  return (
    <ReportLayout
      title={t('payroll_file_logs_report')}
      subtitle={t('view_history_of_payroll_file_uploads')}
      data={filteredData}
      columns={columns}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder={t('search_by_file_name')}
      filename="payroll_file_logs_report"
    />
  );
};
