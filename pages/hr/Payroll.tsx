import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Edit2, Trash2, Eye, Search, Calendar, DollarSign, Users, Filter } from 'lucide-react';
import { Card, Button, Input, Badge, ExportDropdown, Select } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { PayrollModal } from '../../components/hr/PayrollModal';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Payroll as PayrollType } from '../../types';
import { toast } from 'sonner';

export const Payroll: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    payrolls, 
    addPayroll, 
    updatePayroll, 
    deletePayroll, 
    employees, 
    currentUserEmployee 
  } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PayrollType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isAdmin = user?.role === 'admin';

  const handleSave = async (record: Partial<PayrollType>) => {
    try {
      setIsLoading(true);
      if (editingRecord) {
        await updatePayroll({ ...record, _id: editingRecord._id } as PayrollType);
        toast.success(t('payroll_updated_successfully'));
      } else {
        await addPayroll(record as PayrollType);
        toast.success(t('payroll_created_successfully'));
      }
      setIsModalOpen(false);
      setEditingRecord(null);
    } catch (error) {
      console.error("Error saving payroll:", error);
      toast.error(t('failed_to_save_payroll'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = useCallback((record: PayrollType) => {
    setEditingRecord(record);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      try {
        await deletePayroll(deleteId);
        toast.success(t('payroll_deleted_successfully'));
        setDeleteId(null);
      } catch (error) {
        toast.error(t('failed_to_delete_payroll'));
      }
    }
  }, [deleteId, deletePayroll, t]);

  const getEmployeeName = (record: PayrollType) => {
    if (typeof record.employeeId === 'object' && record.employeeId !== null) {
      return (record.employeeId as any).fullName || '-';
    }
    const emp = employees.find(e => (e._id || e.id) === record.employeeId);
    return emp?.fullName || '-';
  };

  const getEmployeePhoto = (record: PayrollType) => {
    if (typeof record.employeeId === 'object' && record.employeeId !== null) {
      return (record.employeeId as any).photo;
    }
    const emp = employees.find(e => (e._id || e.id) === record.employeeId);
    return emp?.photo;
  };

  // Filter records based on access
  const accessibleRecords = useMemo(() => {
    if (isAdmin) return payrolls;
    const currentId = currentUserEmployee?._id || currentUserEmployee?.id;
    return payrolls.filter(r => {
      const empId = typeof r.employeeId === 'object' ? (r.employeeId as any)._id : r.employeeId;
      return empId === currentId;
    });
  }, [isAdmin, payrolls, currentUserEmployee]);

  // Apply filters
  const filteredRecords = useMemo(() => {
    return accessibleRecords.filter(r => {
      const empName = getEmployeeName(r).toLowerCase();
      const matchesSearch = empName.includes(searchTerm.toLowerCase());
      
      const matchesMonth = !monthFilter || r.payrollMonth === parseInt(monthFilter);
      const matchesYear = !yearFilter || r.payrollYear === parseInt(yearFilter);
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      
      return matchesSearch && matchesMonth && matchesYear && matchesStatus;
    });
  }, [accessibleRecords, searchTerm, monthFilter, yearFilter, statusFilter]);

  // Calculate summary statistics
  const totalPayroll = filteredRecords.reduce((sum, r) => sum + (r.netSalary || 0), 0);
  const totalPaid = filteredRecords.filter(r => r.status === 'PAID').reduce((sum, r) => sum + (r.netSalary || 0), 0);
  const totalDraft = filteredRecords.filter(r => r.status === 'DRAFT').reduce((sum, r) => sum + (r.netSalary || 0), 0);
  const recordCount = filteredRecords.length;

  const getStatusBadge = (status: string) => {
    return (
      <Badge variant={status === 'PAID' ? 'success' : 'warning'}>
        {status === 'PAID' ? t('paid') : t('draft')}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return `${amount?.toLocaleString() || 0} EGP`;
  };

  const columns: Column<PayrollType>[] = useMemo(() => [
    {
      header: t('employee'),
      render: (r) => {
        const name = getEmployeeName(r);
        const photo = getEmployeePhoto(r);
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
              {photo ? (
                <img src={photo} alt={name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-indigo-600 font-medium text-sm">
                  {name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">{name}</span>
              <span className="text-xs text-gray-500">
                {typeof r.employeeId === 'object' && (r.employeeId as any).employeeCode}
              </span>
            </div>
          </div>
        );
      }
    },
    {
      header: t('period'),
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <Calendar size={14} className="text-gray-400" />
          <span className="text-sm text-gray-600">
            {t(`month_${r.payrollMonth}`)} {r.payrollYear}
          </span>
        </div>
      )
    },
    {
      header: t('basic_salary'),
      render: (r) => (
        <span className="text-sm text-gray-600">{formatCurrency(r.basicSalary)}</span>
      )
    },
    {
      header: t('allowances'),
      render: (r) => (
        <span className="text-sm text-green-600">{formatCurrency(r.totalAllowances)}</span>
      )
    },
    {
      header: t('deductions'),
      render: (r) => (
        <span className="text-sm text-red-600">{formatCurrency(r.totalDeductions)}</span>
      )
    },
    {
      header: t('gross_salary'),
      render: (r) => (
        <span className="text-sm font-medium text-gray-900">{formatCurrency(r.grossSalary)}</span>
      )
    },
    {
      header: t('net_salary'),
      render: (r) => (
        <span className="text-sm font-bold text-indigo-600">{formatCurrency(r.netSalary)}</span>
      )
    },
    {
      header: t('status'),
      render: (r) => getStatusBadge(r.status)
    },
    {
      header: t('actions'),
      className: 'text-center',
      render: (r) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => navigate(`/hr/payroll/payslip/${r._id || r.id}`)}
            className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
            title={t('view_payslip')}
          >
            <Eye size={16} />
          </button>
          {isAdmin && (
            <>
              <button
                onClick={() => handleEdit(r)}
                className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
                title={t('edit')}
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete(r._id || r.id)}
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
  ], [t, handleEdit, handleDelete, navigate, isAdmin]);

  const monthOptions = [
    { value: "", label: t("all_months") },
    { value: "1", label: t("january") },
    { value: "2", label: t("february") },
    { value: "3", label: t("march") },
    { value: "4", label: t("april") },
    { value: "5", label: t("may") },
    { value: "6", label: t("june") },
    { value: "7", label: t("july") },
    { value: "8", label: t("august") },
    { value: "9", label: t("september") },
    { value: "10", label: t("october") },
    { value: "11", label: t("november") },
    { value: "12", label: t("december") },
  ];

  const yearOptions = [
    { value: "", label: t("all_years") },
    { value: "2023", label: "2023" },
    { value: "2024", label: "2024" },
    { value: "2025", label: "2025" },
    { value: "2026", label: "2026" },
    { value: "2027", label: "2027" },
  ];

  const statusOptions = [
    { value: "all", label: t("all_statuses") },
    { value: "DRAFT", label: t("draft") },
    { value: "PAID", label: t("paid") },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('payroll')}
          </h1>
          <p className="text-gray-500 mt-1">
            {isAdmin ? t('manage_payroll') : t('view_payroll_history')}
          </p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown data={filteredRecords} filename="payroll" />
          {isAdmin && (
            <Button
              variant="primary"
              onClick={() => {
                setEditingRecord(null);
                setIsModalOpen(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <PlusCircle size={18} />
              {t('generate_payroll')}
            </Button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Users size={18} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t('total_records')}</p>
              <p className="text-xl font-bold text-gray-900">{recordCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <DollarSign size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t('total_payroll')}</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(totalPayroll)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <DollarSign size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t('total_paid')}</p>
              <p className="text-xl font-bold text-blue-600">{formatCurrency(totalPaid)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
              <DollarSign size={18} className="text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t('total_draft')}</p>
              <p className="text-xl font-bold text-orange-600">{formatCurrency(totalDraft)}</p>
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
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {monthOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {yearOptions.map((option) => (
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

        {(monthFilter || yearFilter || statusFilter || searchTerm) && (
          <button
            onClick={() => {
              setMonthFilter('');
              setYearFilter('');
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
          data={filteredRecords}
          columns={columns}
          keyExtractor={(item) => item._id || item.id}
          isLoading={isLoading}
          selectable={isAdmin}
        />

      {/* Modal */}
      <PayrollModal
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
        title={t('delete_payroll')}
        message={t('are_you_sure_delete_payroll')}
      />
    </div>
  );
};