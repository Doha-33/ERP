
import React from 'react';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  render?: (item: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  className?: string;
  headerClassName?: string;
  minWidth?: string;
  emptyMessage?: string;
  isLoading?: boolean;
}

export const Table = <T,>({ 
  data, 
  columns, 
  keyExtractor, 
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  className = '',
  headerClassName = '',
  minWidth = 'min-w-full',
  emptyMessage = 'No data found',
  isLoading = false
}: TableProps<T>) => {
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleSelectRow = (id: string) => {
    if (!onSelectionChange) return;
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(item => item !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };
  return (
    <div className={`overflow-x-auto rounded-2xl bg-white dark:bg-dark-surface shadow-sm ${className}`}>
      <table className={`w-full ${minWidth} border-collapse`}>
        <thead>
          <tr className={`border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 ${headerClassName}`}>
            {columns.map((col, idx) => (
              <th 
                key={idx} 
                className={`px-6 py-5 text-left rtl:text-right text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest ${col.headerClassName || ''} ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
          {data.length === 0 ? (
             <tr>
               <td colSpan={columns.length + (selectable ? 1 : 0)} className="p-12 text-center text-gray-400 font-medium">
                 {emptyMessage}
               </td>
             </tr>
          ) : (
            data.map((item, index) => {
              const id = keyExtractor(item);
              const isSelected = selectedIds.includes(id);
              return (
                <tr 
                  key={id} 
                  className={`hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors duration-200 group ${isSelected ? 'bg-blue-50/30 dark:bg-primary/5' : ''}`}
                >
                  {columns.map((col, idx) => (
                    <td 
                      key={idx} 
                      className={`px-6 py-4 text-[13px] font-medium ${isSelected ? 'text-primary' : 'text-gray-700 dark:text-gray-200'} ${col.className || ''}`}
                    >
                      {col.render ? col.render(item, index) : (col.accessorKey ? String(item[col.accessorKey] || '-') : '-')}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
