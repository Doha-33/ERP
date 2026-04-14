
import React from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, Search, Filter, ChevronDown } from 'lucide-react';
import { Card, Button, ExportDropdown, Input } from '../ui/Common';
import { Table, Column } from '../ui/Table';

interface ReportLayoutProps<T> {
  title: string;
  subtitle?: string;
  data: T[];
  columns: Column<T>[];
  filters?: React.ReactNode;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filename?: string;
  isLoading?: boolean;
}

export function ReportLayout<T>({
  title,
  subtitle,
  data,
  columns,
  filters,
  searchTerm,
  onSearchChange,
  searchPlaceholder,
  filename = 'report',
  isLoading = false
}: ReportLayoutProps<T>) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black dark:text-white flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <BarChart3 size={24} />
            </div>
            {title}
          </h1>
          {subtitle && <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{subtitle}</p>}
        </div>
        <div className="flex gap-3">
          <ExportDropdown data={data} filename={filename} />
        </div>
      </div>

      <Card className="min-h-[500px] border-none shadow-xl shadow-gray-200/50 dark:shadow-none">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-gray-50 dark:bg-gray-800/30 p-4 rounded-2xl">
          <div className="w-full md:w-80 relative">
            {onSearchChange && (
              <Input 
                placeholder={searchPlaceholder || t('search')}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                icon={<Search size={18} />}
                className="bg-white dark:bg-dark-surface border-gray-200 dark:border-gray-700"
              />
            )}
          </div>
          <div className="flex flex-1 flex-wrap gap-4 w-full md:w-auto justify-end">
            {filters}
          </div>
        </div>

        <Table 
          data={data} 
          columns={columns} 
          keyExtractor={(item: any) => item.id || Math.random().toString()} 
          minWidth="min-w-[1000px]"
          isLoading={isLoading}
        />
      </Card>
    </div>
  );
}
