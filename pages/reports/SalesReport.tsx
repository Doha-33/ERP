
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, ChevronDown } from 'lucide-react';
import { Card, Button } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';

interface SalesReportData {
  id: string;
  sku: string;
  product: string;
  productImage: string;
  category: string;
  soldQty: number;
  soldAmount: string;
  instockQty: number;
}

export const SalesReport: React.FC = () => {
  const { t } = useTranslation();
  const [selectedFilter, setSelectedFilter] = useState('SKU');

  const data: SalesReportData[] = [
    {
      id: '1',
      sku: '002',
      product: 'Laptop Lenovo',
      productImage: 'https://picsum.photos/seed/laptop/40/40',
      category: 'Computers',
      soldQty: 4,
      soldAmount: '43$',
      instockQty: 2,
    },
    {
      id: '2',
      sku: '002',
      product: 'Laptop Lenovo',
      productImage: 'https://picsum.photos/seed/laptop2/40/40',
      category: 'Electronics',
      soldQty: 4,
      soldAmount: '43$',
      instockQty: 3,
    },
    {
      id: '3',
      sku: '002',
      product: 'Laptop Lenovo',
      productImage: 'https://picsum.photos/seed/laptop3/40/40',
      category: 'Electronics',
      soldQty: 4,
      soldAmount: '43$',
      instockQty: 4,
    },
  ];

  const columns: Column<SalesReportData>[] = [
    { header: t('sku'), accessorKey: 'sku' },
    { 
      header: t('product'), 
      render: (item) => (
        <div className="flex items-center gap-3">
          <img 
            src={item.productImage} 
            alt={item.product} 
            className="w-8 h-8 rounded-lg object-cover"
            referrerPolicy="no-referrer"
          />
          <span>{item.product}</span>
        </div>
      )
    },
    { header: t('category'), accessorKey: 'category' },
    { header: t('sold_qty'), accessorKey: 'soldQty' },
    { header: t('sold_amount'), accessorKey: 'soldAmount' },
    { header: t('instock_qty'), accessorKey: 'instockQty' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-blue-900 dark:text-white">{t('sales_report')}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{t('view_sales_report')}</p>
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
