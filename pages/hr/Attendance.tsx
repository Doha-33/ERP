import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Edit2, Trash2, Calendar, Clock, Filter, ChevronDown } from 'lucide-react';
import { Card, Button, Input, Badge, ExportDropdown, Select } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { AttendanceModal } from '../../components/hr/AttendanceModal';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Attendance as AttendanceType } from '../../types';
import { toast } from 'sonner';

export const Attendance: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { 
    attendanceRecords, 
    employees, 
    addAttendanceRecord, 
    updateAttendanceRecord, 
    deleteAttendanceRecord, 
    currentUserEmployee 
  } = useData();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isAdmin = user?.role === 'admin';

  const handleSave = async (record: Partial<AttendanceType>) => {
    try {
      setIsLoading(true);
      if (editingRecord) {
        await updateAttendanceRecord({ ...record, _id: editingRecord._id });
        toast.success(t('attendance_updated_successfully'));
      } else {
        await addAttendanceRecord(record);
        toast.success(t('attendance_added_successfully'));
      }
      setIsModalOpen(false);
      setEditingRecord(null);
    } catch (error) {
      console.error("Error saving attendance:", error);
      toast.error(t('failed_to_save_attendance'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = useCallback((record: AttendanceType) => {
    setEditingRecord(record);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      try {
        await deleteAttendanceRecord(deleteId);
        toast.success(t('attendance_deleted_successfully'));
        setDeleteId(null);
      } catch (error) {
        toast.error(t('failed_to_delete_attendance'));
      }
    }
  }, [deleteId, deleteAttendanceRecord, t]);

  // Get employee name helper
  const getEmployeeName = (record: AttendanceType) => {
    if (typeof record.employeeId === 'object' && record.employeeId !== null) {
      const emp = record.employeeId as any;
      return emp.fullName || '-';
    }
    const emp = employees.find(e => (e._id || e.id) === record.employeeId);
    return emp?.fullName || '-';
  };

  const getEmployeePhoto = (record: AttendanceType) => {
    if (typeof record.employeeId === 'object' && record.employeeId !== null) {
      const emp = record.employeeId as any;
      return emp.photo;
    }
    const emp = employees.find(e => (e._id || e.id) === record.employeeId);
    return emp?.photo;
  };

  // Filter records based on access
  const accessibleRecords = useMemo(() => {
    if (isAdmin) return attendanceRecords;
    const currentId = currentUserEmployee?._id || currentUserEmployee?.id;
    return attendanceRecords.filter(r => {
      const empId = typeof r.employeeId === 'object' ? (r.employeeId as any)._id : r.employeeId;
      return empId === currentId;
    });
  }, [isAdmin, attendanceRecords, currentUserEmployee]);

  // Apply filters
  const filteredRecords = useMemo(() => {
    return accessibleRecords.filter(r => {
      const empName = getEmployeeName(r).toLowerCase();
      const matchesSearch = empName.includes(searchTerm.toLowerCase());
      
      const recordDate = new Date(r.date).toISOString().split('T')[0];
      const matchesDate = !filterDate || recordDate === filterDate;
      
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      
      return matchesSearch && matchesDate && matchesStatus;
    });
  }, [accessibleRecords, searchTerm, filterDate, statusFilter]);

  // Calculate summary statistics
  const totalRecords = accessibleRecords.length;
  const presentCount = accessibleRecords.filter(r => r.status === 'PRESENT').length;
  const absentCount = accessibleRecords.filter(r => r.status === 'ABSENT').length;
  const lateCount = accessibleRecords.filter(r => r.status === 'LATE').length;
  const leaveCount = accessibleRecords.filter(r => r.status === 'LEAVE').length;

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "success" | "danger" | "warning" | "info" | "purple"; label: string }> = {
      PRESENT: { variant: "success", label: t("present") },
      ABSENT: { variant: "danger", label: t("absent") },
      LATE: { variant: "warning", label: t("late") },
      LEAVE: { variant: "info", label: t("leave") },
      PERMISSION: { variant: "purple", label: t("permission") },
    };
    const config = statusMap[status] || { variant: "info", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '--:--';
    return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const columns: Column<AttendanceType>[] = useMemo(() => [
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
      header: t('date'),
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <Calendar size={14} className="text-gray-400" />
          <span className="text-sm text-gray-600">{new Date(r.date).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      header: t('check_in'),
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <Clock size={14} className="text-gray-400" />
          <span className="text-sm text-gray-600">{formatTime(r.checkInTime)}</span>
        </div>
      )
    },
    {
      header: t('check_out'),
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <Clock size={14} className="text-gray-400" />
          <span className="text-sm text-gray-600">{formatTime(r.checkOutTime)}</span>
        </div>
      )
    },
    {
      header: t('working_hours'),
      render: (r) => (
        <span className="text-sm font-medium text-gray-900">
          {r.workingHours?.toFixed(1) || '-'} h
        </span>
      )
    },
    {
      header: t('overtime'),
      render: (r) => (
        <span className="text-sm text-green-600">
          {r.overtimeHours?.toFixed(1) || 0} h
        </span>
      )
    },
    {
      header: t('late_minutes'),
      render: (r) => (
        <span className={`text-sm ${r.lateMinutes > 0 ? 'text-orange-600' : 'text-gray-500'}`}>
          {r.lateMinutes || 0} min
        </span>
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
            onClick={() => handleEdit(r)}
            className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
            title={t('edit')}
          >
            <Edit2 size={16} />
          </button>
          {isAdmin && (
            <button
              onClick={() => handleDelete(r._id)}
              className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg border border-gray-200 transition-colors"
              title={t('delete')}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      )
    }
  ], [t, handleEdit, handleDelete, isAdmin]);

  const statusOptions = [
    { value: "all", label: t("all_statuses") },
    { value: "PRESENT", label: t("present") },
    { value: "ABSENT", label: t("absent") },
    { value: "LATE", label: t("late") },
    { value: "LEAVE", label: t("on_leave") },
    { value: "PERMISSION", label: t("permission") },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('attendance')}
          </h1>
          <p className="text-gray-500 mt-1">
            {isAdmin ? t('manage_attendance') : t('view_attendance_history')}
          </p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown data={filteredRecords} filename="attendance" />
          {isAdmin && (
            <Button
              variant="primary"
              onClick={() => {
                setEditingRecord(null);
                setIsModalOpen(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus size={18} />
              {t('add_attendance')}
            </Button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <p className="text-xs text-gray-500">{t('total_records')}</p>
          <p className="text-xl font-bold text-gray-900">{totalRecords}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <p className="text-xs text-gray-500">{t('present')}</p>
          <p className="text-xl font-bold text-green-600">{presentCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <p className="text-xs text-gray-500">{t('absent')}</p>
          <p className="text-xl font-bold text-red-600">{absentCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <p className="text-xs text-gray-500">{t('late')}</p>
          <p className="text-xl font-bold text-orange-600">{lateCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <p className="text-xs text-gray-500">{t('leave')}</p>
          <p className="text-xl font-bold text-blue-600">{leaveCount}</p>
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
      </div>

      {/* Table */}
        <Table
          data={filteredRecords}
          columns={columns}
          keyExtractor={(item) => item._id}
          isLoading={isLoading}
          selectable={isAdmin}
        />

      {/* Modal */}
      <AttendanceModal
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
        title={t('delete_attendance')}
        message={t('are_you_sure_delete_attendance')}
      />
    </div>
  );
};