import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Edit2, Trash2, Star, TrendingUp, Calendar, User, Filter } from 'lucide-react';
import { Card, Button, Input, Badge, ExportDropdown } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { EvaluationModal } from '../../components/hr/EvaluationModal';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Evaluation } from '../../types';
import { toast } from 'sonner';

export const Performance: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { evaluations, employees, addEvaluation, updateEvaluation, deleteEvaluation, currentUserEmployee } = useData();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvaluation, setEditingEvaluation] = useState<Evaluation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [periodFilter, setPeriodFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isAdmin = user?.role === 'admin';

  const handleSave = async (evaluation: Partial<Evaluation>) => {
    try {
      setIsLoading(true);
      if (editingEvaluation) {
        await updateEvaluation({ ...evaluation, id: editingEvaluation._id } as Evaluation);
        toast.success(t('evaluation_updated_successfully'));
      } else {
        await addEvaluation(evaluation as Evaluation);
        toast.success(t('evaluation_created_successfully'));
      }
      setIsModalOpen(false);
      setEditingEvaluation(null);
    } catch (error) {
      console.error("Error saving evaluation:", error);
      toast.error(t('failed_to_save_evaluation'));
    } finally {
      setIsLoading(false);
    }
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
      try {
        await deleteEvaluation(deleteId);
        toast.success(t('evaluation_deleted_successfully'));
        setDeleteId(null);
      } catch (error) {
        toast.error(t('failed_to_delete_evaluation'));
      }
    }
  }, [deleteId, deleteEvaluation, t]);

  const getEmployeeName = (evaluation: Evaluation) => {
    if (typeof evaluation.employeeId === 'object' && evaluation.employeeId !== null) {
      return (evaluation.employeeId as any).fullName || '-';
    }
    const emp = employees.find(e => (e._id || e.id) === evaluation.employeeId);
    return emp?.fullName || '-';
  };

  const getEmployeePhoto = (evaluation: Evaluation) => {
    if (typeof evaluation.employeeId === 'object' && evaluation.employeeId !== null) {
      return (evaluation.employeeId as any).photo;
    }
    const emp = employees.find(e => (e._id || e.id) === evaluation.employeeId);
    return emp?.photo;
  };

  const getEmployeeCode = (evaluation: Evaluation) => {
    if (typeof evaluation.employeeId === 'object' && evaluation.employeeId !== null) {
      return (evaluation.employeeId as any).employeeCode;
    }
    const emp = employees.find(e => (e._id || e.id) === evaluation.employeeId);
    return emp?.employeeCode;
  };

  // Filter records based on access
  const accessibleEvaluations = useMemo(() => {
    if (isAdmin) return evaluations;
    const currentId = currentUserEmployee?._id || currentUserEmployee?.id;
    return evaluations.filter(e => {
      const empId = typeof e.employeeId === 'object' ? (e.employeeId as any)._id : e.employeeId;
      return empId === currentId;
    });
  }, [isAdmin, evaluations, currentUserEmployee]);

  // Apply filters
  const filteredEvaluations = useMemo(() => {
    return accessibleEvaluations.filter(e => {
      const empName = getEmployeeName(e).toLowerCase();
      const matchesSearch = empName.includes(searchTerm.toLowerCase());
      
      const matchesPeriod = !periodFilter || e.period === periodFilter;
      const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
      
      return matchesSearch && matchesPeriod && matchesStatus;
    });
  }, [accessibleEvaluations, searchTerm, periodFilter, statusFilter]);

  // Calculate summary statistics
  const totalEvaluations = filteredEvaluations.length;
  const avgScore = filteredEvaluations.length > 0
    ? Math.round(filteredEvaluations.reduce((sum, e) => sum + (e.evaluationScore || 0), 0) / filteredEvaluations.length)
    : 0;
  const excellentCount = filteredEvaluations.filter(e => (e.evaluationScore || 0) >= 80).length;
  const goodCount = filteredEvaluations.filter(e => (e.evaluationScore || 0) >= 60 && (e.evaluationScore || 0) < 80).length;
  const needsImprovementCount = filteredEvaluations.filter(e => (e.evaluationScore || 0) < 60).length;

  const getScoreBadge = (score: number) => {
    if (score >= 80) {
      return <Badge variant="success" className="bg-green-50 text-green-700">{t("excellent")}</Badge>;
    }
    if (score >= 60) {
      return <Badge variant="warning" className="bg-orange-50 text-orange-700">{t("good")}</Badge>;
    }
    return <Badge variant="danger" className="bg-red-50 text-red-700">{t("needs_improvement")}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variant = status === 'COMPLETED' ? 'success' : status === 'DRAFT' ? 'warning' : 'neutral';
    return <Badge variant={variant}>{status === 'COMPLETED' ? t('completed') : status === 'DRAFT' ? t('draft') : status === 'APPROVED' ? t('approved') : t('pending')}</Badge>;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const columns: Column<Evaluation>[] = useMemo(() => [
    {
      header: t('employee'),
      render: (e) => {
        const name = getEmployeeName(e);
        const photo = getEmployeePhoto(e);
        const code = getEmployeeCode(e);
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
              {photo ? (
                <img src={photo} alt={name} className="w-full h-full object-cover" />
              ) : (
                <User size={14} className="text-indigo-600" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">{name}</span>
              <span className="text-xs text-gray-500">{code}</span>
            </div>
          </div>
        );
      }
    },
    {
      header: t('period'),
      render: (e) => (
        <div className="flex items-center gap-1.5">
          <Calendar size={14} className="text-gray-400" />
          <span className="text-sm text-gray-600">{e.period}</span>
        </div>
      )
    },
    {
      header: t('overall_score'),
      render: (e) => {
        const score = e.evaluationScore || 0;
        return (
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  score >= 80 ? "bg-green-500" : score >= 60 ? "bg-orange-500" : "bg-red-500"
                }`}
                style={{ width: `${score}%` }}
              />
            </div>
            <span className={`text-sm font-bold ${getScoreColor(score)}`}>{score}%</span>
          </div>
        );
      }
    },
    {
      header: t('rating'),
      render: (e) => getScoreBadge(e.evaluationScore || 0)
    },
    {
      header: t('status'),
      render: (e) => getStatusBadge(e.status)
    },
    {
      header: t('actions'),
      className: 'text-center',
      render: (e) => (
        <div className="flex items-center justify-center gap-2">
          {isAdmin && (
            <>
              <button
                onClick={() => handleEdit(e)}
                className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
                title={t('edit')}
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete(e._id || e.id)}
                className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg border border-gray-200 transition-colors"
                title={t('delete')}
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      )
    }
  ], [t, handleEdit, handleDelete, isAdmin]);

  // Get unique periods for filter
  const periodOptions = useMemo(() => {
    const periods = Array.from(new Set(accessibleEvaluations.map(e => e.period)));
    return [
      { value: "", label: t("all_periods") },
      ...periods.map(p => ({ value: p, label: p })),
    ];
  }, [accessibleEvaluations, t]);

  const statusOptions = [
    { value: "all", label: t("all_statuses") },
    { value: "COMPLETED", label: t("completed") },
    { value: "APPROVED", label: t("approved") },
    { value: "DRAFT", label: t("draft") },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Star size={24} className="text-indigo-600 fill-indigo-100" />
            {t('performance')}
          </h1>
          <p className="text-gray-500 mt-1">
            {isAdmin ? t('manage_performance') : t('track_performance')}
          </p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown data={filteredEvaluations} filename="performance" />
          {isAdmin && (
            <Button
              variant="primary"
              onClick={() => {
                setEditingEvaluation(null);
                setIsModalOpen(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus size={18} />
              {t('add_evaluation')}
            </Button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Star size={18} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t('total_evaluations')}</p>
              <p className="text-xl font-bold text-gray-900">{totalEvaluations}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <TrendingUp size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t('average_score')}</p>
              <p className="text-xl font-bold text-green-600">{avgScore}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <Star size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t('excellent')}</p>
              <p className="text-xl font-bold text-gray-900">{excellentCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <Star size={18} className="text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t('needs_improvement')}</p>
              <p className="text-xl font-bold text-red-600">{needsImprovementCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t('search_by_employee')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={periodFilter}
          onChange={(e) => setPeriodFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {periodOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {(periodFilter || statusFilter !== 'all' || searchTerm) && (
          <button
            onClick={() => {
              setPeriodFilter('');
              setStatusFilter('all');
              setSearchTerm('');
            }}
            className="text-sm text-red-600 hover:text-red-700"
          >
            {t('clear_filters')}
          </button>
        )}
      </div>

      {/* Table */}
        <Table
          data={filteredEvaluations}
          columns={columns}
          keyExtractor={(item) => item._id || item.id}
          isLoading={isLoading}
          selectable={isAdmin}
        />

      {/* Modal */}
      <EvaluationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEvaluation(null);
        }}
        onSave={handleSave}
        evaluationToEdit={editingEvaluation}
        isLoading={isLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t('delete_evaluation')}
        message={t('are_you_sure_delete_evaluation')}
      />
    </div>
  );
};