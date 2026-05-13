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
    currentUserEmployee,
    fetchPayrolls 
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

  // Helper function to extract ID
  const extractId = useCallback((value: any): string => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      if (value._id && typeof value._id === "string") return value._id;
      if (value.id && typeof value.id === "string") return value.id;
    }
    return "";
  }, []);

  const handleSave = async (record: Partial<PayrollType>) => {
    try {
      setIsLoading(true);
      
      if (editingRecord) {
        // IMPORTANT: Get the ID from editingRecord
        const recordId = extractId(editingRecord);
        
        if (!recordId) {
          toast.error(t('payroll_id_missing'));
          return;
        }
        
        // Create update data with the correct ID
        const updateData = {
          ...record,
          _id: recordId,
          id: recordId
        } as PayrollType;
        
        console.log("Updating payroll with ID:", recordId, updateData);
        await updatePayroll(updateData);
        toast.success(t('payroll_updated_successfully'));
      } else {
        await addPayroll(record as PayrollType);
        toast.success(t('payroll_created_successfully'));
      }
      
      await fetchPayrolls();
      setIsModalOpen(false);
      setEditingRecord(null);
    } catch (error: any) {
      console.error("Error saving payroll:", error);
      const message = error?.response?.data?.message || error?.message || t('failed_to_save_payroll');
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = useCallback((record: PayrollType) => {
    // Extract the ID correctly from the record
    const recordId = extractId(record);
    
    if (!recordId) {
      console.error("Payroll record ID not found", record);
      toast.error(t('payroll_id_not_found'));
      return;
    }
    
    // Create a clean record object with proper ID
    const recordToEdit: PayrollType = {
      ...record,
      _id: recordId,
      id: recordId,
    };
    
    console.log("Editing payroll record:", recordToEdit);
    setEditingRecord(recordToEdit);
    setIsModalOpen(true);
  }, [extractId, t]);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      try {
        await deletePayroll(deleteId);
        toast.success(t('payroll_deleted_successfully'));
        setDeleteId(null);
        await fetchPayrolls();
      } catch (error) {
        toast.error(t('failed_to_delete_payroll'));
      }
    }
  }, [deleteId, deletePayroll, fetchPayrolls, t]);

  // Safe function to get employee name
  const getEmployeeName = useCallback((record: PayrollType): string => {
    if (!record.employeeId) return '-';
    
    if (typeof record.employeeId === 'object' && record.employeeId !== null) {
      const emp = record.employeeId as any;
      return emp.fullName || emp.name || '-';
    }
    
    const emp = employees.find(e => extractId(e) === record.employeeId);
    return emp?.fullName || emp?.name || '-';
  }, [employees, extractId]);

  // Safe function to get employee code
  const getEmployeeCode = useCallback((record: PayrollType): string => {
    if (!record.employeeId) return '-';
    
    if (typeof record.employeeId === 'object' && record.employeeId !== null) {
      const emp = record.employeeId as any;
      return emp.employeeCode || emp.code || '-';
    }
    
    const emp = employees.find(e => extractId(e) === record.employeeId);
    return emp?.employeeCode || '-';
  }, [employees, extractId]);

  // Safe function to get employee photo
  const getEmployeePhoto = useCallback((record: PayrollType): string | undefined => {
    if (!record.employeeId) return undefined;
    
    if (typeof record.employeeId === 'object' && record.employeeId !== null) {
      const emp = record.employeeId as any;
      return emp.photo;
    }
    
    const emp = employees.find(e => extractId(e) === record.employeeId);
    return emp?.photo;
  }, [employees, extractId]);

  // Filter records based on access
  const accessibleRecords = useMemo(() => {
    if (isAdmin) return payrolls;
    const currentId = extractId(currentUserEmployee);
    return payrolls.filter(r => {
      const empId = extractId(r.employeeId);
      return empId === currentId;
    });
  }, [isAdmin, payrolls, currentUserEmployee, extractId]);

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
  }, [accessibleRecords, searchTerm, monthFilter, yearFilter, statusFilter, getEmployeeName]);

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

  const getMonthName = (month: number) => {
    const months = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ];
    return t(months[month - 1] || 'january');
  };

  const columns: Column<PayrollType>[] = useMemo(() => [
    {
      header: t('employee'),
      render: (r) => {
        const name = getEmployeeName(r);
        const code = getEmployeeCode(r);
        const photo = getEmployeePhoto(r);
        const initial = name.charAt(0).toUpperCase();
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
              {photo ? (
                <img src={photo} alt={name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-indigo-600 font-medium text-sm">
                  {initial || '?'}
                </span>
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
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <Calendar size={14} className="text-gray-400" />
          <span className="text-sm text-gray-600">
            {getMonthName(r.payrollMonth)} {r.payrollYear}
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
      render: (r) => {
        const recordId = extractId(r);
        return (
          <div className="flex items-center justify-center gap-2">
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
                  onClick={() => handleDelete(recordId)}
                  className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg border border-gray-200 transition-colors"
                  title={t('delete')}
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>
        );
      }
    }
  ], [t, handleEdit, handleDelete, navigate, isAdmin, getEmployeeName, getEmployeeCode, getEmployeePhoto, extractId]);

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

  const getKeyExtractor = useCallback((item: PayrollType) => {
    const id = extractId(item);
    return id || Math.random().toString();
  }, [extractId]);

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

        {(monthFilter || yearFilter || statusFilter !== 'all' || searchTerm) && (
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
        keyExtractor={getKeyExtractor}
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