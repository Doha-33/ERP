
import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, ChevronDown, Edit2, Trash2 } from 'lucide-react';
import { Card, Button, ExportDropdown } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { useData } from '../../context/DataContext';
import { Department } from '../../types';
import { DepartmentModal } from '../../components/hr/DepartmentModal';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';

export const Departments: React.FC = () => {
  const { t } = useTranslation();
  const { departments, companies, employees, addDepartment, updateDepartment, deleteDepartment } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleSave = (department: Department) => {
    if (editingDepartment) updateDepartment(department);
    else addDepartment(department);
  };

  const handleEdit = useCallback((department: Department) => {
    setEditingDepartment(department);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteId) {
      deleteDepartment(deleteId);
      setDeleteId(null);
    }
  }, [deleteId, deleteDepartment]);

  const filtered = useMemo(() => departments.filter(d => 
    (d.departmentName || '').toLowerCase().includes(searchTerm.toLowerCase())
  ), [departments, searchTerm]);

  const columns: Column<any>[] = useMemo(() => [
    { header: 'ID', accessorKey: '_id', className: 'text-gray-500 text-xs' },
    { header: t('department_name'), accessorKey: 'departmentName', className: 'text-gray-500' },
    { 
        header: t('company_name'), 
        render: (d) => d.companyId?.companyName || companies.find(c => c.id === d.companyId)?.name || d.companyId,
        className: 'text-gray-500' 
    },
    { 
        header: t('manager_name'), 
        render: (d) => d.managerName || '-',
        className: 'text-gray-500' 
    },
    {
      header: t('actions'),
      className: 'text-center',
      render: (d) => (
        <div className="flex items-center justify-center gap-2">
           <button onClick={() => handleEdit(d)} className="p-1.5 text-gray-500 hover:text-white hover:bg-black rounded border border-gray-300 dark:border-gray-600 transition-colors"><Edit2 size={14} /></button>
           <button onClick={() => handleDelete(d._id)} className="p-1.5 text-gray-500 hover:text-white hover:bg-black rounded border border-gray-300 dark:border-gray-600 transition-colors"><Trash2 size={14} /></button>
        </div>
      )
    }
  ], [t, handleEdit, handleDelete, companies, employees]);

  return (
    <div className="space-y-6">
       {/* Header */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
           <h1 className="text-2xl font-bold dark:text-white">{t('department_page_title')}</h1>
           <p className="text-gray-500 dark:text-gray-400 text-sm">{t('manage_department')}</p>
        </div>
        <div className="flex gap-3">
           <ExportDropdown data={filtered} filename="departments_report" />
           <Button onClick={() => { setEditingDepartment(null); setIsModalOpen(true); }} className="bg-[#4361EE] hover:bg-blue-700">
              <Plus size={18} /> {t('add_department')}
           </Button>
        </div>
      </div>

      <Card className="min-h-[500px]">
        {/* Toolbar */}
        <div className="flex flex-wrap justify-end gap-4 mb-4">
           <div className="w-48">
              <div className="relative">
                 <select 
                    className="w-full appearance-none bg-white dark:bg-dark-surface border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    onChange={(e) => setSearchTerm(e.target.value)}
                 >
                    <option value="">Department name</option>
                    {/* Unique department names */}
                    {Array.from(new Set(departments.map(d => d.departmentName))).map(name => (
                        <option key={name} value={name}>{name}</option>
                    ))}
                 </select>
                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-400">
                    <ChevronDown size={14} />
                 </div>
              </div>
           </div>
        </div>
        
        <Table 
           data={filtered} 
           columns={columns} 
           keyExtractor={d => d._id} 
           selectable 
           minWidth="min-w-[1000px]" 
        />
      </Card>

      <DepartmentModal 
         isOpen={isModalOpen}
         onClose={() => setIsModalOpen(false)}
         onSave={handleSave}
         departmentToEdit={editingDepartment}
      />

      <ConfirmationModal
         isOpen={!!deleteId}
         onClose={() => setDeleteId(null)}
         onConfirm={confirmDelete}
         title={t('confirm_delete')}
         message={t('are_you_sure_delete')}
      />
    </div>
  );
};
