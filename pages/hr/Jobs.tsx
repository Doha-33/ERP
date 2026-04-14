
import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, ChevronDown, Edit2, Trash2 } from 'lucide-react';
import { Card, Button, ExportDropdown } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { useData } from '../../context/DataContext';
import { Job } from '../../types';
import { JobModal } from '../../components/hr/JobModal';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';

export const Jobs: React.FC = () => {
  const { t } = useTranslation();
  const { jobs, departments, addJob, updateJob, deleteJob } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleSave = (job: Job) => {
    if (editingJob) updateJob(job);
    else addJob(job);
  };

  const handleEdit = useCallback((job: Job) => {
    setEditingJob(job);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteId) {
      deleteJob(deleteId);
      setDeleteId(null);
    }
  }, [deleteId, deleteJob]);

  const filtered = useMemo(() => jobs.filter(j => 
    (j.jobName || '').toLowerCase().includes(searchTerm.toLowerCase())
  ), [jobs, searchTerm]);

  const columns: Column<any>[] = useMemo(() => [
    { header: 'ID', accessorKey: '_id', className: 'text-gray-500 uppercase text-xs' },
    { header: t('job_name'), accessorKey: 'jobName', className: 'text-gray-500' },
    { header: t('description'), accessorKey: 'description', className: 'text-gray-500' },
    { 
        header: t('department'), 
        render: (j) => j.departmentId?.departmentName || departments.find(d => d._id === j.departmentId)?.departmentName || j.departmentId,
        className: 'text-gray-500' 
    },
    {
      header: t('actions'),
      className: 'text-center',
      render: (j) => (
        <div className="flex items-center justify-center gap-2">
           <button onClick={() => handleEdit(j)} className="p-1.5 text-gray-500 hover:text-white hover:bg-black rounded border border-gray-300 dark:border-gray-600 transition-colors"><Edit2 size={14} /></button>
           <button onClick={() => handleDelete(j._id)} className="p-1.5 text-gray-500 hover:text-white hover:bg-black rounded border border-gray-300 dark:border-gray-600 transition-colors"><Trash2 size={14} /></button>
        </div>
      )
    }
  ], [t, handleEdit, handleDelete, departments]);

  return (
    <div className="space-y-6">
       {/* Header */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
           <h1 className="text-2xl font-bold dark:text-white">{t('jobs')}</h1>
           <p className="text-gray-500 dark:text-gray-400 text-sm">{t('manage_jobs')}</p>
        </div>
        <div className="flex gap-3">
           <ExportDropdown data={filtered} filename="jobs_report" />
           <Button onClick={() => { setEditingJob(null); setIsModalOpen(true); }} className="bg-[#4361EE] hover:bg-blue-700">
              <Plus size={18} /> {t('add_jobs')}
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
                    <option value="">{t('job_name')}</option>
                    {/* Unique jobs names for filter */}
                    {Array.from(new Set(jobs.map(j => j.jobName))).map(name => (
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
           keyExtractor={j => j._id} 
           selectable 
           minWidth="min-w-[1000px]" 
        />
      </Card>

      <JobModal 
         isOpen={isModalOpen}
         onClose={() => setIsModalOpen(false)}
         onSave={handleSave}
         jobToEdit={editingJob}
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
