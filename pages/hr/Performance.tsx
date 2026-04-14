
import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, ChevronDown, Edit2, Trash2, Star, TrendingUp, Search, Filter } from 'lucide-react';
import { Card, Button, ExportDropdown, Input } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Evaluation } from '../../types';
import { EvaluationModal } from '../../components/hr/EvaluationModal';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';

export const Performance: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { evaluations, employees, addEvaluation, updateEvaluation, deleteEvaluation, currentUserEmployee } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvaluation, setEditingEvaluation] = useState<Evaluation | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin';

  const handleSave = async (evaluation: Evaluation) => {
    if (editingEvaluation) await updateEvaluation(evaluation);
    else await addEvaluation(evaluation);
  };

  const handleEdit = useCallback((evaluation: Evaluation) => {
    setEditingEvaluation(evaluation);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      await deleteEvaluation(deleteId);
      setDeleteId(null);
    }
  }, [deleteId, deleteEvaluation]);

  const accessibleEvaluations = useMemo(() => {
    if (isAdmin) return evaluations;
    return evaluations.filter(e => e.employeeId === currentUserEmployee?.id);
  }, [isAdmin, evaluations, currentUserEmployee]);

  const filtered = useMemo(() => {
    return accessibleEvaluations.filter(e => {
      const matchesSearch = (e.employeeName || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSelect = selectedEmployee === '' || e.employeeName === selectedEmployee;
      return matchesSearch && matchesSelect;
    });
  }, [accessibleEvaluations, searchTerm, selectedEmployee]);

  const columns: Column<Evaluation>[] = useMemo(() => [
    { 
      header: t('employee_info'), 
      render: (e) => (
         <div className="flex items-center gap-3">
            <img 
               src={e.avatar || employees.find(emp => emp.id === e.employeeId)?.avatar || `https://ui-avatars.com/api/?name=${e.employeeName}&background=4361EE&color=fff`} 
               alt={e.employeeName} 
               className="w-9 h-9 rounded-xl object-cover bg-gray-100 border border-gray-100 dark:border-gray-800" 
            />
            <div className="flex flex-col">
               <span className="font-bold text-gray-900 dark:text-white leading-tight">{e.employeeName}</span>
               <span className="text-[10px] text-gray-400 font-medium">Evaluation ID: {e.id?.substring(0, 8) || 'N/A'}</span>
            </div>
         </div>
      )
    },
    { header: t('attendance'), accessorKey: 'attendance', className: 'text-gray-500 text-center font-mono' },
    { header: t('productivity'), accessorKey: 'productivity', className: 'text-gray-500 text-center font-mono' },
    { header: t('teamwork'), accessorKey: 'teamwork', className: 'text-gray-500 text-center font-mono' },
    { header: t('communication'), accessorKey: 'communication', className: 'text-gray-500 text-center font-mono' },
    { header: t('skill_development'), accessorKey: 'skillDevelopment', className: 'text-gray-500 text-center font-mono' },
    { 
      header: t('overall_score'), 
      className: 'text-center',
      render: (e) => {
        const score = Number(e.overallScore);
        return (
          <div className="flex items-center justify-center gap-2">
             <div className="w-16 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden hidden md:block">
                <div 
                  className={`h-full transition-all duration-500 ${score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-orange-500' : 'bg-red-500'}`}
                  style={{ width: `${score}%` }}
                />
             </div>
             <span className={`px-2 py-0.5 rounded-lg text-xs font-black ${
                score >= 80 ? 'text-green-600 bg-green-50 dark:bg-green-900/20' :
                score >= 60 ? 'text-orange-600 bg-orange-50 dark:bg-orange-900/20' :
                'text-red-600 bg-red-50 dark:bg-red-900/20'
             }`}>
               {score}%
             </span>
          </div>
        );
      }
    },
    {
      header: t('actions'),
      className: 'text-center',
      render: (e) => (
        <div className="flex items-center justify-center gap-1.5">
           {isAdmin && (
             <>
                <button onClick={() => handleEdit(e)} className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"><Edit2 size={15} /></button>
                <button onClick={() => handleDelete(e.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={15} /></button>
             </>
           )}
           <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors" title="View details"><Star size={15} /></button>
        </div>
      )
    }
  ], [t, handleEdit, handleDelete, employees, isAdmin]);

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-2xl font-black dark:text-white flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-xl">
                 <Star size={24} className="fill-primary" />
              </div>
              {t('performance')}
           </h1>
           <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{isAdmin ? t('manage_performance') : 'Track your performance evaluations'}</p>
        </div>
        <div className="flex gap-3">
           <ExportDropdown data={filtered} filename="performance_report" />
           {isAdmin && (
             <Button onClick={() => { setEditingEvaluation(null); setIsModalOpen(true); }} className="bg-[#4361EE] hover:bg-blue-700 shadow-lg shadow-primary/20">
                <Plus size={18} /> {t('add_evaluation')}
             </Button>
           )}
        </div>
      </div>

      <Card className="min-h-[500px] border-none shadow-xl shadow-gray-200/50 dark:shadow-none">
        {isAdmin && (
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-gray-50 dark:bg-gray-800/30 p-4 rounded-2xl">
            <div className="w-full md:w-80 relative">
                <Input 
                  placeholder="Search by employee name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<Search size={18} />}
                  className="bg-white dark:bg-dark-surface border-gray-200 dark:border-gray-700"
                />
            </div>
            <div className="relative min-w-[200px] flex-1">
                 <select 
                    className="w-full appearance-none bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2.5 px-10 pr-10 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                 >
                    <option value="">{t('all')} {t('employees')}</option>
                    {employees.map(emp => <option key={emp.id} value={emp.fullName}>{emp.fullName}</option>)}
                 </select>
                 <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400"><Filter size={16} /></div>
                 <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400"><ChevronDown size={14} /></div>
            </div>
          </div>
        )}

        <Table 
           data={filtered} 
           columns={columns} 
           keyExtractor={e => e.id} 
           selectable={isAdmin} 
           minWidth="min-w-[1100px]" 
        />
      </Card>

      <EvaluationModal 
         isOpen={isModalOpen}
         onClose={() => setIsModalOpen(false)}
         onSave={handleSave}
         evaluationToEdit={editingEvaluation}
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
