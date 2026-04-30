import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Edit2, Trash2, Calendar, FileText, Filter, X, User, ChevronDown } from 'lucide-react';
import { Card, Button, Input, Badge, ExportDropdown } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { LeaveModal } from '../../components/hr/LeaveModal';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Leave } from '../../types';
import { toast } from 'sonner';

export const Leaves: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { leaves, employees, addLeave, updateLeave, deleteLeave, currentUserEmployee } = useData();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Leave | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isAdmin = user?.role === 'admin';

  const handleSave = async (record: Partial<Leave>) => {
    try {
      setIsLoading(true);
      if (editingRecord) {
        await updateLeave({ ...record, _id: editingRecord._id, id: editingRecord.id } as Leave);
        toast.success(t('leave_updated_successfully'));
      } else {
        await addLeave(record as Leave);
        toast.success(t('leave_created_successfully'));
      }
      setIsModalOpen(false);
      setEditingRecord(null);
    } catch (error) {
      console.error("Error saving leave:", error);
      toast.error(t('failed_to_save_leave'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = useCallback((record: Leave) => {
    setEditingRecord(record);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      try {
        await deleteLeave(deleteId);
        toast.success(t('leave_deleted_successfully'));
        setDeleteId(null);
        setSelectedIds(prev => prev.filter(sid => sid !== deleteId));
      } catch (error) {
        toast.error(t('failed_to_delete_leave'));
      }
    }
  }, [deleteId, deleteLeave, t]);

  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      await Promise.all(selectedIds.map(id => deleteLeave(id)));
      toast.success(t('leaves_deleted_successfully', { count: selectedIds.length }));
      setSelectedIds([]);
      setIsBulkConfirmOpen(false);
    } catch (error) {
      console.error("Bulk delete failed", error);
      toast.error(t('failed_to_delete_leaves'));
    } finally {
      setIsLoading(false);
    }
  };

  const getEmployeeName = (leave: Leave) => {
    if (typeof leave.employeeId === 'object' && leave.employeeId !== null) {
      return (leave.employeeId as any).fullName || '-';
    }
    const emp = employees.find(e => (e._id || e.id) === leave.employeeId);
    return emp?.fullName || '-';
  };

  const getEmployeePhoto = (leave: Leave) => {
    if (typeof leave.employeeId === 'object' && leave.employeeId !== null) {
      return (leave.employeeId as any).photo;
    }
    const emp = employees.find(e => (e._id || e.id) === leave.employeeId);
    return emp?.photo;
  };

  const getEmployeeCode = (leave: Leave) => {
    if (typeof leave.employeeId === 'object' && leave.employeeId !== null) {
      return (leave.employeeId as any).employeeCode;
    }
    const emp = employees.find(e => (e._id || e.id) === leave.employeeId);
    return emp?.employeeCode;
  };

  // Filter records based on access
  const accessibleLeaves = useMemo(() => {
    if (isAdmin) return leaves;
    const currentId = currentUserEmployee?._id || currentUserEmployee?.id;
    return leaves.filter(l => {
      const empId = typeof l.employeeId === 'object' ? (l.employeeId as any)._id : l.employeeId;
      return empId === currentId;
    });
  }, [isAdmin, leaves, currentUserEmployee]);

  // Apply filters
  const filteredLeaves = useMemo(() => {
    return accessibleLeaves.filter(l => {
      const empName = getEmployeeName(l).toLowerCase();
      const matchesSearch = empName.includes(searchTerm.toLowerCase());
      
      const matchesLeaveType = !leaveTypeFilter || l.leaveType === leaveTypeFilter;
      const matchesStatus = !statusFilter || l.status === statusFilter;
      
      return matchesSearch && matchesLeaveType && matchesStatus;
    });
  }, [accessibleLeaves, searchTerm, leaveTypeFilter, statusFilter]);

  // Calculate summary statistics
  const totalLeaves = filteredLeaves.length;
  const totalDays = filteredLeaves.reduce((sum, l) => sum + (l.days || 0), 0);
  const pendingCount = filteredLeaves.filter(l => l.status === 'PENDING').length;
  const approvedCount = filteredLeaves.filter(l => l.status === 'APPROVED').length;
  const rejectedCount = filteredLeaves.filter(l => l.status === 'REJECTED').length;

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "success" | "danger" | "warning" | "info"; label: string }> = {
      APPROVED: { variant: "success", label: t("approved") },
      REJECTED: { variant: "danger", label: t("rejected") },
      PENDING: { variant: "warning", label: t("pending") },
    };
    const config = statusMap[status] || { variant: "info", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getLeaveTypeBadge = (type: string) => {
    const typeMap: Record<string, { variant: "info" | "success" | "warning" | "danger" | "purple"; label: string }> = {
      ANNUAL: { variant: "info", label: t("annual_leave") },
      SICK: { variant: "warning", label: t("sick_leave") },
      UNPAID: { variant: "danger", label: t("unpaid_leave") },
      EMERGENCY: { variant: "purple", label: t("emergency_leave") },
      MATERNITY: { variant: "success", label: t("maternity_leave") },
      OTHER: { variant: "info", label: t("other_leave") },
    };
    const config = typeMap[type] || { variant: "info", label: type };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString();
  };

  const columns: Column<Leave>[] = useMemo(() => [
    {
      header: t('leave_id'),
      accessorKey: 'leaveId',
      render: (l) => (
        <span className="text-xs font-mono text-gray-500">{l.leaveId || l._id?.slice(-8)}</span>
      )
    },
    {
      header: t('employee'),
      render: (l) => {
        const name = getEmployeeName(l);
        const photo = getEmployeePhoto(l);
        const code = getEmployeeCode(l);
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
      header: t('leave_type'),
      render: (l) => getLeaveTypeBadge(l.leaveType)
    },
    {
      header: t('period'),
      render: (l) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <Calendar size={12} className="text-gray-400" />
            <span className="text-xs text-gray-600">{formatDate(l.fromDate)}</span>
            <span className="text-gray-400">→</span>
            <span className="text-xs text-gray-600">{formatDate(l.toDate)}</span>
          </div>
          <span className="text-xs font-medium text-gray-500">{l.days} {t('days')}</span>
        </div>
      )
    },
    {
      header: t('reason'),
      render: (l) => (
        <div className="max-w-xs">
          <p className="text-sm text-gray-600 truncate">{l.reason || '-'}</p>
        </div>
      )
    },
    {
      header: t('status'),
      render: (l) => getStatusBadge(l.status)
    },
    {
      header: t('actions'),
      className: 'text-center',
      render: (l) => (
        <div className="flex items-center justify-center gap-2">
          {isAdmin && (
            <>
              <button
                onClick={() => handleEdit(l)}
                className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
                title={t('edit')}
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete(l._id || l.id)}
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

  const leaveTypeOptions = [
    { value: "", label: t("all_types") },
    { value: "ANNUAL", label: t("annual_leave") },
    { value: "SICK", label: t("sick_leave") },
    { value: "UNPAID", label: t("unpaid_leave") },
    { value: "EMERGENCY", label: t("emergency_leave") },
    { value: "MATERNITY", label: t("maternity_leave") },
    { value: "OTHER", label: t("other_leave") },
  ];

  const statusOptions = [
    { value: "", label: t("all_statuses") },
    { value: "PENDING", label: t("pending") },
    { value: "APPROVED", label: t("approved") },
    { value: "REJECTED", label: t("rejected") },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('leaves')}
          </h1>
          <p className="text-gray-500 mt-1">
            {isAdmin ? t('manage_leaves') : t('your_leaves')}
          </p>
        </div>
        <div className="flex gap-3">
          {isAdmin && selectedIds.length > 0 && (
            <Button
              variant="danger"
              onClick={() => setIsBulkConfirmOpen(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 size={18} />
              {t('delete_selected')} ({selectedIds.length})
            </Button>
          )}
          <ExportDropdown data={filteredLeaves} filename="leaves" />
          <Button
            variant="primary"
            onClick={() => {
              setEditingRecord(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t('add_leaves')}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <p className="text-xs text-gray-500">{t('total_leaves')}</p>
          <p className="text-xl font-bold text-gray-900">{totalLeaves}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <p className="text-xs text-gray-500">{t('total_days')}</p>
          <p className="text-xl font-bold text-indigo-600">{totalDays}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <p className="text-xs text-gray-500">{t('pending')}</p>
          <p className="text-xl font-bold text-orange-600">{pendingCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <p className="text-xs text-gray-500">{t('approved')}</p>
          <p className="text-xl font-bold text-green-600">{approvedCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <p className="text-xs text-gray-500">{t('rejected')}</p>
          <p className="text-xl font-bold text-red-600">{rejectedCount}</p>
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
          value={leaveTypeFilter}
          onChange={(e) => setLeaveTypeFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {leaveTypeOptions.map((option) => (
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

        {(leaveTypeFilter || statusFilter || searchTerm) && (
          <button
            onClick={() => {
              setLeaveTypeFilter('');
              setStatusFilter('');
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
          data={filteredLeaves}
          columns={columns}
          keyExtractor={(item) => item._id || item.id}
          isLoading={isLoading}
          selectable={isAdmin}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />

      {/* Modal */}
      <LeaveModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRecord(null);
        }}
        onSave={handleSave}
        recordToEdit={editingRecord}
        isLoading={isLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t('delete_leave')}
        message={t('are_you_sure_delete_leave')}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationModal
        isOpen={isBulkConfirmOpen}
        onClose={() => setIsBulkConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title={t('delete_leaves')}
        message={t('are_you_sure_delete_leaves', { count: selectedIds.length })}
      />
    </div>
  );
};