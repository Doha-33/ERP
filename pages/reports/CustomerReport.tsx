
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, ChevronDown } from 'lucide-react';
import { Card, Button } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';

interface CustomerReportData {
  id: string;
  reference: string;
  code: string;
  customerName: string;
  customerImage: string;
  totalOrders: number;
  amount: string;
  paymentMethod: string;
}

export const CustomerReport: React.FC = () => {
  const { t } = useTranslation();
  const [selectedFilter, setSelectedFilter] = useState('Code');

  const data: CustomerReportData[] = [
    {
      id: '1',
      reference: 'hkkrf33',
      code: '002',
      customerName: 'Mohamed Ahmed',
      customerImage: 'https://i.pravatar.cc/150?u=1',
      totalOrders: 33,
      amount: '123$',
      paymentMethod: 'Cash',
    },
    {
      id: '2',
      reference: 'hkkrf33',
      code: '002',
      customerName: 'Mohamed Ahmed',
      customerImage: 'https://i.pravatar.cc/150?u=1',
      totalOrders: 32,
      amount: '123$',
      paymentMethod: 'Credit Card',
    },
    {
      id: '3',
      reference: 'hkkrf33',
      code: '002',
      customerName: 'Mohamed Ahmed',
      customerImage: 'https://i.pravatar.cc/150?u=1',
      totalOrders: 32,
      amount: '123$',
      paymentMethod: 'Paypal',
    },
  ];

  const columns: Column<CustomerReportData>[] = [
    { header: t('reference_no'), accessorKey: 'reference' },
    { header: t('code'), accessorKey: 'code' },
    { 
      header: t('customer_info'), 
      render: (item) => (
        <div className="flex items-center gap-3">
          <img 
            src={item.customerImage} 
            alt={item.customerName} 
            className="w-8 h-8 rounded-lg object-cover"
            referrerPolicy="no-referrer"
          />
          <span>{item.customerName}</span>
        </div>
      )
    },
    { header: t('total_orders'), accessorKey: 'totalOrders' },
    { header: t('amount'), accessorKey: 'amount' },
    { header: t('payment_method'), accessorKey: 'paymentMethod' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-blue-900 dark:text-white">{t('customer_report')}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{t('view_customer_report')}</p>
        </div>
        <Button variant="outline" className="text-primary border-primary flex items-center gap-2">
          <ChevronDown size={16} />
          {t('export')}
        </Button>
      </div>

      <Card className="p-0 overflow-hidden border-none shadow-sm">
        <div className="p-6 space-y-6">
          <div className="flex justify-end">
            <div className="relative">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300">
                {selectedFilter}
                <ChevronDown size={16} />
              </button>
            </div>
          </div>

          <div className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
            <Table 
              data={data}
              columns={columns}
              keyExtractor={(item) => item.id}
              selectable
              className="w-full"
              headerClassName="bg-blue-50/50 dark:bg-blue-900/10 text-blue-900 dark:text-blue-200"
            />
          </div>
        </div>
      </Card>
    </div>
  );
};
