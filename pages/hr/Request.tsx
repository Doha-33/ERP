import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Plus, Search, Edit2, Trash2, FileText, XCircle, 
  CheckCircle, Clock, Flag, User, Calendar, Filter, X
} from 'lucide-react';
import { Card, Button, Input, Badge, ExportDropdown } from '../../components/ui/Common';
import { Table, Column } from '../../components/ui/Table';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { RequestModal } from '../../components/hr/RequestModal';
import { ResponseRejectModal } from '../../components/hr/ResponseRejectModal';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { HRRequest, RequestRecord } from '../../types';
import { toast } from 'sonner';

export const Request: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { 
    requests, 
    employees, 
    addRequest, 
    updateRequest, 
    deleteRequest, 
    toggleRequestWorkflow, 
    rejectRequest, 
    currentUserEmployee,
    fetchRequests
  } = useData();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<RequestRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
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

  const handleSave = async (record: Partial<RequestRecord>) => {
    try {
      setIsLoading(true);
      
      if (editingRecord) {
        const recordId = extractId(editingRecord);
        
        if (!recordId) {
          toast.error(t('request_id_missing'));
          return;
        }
        
        const updateData = {
          ...record,
          _id: recordId,
          id: recordId
        } as RequestRecord;
        
        console.log("Updating request with ID:", recordId, updateData);
        await updateRequest(updateData);
        toast.success(t('request_updated_successfully'));
      } else {
        await addRequest(record as RequestRecord);
        toast.success(t('request_created_successfully'));
      }
      
      await fetchRequests();
      setIsModalOpen(false);
      setEditingRecord(null);
    } catch (error: any) {
      console.error("Error saving request:", error);
      const message = error?.response?.data?.message || error?.message || t('failed_to_save_request');
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = useCallback((record: RequestRecord) => {
    const recordId = extractId(record);
    
    if (!recordId) {
      console.error("Request record ID not found", record);
      toast.error(t('request_id_not_found'));
      return;
    }
    
    const recordToEdit: RequestRecord = {
      ...record,
      _id: recordId,
      id: recordId,
    };
    
    console.log("Editing request record:", recordToEdit);
    setEditingRecord(recordToEdit);
    setIsModalOpen(true);
  }, [extractId, t]);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      try {
        await deleteRequest(deleteId);
        toast.success(t('request_deleted_successfully'));
        setDeleteId(null);
        setSelectedIds(prev => prev.filter(sid => sid !== deleteId));
        await fetchRequests();
      } catch (error) {
        toast.error(t('failed_to_delete_request'));
      }
    }
  }, [deleteId, deleteRequest, fetchRequests, t]);

  const handleReject = useCallback((id: string) => {
    setRejectId(id);
    setIsRejectModalOpen(true);
  }, []);

  const handleRejectConfirm = useCallback(async (reason: string) => {
    if (rejectId) {
      try {
        await rejectRequest(rejectId, reason);
        toast.success(t('request_rejected_successfully'));
        setRejectId(null);
        setIsRejectModalOpen(false);
        await fetchRequests();
      } catch (error) {
        toast.error(t('failed_to_reject_request'));
      }
    }
  }, [rejectId, rejectRequest, fetchRequests, t]);

  const handleApprove = useCallback(async (id: string) => {
    try {
      await toggleRequestWorkflow(id, 'hr');
      toast.success(t('request_approved_successfully'));
      await fetchRequests();
    } catch (error) {
      toast.error(t('failed_to_approve_request'));
    }
  }, [toggleRequestWorkflow, fetchRequests, t]);

  const getEmployeeName = (request: RequestRecord) => {
    if (typeof request.employeeId === 'object' && request.employeeId !== null) {
      return (request.employeeId as any).fullName || '-';
    }
    const emp = employees.find(e => extractId(e) === request.employeeId);
    return emp?.fullName || '-';
  };

  const getEmployeePhoto = (request: RequestRecord) => {
    if (typeof request.employeeId === 'object' && request.employeeId !== null) {
      return (request.employeeId as any).photo;
    }
    const emp = employees.find(e => extractId(e) === request.employeeId);
    return emp?.photo;
  };

  const getEmployeeCode = (request: RequestRecord) => {
    if (typeof request.employeeId === 'object' && request.employeeId !== null) {
      return (request.employeeId as any).employeeCode;
    }
    const emp = employees.find(e => extractId(e) === request.employeeId);
    return emp?.employeeCode;
  };

  // Filter records based on access
  const accessibleRequests = useMemo(() => {
    if (isAdmin) return requests;
    const currentId = extractId(currentUserEmployee);
    return requests.filter(r => {
      const empId = extractId(r.employeeId);
      return empId === currentId;
    });
  }, [isAdmin, requests, currentUserEmployee, extractId]);

  // Apply filters
  const filteredRequests = useMemo(() => {
    return accessibleRequests.filter(r => {
      const empName = getEmployeeName(r).toLowerCase();
      const matchesSearch = empName.includes(searchTerm.toLowerCase()) ||
        r.requestNumber?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = !typeFilter || r.requestType === typeFilter;
      const matchesStatus = !statusFilter || r.status === statusFilter;
      const matchesPriority = !priorityFilter || r.priority === priorityFilter;
      
      return matchesSearch && matchesType && matchesStatus && matchesPriority;
    });
  }, [accessibleRequests, searchTerm, typeFilter, statusFilter, priorityFilter]);

  // Calculate summary statistics
  const totalRequests = filteredRequests.length;
  const pendingCount = filteredRequests.filter(r => r.status === 'PENDING').length;
  const approvedCount = filteredRequests.filter(r => r.status === 'APPROVED').length;
  const rejectedCount = filteredRequests.filter(r => r.status === 'REJECTED').length;
  const urgentCount = filteredRequests.filter(r => r.priority === 'URGENT' && r.status === 'PENDING').length;

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "success" | "danger" | "warning" | "info"; label: string }> = {
      APPROVED: { variant: "success", label: t("approved") },
      REJECTED: { variant: "danger", label: t("rejected") },
      PENDING: { variant: "warning", label: t("pending") },
      IN_PROGRESS: { variant: "info", label: t("in_progress") },
      COMPLETED: { variant: "success", label: t("completed") },
    };
    const config = statusMap[status] || { variant: "info", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityMap: Record<string, { variant: "danger" | "warning" | "info" | "success"; label: string }> = {
      URGENT: { variant: "danger", label: t("urgent") },
      HIGH: { variant: "warning", label: t("high") },
      MEDIUM: { variant: "info", label: t("medium") },
      LOW: { variant: "success", label: t("low") },
    };
    const config = priorityMap[priority] || { variant: "info", label: priority };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getRequestTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      LEAVE: t("leave_request"),
      LOAN: t("loan_request"),
      SALARY_CERTIFICATE: t("salary_certificate"),
      EQUIPMENT: t("equipment_request"),
      PROFILE_UPDATE: t("profile_update"),
      OTHER: t("other_request"),
    };
    return typeMap[type] || type;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return '-';
    }
  };

  const handleViewAttachment = (attachment?: string) => {
    if (attachment) {
      window.open(attachment, '_blank');
    }
  };

  const columns: Column<RequestRecord>[] = useMemo(() => [
    {
      header: t('request_info'),
      render: (r) => {
        const requestId = extractId(r);
        return (
          <div className="flex flex-col">
            <span className="text-xs font-mono text-gray-500">{r.requestNumber || requestId.slice(-8)}</span>
            <span className="text-xs text-gray-400">{formatDate(r.createdAt || r.requestDate)}</span>
          </div>
        );
      }
    },
    {
      header: t('employee'),
      render: (r) => {
        const name = getEmployeeName(r);
        const photo = getEmployeePhoto(r);
        const code = getEmployeeCode(r);
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
      header: t('request_type'),
      render: (r) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-gray-700">{getRequestTypeLabel(r.requestType)}</span>
          {getPriorityBadge(r.priority)}
        </div>
      )
    },
    {
      header: t('description'),
      render: (r) => (
        <div className="max-w-xs">
          <p className="text-sm text-gray-600 line-clamp-2">{r.description || '-'}</p>
        </div>
      )
    },
    {
      header: t('status'),
      render: (r) => getStatusBadge(r.status)
    },
    {
      header: t('attachment'),
      render: (r) => (
        <button
          onClick={() => handleViewAttachment(r.attachment)}
          disabled={!r.attachment}
          className={`p-2 rounded-lg transition-colors ${
            r.attachment 
              ? 'text-indigo-600 hover:bg-indigo-50' 
              : 'text-gray-300 cursor-not-allowed'
          }`}
          title={r.attachment ? t('view_attachment') : t('no_attachment')}
        >
          <FileText size={18} />
        </button>
      ),
      className: 'text-center'
    },
    {
      header: t('actions'),
      className: 'text-center',
      render: (r) => {
        const requestId = extractId(r);
        return (
          <div className="flex items-center justify-center gap-2">
            {isAdmin && r.status === 'PENDING' && (
              <>
                <button
                  onClick={() => handleApprove(requestId)}
                  className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg border border-green-200 transition-colors"
                  title={t('approve')}
                >
                  <CheckCircle size={16} />
                </button>
                <button
                  onClick={() => handleReject(requestId)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
                  title={t('reject')}
                >
                  <XCircle size={16} />
                </button>
              </>
            )}
            <button
              onClick={() => handleEdit(r)}
              className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
              title={t('edit')}
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => handleDelete(requestId)}
              className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg border border-gray-200 transition-colors"
              title={t('delete')}
            >
              <Trash2 size={16} />
            </button>
          </div>
        );
      }
    }
  ], [t, handleEdit, handleDelete, handleApprove, handleReject, isAdmin, extractId]);

  const typeOptions = [
    { value: "", label: t("all_types") },
    { value: "LEAVE", label: t("leave_request") },
    { value: "LOAN", label: t("loan_request") },
    { value: "SALARY_CERTIFICATE", label: t("salary_certificate") },
    { value: "EQUIPMENT", label: t("equipment_request") },
    { value: "PROFILE_UPDATE", label: t("profile_update") },
    { value: "OTHER", label: t("other_request") },
  ];

  const statusOptions = [
    { value: "", label: t("all_statuses") },
    { value: "PENDING", label: t("pending") },
    { value: "APPROVED", label: t("approved") },
    { value: "REJECTED", label: t("rejected") },
    { value: "IN_PROGRESS", label: t("in_progress") },
    { value: "COMPLETED", label: t("completed") },
  ];

  const priorityOptions = [
    { value: "", label: t("all_priorities") },
    { value: "LOW", label: t("low") },
    { value: "MEDIUM", label: t("medium") },
    { value: "HIGH", label: t("high") },
    { value: "URGENT", label: t("urgent") },
  ];

  const getKeyExtractor = useCallback((item: RequestRecord) => {
    const id = extractId(item);
    return id || Math.random().toString();
  }, [extractId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('requests')}
          </h1>
          <p className="text-gray-500 mt-1">
            {isAdmin ? t('manage_requests') : t('your_requests')}
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
          <ExportDropdown data={filteredRequests} filename="requests" />
          <Button
            variant="primary"
            onClick={() => {
              setEditingRecord(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t('add_request')}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <p className="text-xs text-gray-500">{t('total_requests')}</p>
          <p className="text-xl font-bold text-gray-900">{totalRequests}</p>
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
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <p className="text-xs text-gray-500">{t('urgent_pending')}</p>
          <p className="text-xl font-bold text-red-500">{urgentCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t('search_by_employee_or_id')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {typeOptions.map((option) => (
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

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {priorityOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {(typeFilter || statusFilter || priorityFilter || searchTerm) && (
          <button
            onClick={() => {
              setTypeFilter('');
              setStatusFilter('');
              setPriorityFilter('');
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
        data={filteredRequests}
        columns={columns}
        keyExtractor={getKeyExtractor}
        isLoading={isLoading}
        selectable={isAdmin}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />

      {/* Modals */}
      <RequestModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRecord(null);
        }}
        onSave={handleSave}
        recordToEdit={editingRecord}
        isLoading={isLoading}
      />

      <ResponseRejectModal
        isOpen={isRejectModalOpen}
        onClose={() => {
          setIsRejectModalOpen(false);
          setRejectId(null);
        }}
        onSave={handleRejectConfirm}
        isLoading={isLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t('delete_request')}
        message={t('are_you_sure_delete_request')}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationModal
        isOpen={isBulkConfirmOpen}
        onClose={() => setIsBulkConfirmOpen(false)}
        onConfirm={async () => {
          try {
            setIsLoading(true);
            await Promise.all(selectedIds.map(id => deleteRequest(id)));
            toast.success(t('requests_deleted_successfully', { count: selectedIds.length }));
            setSelectedIds([]);
            setIsBulkConfirmOpen(false);
            await fetchRequests();
          } catch (error) {
            toast.error(t('failed_to_delete_requests'));
          } finally {
            setIsLoading(false);
          }
        }}
        title={t('delete_requests')}
        message={t('are_you_sure_delete_requests', { count: selectedIds.length })}
      />
    </div>
  );
};