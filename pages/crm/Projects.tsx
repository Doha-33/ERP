
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, ChevronDown, Calendar } from 'lucide-react';
import { Card, Button, Input, Select, Badge } from '../../components/ui/Common';
import { Modal } from '../../components/ui/Modal';
import { Table, Column } from '../../components/ui/Table';

interface Project {
  id: string;
  projectName: string;
  projectId: string;
  teamLeader: string;
  client: string;
  startDate: string;
  deadline: string;
  progress: string;
  state: 'Completed' | 'In Progress' | 'Cancelled';
}

export const Projects: React.FC = () => {
  const { t } = useTranslation();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      projectName: '“Mobile App ”',
      projectId: '2334',
      teamLeader: 'x',
      client: 'ABC Company',
      startDate: '2025-01-14',
      deadline: '2025-01-14',
      progress: '80%',
      state: 'Completed',
    },
    {
      id: '2',
      projectName: '',
      projectId: '',
      teamLeader: '',
      client: '',
      startDate: '',
      deadline: '',
      progress: '',
      state: 'In Progress',
    },
    {
      id: '3',
      projectName: '',
      projectId: '',
      teamLeader: '',
      client: '',
      startDate: '',
      deadline: '',
      progress: '',
      state: 'Cancelled',
    },
  ]);

  const columns: Column<Project>[] = [
    { header: t('project_name'), accessorKey: 'projectName' },
    { header: t('project_id'), accessorKey: 'projectId' },
    { header: t('team_leader'), accessorKey: 'teamLeader' },
    { header: t('client'), accessorKey: 'client' },
    { header: t('start_date'), accessorKey: 'startDate' },
    { header: t('deadline'), accessorKey: 'deadline' },
    { header: t('progress_percent'), accessorKey: 'progress' },
    { 
      header: t('state'), 
      render: (item) => {
        const variants: Record<string, string> = {
          'Completed': 'success',
          'In Progress': 'warning',
          'Cancelled': 'danger'
        };
        return <Badge status={variants[item.state]}>{item.state}</Badge>;
      }
    },
    {
      header: t('actions'),
      render: (item) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { setSelectedProject(item); setIsEditModalOpen(true); }}
            className="p-1.5 text-gray-400 hover:text-primary transition-colors border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <Edit2 size={16} />
          </button>
          <button className="p-1.5 text-gray-400 hover:text-red-500 transition-colors border border-gray-200 dark:border-gray-700 rounded-lg">
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-blue-900 dark:text-white">{t('projects')}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{t('manage_your_projects')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="text-primary border-primary flex items-center gap-2">
            <ChevronDown size={16} />
            {t('export')}
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)} className="bg-primary hover:bg-primary/90 flex items-center gap-2">
            <Plus size={18} />
            {t('add_projects')}
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden border-none shadow-sm">
        <div className="p-6 space-y-6">
          <div className="flex justify-end">
            <Button variant="outline" className="flex items-center gap-2 text-gray-600 border-gray-200">
              <ChevronDown size={16} />
              {t('project_name')}
            </Button>
          </div>

          <div className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
            <Table 
              data={projects}
              columns={columns}
              keyExtractor={(item) => item.id}
              selectable
              className="w-full"
              headerClassName="bg-blue-50/50 dark:bg-blue-900/10 text-blue-900 dark:text-blue-200"
            />
          </div>
        </div>
      </Card>

      {/* Add Modal */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title={<div className="flex items-center gap-2"><Plus size={20} className="text-primary" /> {t('add_projects')}</div>}
      >
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Input label={t('project_name')} placeholder="aaaaaaa" required />
          <Input label={t('progress_percent')} placeholder="2222" required />
          <Select label={t('team_leader')} options={[{ value: 'aaaaa', label: 'aaaaa' }]} required />
          <Select label={t('client')} options={[{ value: 'aaaa', label: 'aaaa' }]} required />
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
              {t('start_date')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input type="text" placeholder="10 / 02 / 2025" />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
              {t('deadline')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input type="text" placeholder="10 / 02 / 2025" />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>
          <Select label={t('states')} options={[{ value: 'Completed', label: 'Completed' }]} required />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setIsAddModalOpen(false)} className="bg-slate-700 text-white hover:bg-slate-800">
            {t('cancel')}
          </Button>
          <Button className="bg-primary hover:bg-primary/90 flex items-center gap-2">
            <Plus size={18} />
            {t('add_projects')}
          </Button>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)}
        title={<div className="flex items-center gap-2"><Edit2 size={20} className="text-primary" /> {t('edit_projects')}</div>}
      >
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Input label={t('project_name')} defaultValue={selectedProject?.projectName} placeholder="aaaaaaa" required />
          <Input label={t('progress_percent')} defaultValue={selectedProject?.progress} placeholder="2222" required />
          <Select label={t('team_leader')} defaultValue={selectedProject?.teamLeader} options={[{ value: 'aaaaa', label: 'aaaaa' }]} required />
          <Select label={t('client')} defaultValue={selectedProject?.client} options={[{ value: 'aaaa', label: 'aaaa' }]} required />
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
              {t('start_date')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input type="text" defaultValue={selectedProject?.startDate} placeholder="10 / 02 / 2025" />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
              {t('deadline')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input type="text" defaultValue={selectedProject?.deadline} placeholder="10 / 02 / 2025" />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>
          <Select label={t('states')} defaultValue={selectedProject?.state} options={[{ value: 'Completed', label: 'Completed' }]} required />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setIsEditModalOpen(false)} className="bg-slate-700 text-white hover:bg-slate-800">
            {t('cancel')}
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            {t('save')}
          </Button>
        </div>
      </Modal>
    </div>
  );
};
