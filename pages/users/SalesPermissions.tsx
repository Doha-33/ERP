
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ChevronDown, Download } from 'lucide-react';
import { Card, Button, Switch } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';

interface PermissionRow {
  id: string;
  roleName: string;
  description: string;
  page: string;
  allowAll: boolean;
  read: boolean;
  edit: boolean;
  add: boolean;
  delete: boolean;
}

export const SalesPermissions: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('Role Name');

  const [data, setData] = useState<PermissionRow[]>([
    {
      id: '1',
      roleName: 'sales',
      description: 'Description',
      page: 'Sales Orders',
      allowAll: true,
      read: true,
      edit: false,
      add: true,
      delete: true,
    },
    {
      id: '2',
      roleName: 'Sales',
      description: 'Description',
      page: 'Sales Invoice',
      allowAll: false,
      read: true,
      edit: false,
      add: true,
      delete: false,
    },
    {
      id: '3',
      roleName: 'Sales',
      description: 'Description',
      page: 'Customers',
      allowAll: false,
      read: true,
      edit: true,
      add: false,
      delete: true,
    },
  ]);

  const handleToggle = (id: string, field: keyof PermissionRow) => {
    setData(prev => prev.map(row => {
      if (row.id === id) {
        const newValue = !row[field];
        if (field === 'allowAll' && newValue) {
          return { ...row, allowAll: true, read: true, edit: true, add: true, delete: true };
        }
        if (field === 'allowAll' && !newValue) {
          return { ...row, allowAll: false };
        }
        // If any specific permission is turned off, Allow All should be off
        if (!newValue && field !== 'allowAll') {
          return { ...row, [field]: false, allowAll: false };
        }
        // If all specific permissions are turned on, Allow All should be on
        const updatedRow = { ...row, [field]: newValue };
        if (updatedRow.read && updatedRow.edit && updatedRow.add && updatedRow.delete) {
          return { ...row, [field]: newValue, allowAll: true };
        }
        return { ...row, [field]: newValue };
      }
      return row;
    }));
  };

  const columns: Column<PermissionRow>[] = [
    { 
      header: t('role_name'), 
      accessorKey: 'roleName',
      render: (r) => <span className="text-gray-600 dark:text-gray-300">{r.roleName}</span>
    },
    { 
      header: t('description'), 
      accessorKey: 'description',
      render: (r) => <span className="text-gray-600 dark:text-gray-300">{r.description}</span>
    },
    { 
      header: t('page'), 
      accessorKey: 'page',
      render: (r) => <span className="text-gray-600 dark:text-gray-300">{r.page}</span>
    },
    { 
      header: t('allow_all'), 
      render: (r) => (
        <Switch 
          checked={r.allowAll} 
          onChange={() => handleToggle(r.id, 'allowAll')} 
        />
      )
    },
    { 
      header: t('read'), 
      render: (r) => (
        <Switch 
          checked={r.read} 
          onChange={() => handleToggle(r.id, 'read')} 
        />
      )
    },
    { 
      header: t('edit'), 
      render: (r) => (
        <Switch 
          checked={r.edit} 
          onChange={() => handleToggle(r.id, 'edit')} 
        />
      )
    },
    { 
      header: t('permission_add'), 
      render: (r) => (
        <Switch 
          checked={r.add} 
          onChange={() => handleToggle(r.id, 'add')} 
        />
      )
    },
    { 
      header: t('delete'), 
      render: (r) => (
        <Switch 
          checked={r.delete} 
          onChange={() => handleToggle(r.id, 'delete')} 
        />
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-blue-900 dark:text-white">{t('sales_permission')}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{t('manage_your_permission')}</p>
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
                {t('role_name')}
                <ChevronDown size={16} />
              </button>
            </div>
          </div>

          <div className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
            <Table 
              data={data}
              columns={columns}
              keyExtractor={(r) => r.id}
              className="w-full"
              headerClassName="bg-blue-50/50 dark:bg-blue-900/10 text-blue-900 dark:text-blue-200"
            />
          </div>
        </div>
      </Card>
    </div>
  );
};
