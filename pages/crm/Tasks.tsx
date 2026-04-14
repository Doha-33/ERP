
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, ChevronDown, Calendar } from 'lucide-react';
import { Card, Button, Input, Select, Badge } from '../../components/ui/Common';
import { Modal } from '../../components/ui/Modal';
import { Table, Column } from '../../components/ui/Table';

interface Task {
  id: string;
  taskTitle: string;
  taskId: string;
  startDate: string;
  dueDate: string;
  assignee: string;
  state: 'Completed' | 'In Progress' | 'Cancelled';
  description: string;
}

export const Tasks: React.FC = () => {
  const { t } = useTranslation();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      taskTitle: 'aaaaa',
      taskId: 'V-001',
      startDate: '2025-01-14',
      dueDate: '2025-01-14',
      assignee: 'Ahmed',
      state: 'Completed',
      description: 'aaaaa',
    },
    {
      id: '2',
      taskTitle: '',
      taskId: '',
      startDate: '',
      dueDate: '',
      assignee: '',
      state: 'In Progress',
      description: '',
    },
    {
      id: '3',
      taskTitle: '',
      taskId: '',
      startDate: '',
      dueDate: '',
      assignee: '',
      state: 'Cancelled',
      description: '',
    },
  ]);

  const columns: Column<Task>[] = [
    { header: t('task_title'), accessorKey: 'taskTitle' },
    { header: t('task_id'), accessorKey: 'taskId' },
    { header: t('start_date'), accessorKey: 'startDate' },
    { header: t('due_date'), accessorKey: 'dueDate' },
    { header: t('assignee'), accessorKey: 'assignee' },
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
    { header: t('description'), accessorKey: 'description' },
    {
      header: t('actions'),
      render: (item) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { setSelectedTask(item); setIsEditModalOpen(true); }}
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
          <h1 className="text-2xl font-bold text-blue-900 dark:text-white">{t('tasks')}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{t('manage_your_tasks')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="text-primary border-primary flex items-center gap-2">
            <ChevronDown size={16} />
            {t('export')}
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)} className="bg-primary hover:bg-primary/90 flex items-center gap-2">
            <Plus size={18} />
            {t('add_tasks')}
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden border-none shadow-sm">
        <div className="p-6 space-y-6">
          <div className="flex justify-end">
            <Button variant="outline" className="flex items-center gap-2 text-gray-600 border-gray-200">
              <ChevronDown size={16} />
              {t('task_id')}
            </Button>
          </div>

          <div className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
            <Table 
              data={tasks}
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
        title={<div className="flex items-center gap-2"><Plus size={20} className="text-primary" /> {t('add_task')}</div>}
      >
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Input label={t('task_title')} placeholder="aaaaaaa" required />
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
              {t('due_date')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input type="text" placeholder="10 / 02 / 2025" />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>
          <Select label={t('assignee')} options={[{ value: 'aaaa', label: 'aaaa' }]} required />
          <Select label={t('states')} options={[{ value: 'Completed', label: 'Completed' }]} required />
          <div className="col-span-2 space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
              {t('descriptions')} <span className="text-red-500">*</span>
            </label>
            <textarea 
              className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary outline-none min-h-[100px]"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setIsAddModalOpen(false)} className="bg-slate-700 text-white hover:bg-slate-800">
            {t('cancel')}
          </Button>
          <Button className="bg-primary hover:bg-primary/90 flex items-center gap-2">
            <Plus size={18} />
            {t('add_task')}
          </Button>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)}
        title={<div className="flex items-center gap-2"><Edit2 size={20} className="text-primary" /> {t('edit_task')}</div>}
      >
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Input label={t('task_title')} defaultValue={selectedTask?.taskTitle} placeholder="aaaaaaa" required />
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
              {t('start_date')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input type="text" defaultValue={selectedTask?.startDate} placeholder="10 / 02 / 2025" />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
              {t('due_date')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input type="text" defaultValue={selectedTask?.dueDate} placeholder="10 / 02 / 2025" />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>
          <Select label={t('assignee')} defaultValue={selectedTask?.assignee} options={[{ value: 'aaaa', label: 'aaaa' }]} required />
          <Select label={t('states')} defaultValue={selectedTask?.state} options={[{ value: 'Completed', label: 'Completed' }]} required />
          <div className="col-span-2 space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
              {t('descriptions')} <span className="text-red-500">*</span>
            </label>
            <textarea 
              defaultValue={selectedTask?.description}
              className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary outline-none min-h-[100px]"
            />
          </div>
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
