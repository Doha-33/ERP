import React, { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ChevronLeft, FileText, X, Download, Clock, Award, 
  FileCheck, FileX, FileClock, ChevronRight, Edit, Eye,
  Calendar as CalendarIcon, CheckCircle2, AlertCircle, 
  TrendingUp, Timer, CreditCard, Plus, Trash2, Building2,
  Briefcase, Mail, Phone, MapPin, User, Hash, Flag, Heart,
  DollarSign, Globe
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useData } from '../../context/DataContext';
import { Employee, Attendance, RequestRecord, LeaveRequest, DocumentRecord } from '../../types';
import { Button, Card, Badge } from '../../components/ui/Common';
import { EmployeeModal } from '../../components/hr/EmployeeModal';
import { DocumentModal } from '../../components/hr/DocumentModal';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';

// Helper function to extract ID
const extractId = (value: any): string => {
  if (!value) return "";
  if (typeof value === "object") {
    return value._id || value.id || "";
  }
  return value;
};

// --- Helper Components ---

const InfoItem: React.FC<{ label: string; value: string | undefined; highlight?: boolean }> = ({ label, value, highlight }) => (
  <div className="space-y-1">
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
    <p className={`text-sm font-semibold ${highlight ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-200'}`}>
      {value || '-'}
    </p>
  </div>
);

const SectionHeader: React.FC<{ title: string; icon: React.ReactNode; action?: React.ReactNode }> = ({ title, icon, action }) => (
  <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
    <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight flex items-center gap-2">
      {icon}
      {title}
    </h3>
    {action}
  </div>
);

const DocPreviewCard: React.FC<{ 
  doc: DocumentRecord; 
  onEdit: (doc: DocumentRecord) => void; 
  onDelete: (id: string) => void;
  onView: (url: string) => void;
}> = ({ doc, onEdit, onDelete, onView }) => {
  const { t } = useTranslation();
  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col h-full animate-in fade-in zoom-in-95 duration-300">
      <div 
         className="relative h-40 w-full bg-slate-50 dark:bg-gray-900 flex items-center justify-center cursor-pointer overflow-hidden border-b border-gray-50 dark:border-gray-800"
         onClick={() => onView(doc.fileUrl)}
      >
         {doc.fileUrl && (doc.fileUrl.endsWith('.png') || doc.fileUrl.endsWith('.jpg') || doc.fileUrl.endsWith('.jpeg') || doc.fileUrl.includes('image')) ? (
            <img src={doc.fileUrl} alt={doc.type} className="w-full h-full object-contain p-2 transition-transform duration-700 group-hover:scale-105" />
         ) : (
            <div className="flex flex-col items-center gap-2 text-slate-300 group-hover:text-primary transition-colors">
               <FileText size={40} strokeWidth={1.5} />
               <span className="text-[10px] font-black uppercase tracking-widest">{t('view')} PDF</span>
            </div>
         )}
         
         <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[1px]">
             <button onClick={(e) => { e.stopPropagation(); onView(doc.fileUrl); }} className="w-10 h-10 rounded-xl bg-white text-primary flex items-center justify-center shadow-lg hover:scale-110 transition-all"><Eye size={18} /></button>
             <button onClick={(e) => { e.stopPropagation(); onEdit(doc); }} className="w-10 h-10 rounded-xl bg-white text-slate-700 flex items-center justify-center shadow-lg hover:scale-110 transition-all"><Edit size={18} /></button>
             <button onClick={(e) => { e.stopPropagation(); onDelete(doc.id); }} className="w-10 h-10 rounded-xl bg-white text-red-500 flex items-center justify-center shadow-lg hover:scale-110 transition-all"><Trash2 size={18} /></button>
         </div>
      </div>

      <div className="p-4">
         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{doc.type.replace('_', ' ')}</h4>
         <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-gray-500">{doc.expiryDate}</span>
            <Badge status={new Date(doc.expiryDate) < new Date() ? 'Rejected' : 'Active'}>
               {new Date(doc.expiryDate) < new Date() ? t('expired') : t('active')}
            </Badge>
         </div>
      </div>
    </div>
  );
};

// --- Dashboard Tab Components ---

const DashboardTab: React.FC<{ 
  employee: Employee; 
  attendance: Attendance[]; 
  requests: RequestRecord[];
  leaves: LeaveRequest[];
}> = ({ employee, attendance, requests, leaves }) => {
  const { t } = useTranslation();
  
  const hoursData = { current: 147, target: 160 };
  const performanceData = { rating: 4.2, trend: '+0.3', label: 'Excellent' };
  const leaveStats = { total: 20, used: 8, remaining: 12 };
  
  const leaveChartData = [
    { name: 'Used', value: leaveStats.used },
    { name: 'Remaining', value: leaveStats.remaining },
  ];
  const LEAVE_COLORS = ['#E2E8F0', '#F97316'];

  const requestStats = {
    pending: requests.filter(r => r.status === 'Pending').length + leaves.filter(l => l.status === 'Pending').length,
    approved: requests.filter(r => r.status === 'Approved').length + leaves.filter(l => l.status === 'Approved').length,
    rejected: requests.filter(r => r.status === 'Rejected').length + leaves.filter(l => l.status === 'Rejected').length,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <Card className="p-6 border-none shadow-sm shadow-gray-200/50">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-2.5 bg-blue-50 text-primary rounded-xl"><Timer size={20} /></div>
          <div>
            <p className="text-xs font-bold text-gray-400">{t('working_hours')}</p>
            <p className="text-xs text-gray-400">{t('month')}</p>
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-6">
          <span className="text-3xl font-black text-slate-800 dark:text-white">{hoursData.current}</span>
          <span className="text-sm font-bold text-slate-400">/ {hoursData.target} hrs</span>
        </div>
        <p className="text-[10px] font-bold text-gray-400 mb-2">{t('working_hours')}</p>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
          <div className="h-full bg-primary transition-all duration-1000" style={{ width: '92%' }}></div>
        </div>
        <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-tighter">
          <span>{t('target')}: {hoursData.target} hours</span>
          <span className="text-primary">{hoursData.target - hoursData.current} hours remaining</span>
        </div>
      </Card>

      <Card className="p-6 border-none shadow-sm shadow-gray-200/50">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-2.5 bg-green-50 text-green-600 rounded-xl"><Award size={20} /></div>
          <div>
            <p className="text-xs font-bold text-gray-400">{t('performance')}</p>
            <p className="text-xs text-gray-400">{t('action_history')}</p>
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-6">
          <span className="text-3xl font-black text-slate-800 dark:text-white">{performanceData.rating}</span>
          <span className="text-sm font-bold text-slate-400">/ 5</span>
        </div>
        <div className="flex items-center gap-3 mb-6">
          <span className="px-3 py-1 bg-green-100 text-green-600 rounded-lg text-xs font-bold">{performanceData.label}</span>
          <span className="flex items-center gap-1 text-green-600 text-xs font-bold"><TrendingUp size={14} /> {performanceData.trend}</span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
          <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: '84%' }}></div>
        </div>
        <p className="text-[9px] font-bold text-gray-400 italic">Target Comparison (↑ +0.3 point)</p>
      </Card>

      <Card className="p-6 border-none shadow-sm shadow-gray-200/50">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl"><CalendarIcon size={20} /></div>
          <div>
            <p className="text-xs font-bold text-gray-400">{t('leaves')}</p>
            <p className="text-xs text-gray-400">{t('totals')}</p>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="w-28 h-28 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={leaveChartData} cx="50%" cy="50%" innerRadius={35} outerRadius={45} paddingAngle={0} dataKey="value" stroke="none" startAngle={90} endAngle={450}>
                  {leaveChartData.map((_, index) => <Cell key={index} fill={LEAVE_COLORS[index]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-black text-slate-800 dark:text-white">{leaveStats.remaining}</span>
              <span className="text-[8px] font-bold text-gray-400 uppercase leading-none">{t('days')}</span>
            </div>
          </div>
          <div className="flex-1 pl-6 space-y-3">
             <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-gray-400 uppercase">{t('totals')}</span><span className="text-sm font-bold">{leaveStats.total}</span></div>
             <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-gray-400 uppercase">{t('used')}</span><span className="text-sm font-bold text-gray-400">{leaveStats.used}</span></div>
             <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-orange-500 uppercase">{t('remaining_amount')}</span><span className="text-sm font-bold text-orange-500">{leaveStats.remaining}</span></div>
          </div>
        </div>
      </Card>

      <Card className="md:col-span-3 p-8 border-none shadow-sm shadow-gray-200/50">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">{t('responses')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
           <div className="p-5 rounded-2xl bg-orange-50/50 border border-orange-100 flex justify-between items-center">
              <div><p className="text-xs font-bold text-orange-600 mb-1">{t('pending')}</p><p className="text-2xl font-black text-orange-700">{requestStats.pending}</p></div>
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-orange-400 shadow-sm"><Clock size={20} /></div>
           </div>
           <div className="p-5 rounded-2xl bg-green-50/50 border border-green-100 flex justify-between items-center">
              <div><p className="text-xs font-bold text-green-600 mb-1">{t('approved')}</p><p className="text-2xl font-black text-green-700">{requestStats.approved}</p></div>
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-green-400 shadow-sm"><CheckCircle2 size={20} /></div>
           </div>
           <div className="p-5 rounded-2xl bg-red-50/50 border border-red-100 flex justify-between items-center">
              <div><p className="text-xs font-bold text-red-600 mb-1">{t('rejected')}</p><p className="text-2xl font-black text-red-700">{requestStats.rejected}</p></div>
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-red-400 shadow-sm"><AlertCircle size={20} /></div>
           </div>
        </div>

        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Recent Requests</p>
        <div className="space-y-4">
           {requests.slice(0, 3).map((req, idx) => (
             <div key={idx} className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl border border-transparent hover:border-gray-200 transition-all">
                <div className="flex items-center gap-5">
                   <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-700 flex items-center justify-center shadow-sm text-slate-400"><FileText size={20} /></div>
                   <div><h4 className="text-sm font-bold text-slate-700 dark:text-slate-100">{req.requestType}</h4><p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">{req.date}</p></div>
                </div>
                <Badge status={req.status}>{t(req.status.toLowerCase())}</Badge>
             </div>
           ))}
        </div>
      </Card>
    </div>
  );
};

export const EmployeeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { 
    employees, updateEmployee, attendanceRecords, requests, leaves,
    documents, addDocument, updateDocument, deleteDocument
  } = useData();
  const [activeTab, setActiveTab] = useState<'information' | 'dashboard'>('dashboard');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Document Management States
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentRecord | null>(null);
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null);

  // Find employee using extractId helper
  const employee = useMemo(() => {
    if (!id) return null;
    return employees.find(emp => extractId(emp) === id);
  }, [employees, id]);

  // Filter data for this employee using extractId
  const employeeAttendance = useMemo(() => {
    if (!employee) return [];
    const empId = extractId(employee);
    return attendanceRecords.filter(r => {
      const recordEmpId = typeof r.employeeId === 'object' ? extractId(r.employeeId) : r.employeeId;
      return recordEmpId === empId;
    });
  }, [attendanceRecords, employee]);

  const employeeRequests = useMemo(() => {
    if (!employee) return [];
    const empId = extractId(employee);
    return requests.filter(r => extractId(r.employeeId) === empId);
  }, [requests, employee]);

  const employeeLeaves = useMemo(() => {
    if (!employee) return [];
    const empId = extractId(employee);
    return leaves.filter(l => extractId(l.employeeId) === empId);
  }, [leaves, employee]);

  const employeeDocs = useMemo(() => {
    if (!employee) return [];
    const empId = extractId(employee);
    return documents.filter(d => extractId(d.employeeId) === empId);
  }, [documents, employee]);

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500 animate-pulse">
        <FileX size={48} className="mb-4 opacity-20" />
        <p className="font-bold uppercase tracking-widest text-xs">{t('employee_not_found')}</p>
        <Button variant="ghost" onClick={() => navigate('/hr/employees')} className="mt-4 text-primary font-black">
          {t('back_to_list')}
        </Button>
      </div>
    );
  }

  const handleDocSave = async (data: any) => {
    try {
      if (editingDoc) {
        await updateDocument(editingDoc.id, data);
      } else {
        await addDocument({ ...data, employeeId: extractId(employee) });
      }
      setIsDocModalOpen(false);
      setEditingDoc(null);
    } catch (err) {
      console.error("Failed to save document:", err);
      throw err;
    }
  };

  const handleEditDoc = (doc: DocumentRecord) => {
    setEditingDoc(doc);
    setIsDocModalOpen(true);
  };

  const handleDeleteDocConfirm = async () => {
    if (deleteDocId) {
      try {
        await deleteDocument(deleteDocId);
        setDeleteDocId(null);
      } catch (err) {
        console.error("Failed to delete document:", err);
        alert('Failed to delete document. Please try again.');
      }
    }
  };

  // Get bank info safely
  const bankInfo = (employee as any).bankInfo || { bankName: "", accountNumber: "" };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-5">
          <button 
            onClick={() => navigate('/hr/employees')} 
            className="p-3 bg-white dark:bg-dark-surface rounded-2xl shadow-sm hover:shadow-md transition-all group"
          >
            <ChevronLeft size={20} className="text-gray-400 group-hover:text-indigo-600 transition-colors" />
          </button>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">{t('employee_details')}</h1>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setIsEditModalOpen(true)} 
            className="gap-2 text-indigo-600 border-indigo-300 bg-indigo-50/50 hover:bg-indigo-100"
          >
            <Edit size={16} /> {t('edit_employee')}
          </Button>
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl border border-white dark:border-gray-700 shadow-inner">
            <button 
              onClick={() => setActiveTab('information')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'information' ? 'bg-white dark:bg-gray-700 shadow-md text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {t('basic_information')}
            </button>
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600 shadow-lg shadow-indigo-600/30 text-white' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {t('dashboard')}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar */}
        <div className="w-full lg:w-80 lg:sticky lg:top-24 space-y-6">
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 p-8 rounded-[2.5rem] flex flex-col items-center text-center border-none shadow-xl shadow-indigo-100/50 dark:shadow-none animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="relative mb-6">
              <img 
                src={employee.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.fullName || 'User')}&background=4f46e5&color=fff&bold=true`} 
                className="w-28 h-28 rounded-[2rem] object-cover shadow-2xl border-4 border-white dark:border-gray-800" 
                alt={employee.fullName} 
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white dark:border-gray-800 rounded-full"></div>
            </div>
            <h2 className="text-xl font-black text-slate-800 dark:text-white leading-tight mb-2">{employee.fullName}</h2>
            <span className="px-4 py-1.5 bg-white/60 dark:bg-gray-800/60 rounded-full text-[10px] font-black text-indigo-600 uppercase tracking-wider">
              {employee.jobId?.jobName || employee.jobGrade || '-'}
            </span>
            <div className="mt-4 w-full pt-4 border-t border-indigo-200/50">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Badge variant={employee.employeeStatus === 'ACTIVE' ? 'success' : employee.employeeStatus === 'ON_LEAVE' ? 'warning' : 'danger'}>
                  {t((employee.employeeStatus || 'active').toLowerCase())}
                </Badge>
                {employee.employeeCode && (
                  <span className="text-xs font-mono text-gray-500">#{employee.employeeCode}</span>
                )}
              </div>
            </div>
          </div>

          <Card className="p-6 border-none shadow-sm space-y-5 animate-in fade-in slide-in-from-left-6 duration-700 delay-100">
            <InfoItem label={t('employee_code')} value={employee.employeeCode} />
            <InfoItem label={t('join_date')} value={employee.hireDate ? new Date(employee.hireDate).toLocaleDateString() : '-'} />
            <InfoItem label={t('email')} value={employee.email} />
            <InfoItem label={t('phone')} value={employee.phoneNumber} />
            <InfoItem label={t('nationality')} value={employee.nationality} />
            <InfoItem label={t('job_grade')} value={employee.jobGrade} />
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1 w-full min-w-0">
          {activeTab === 'dashboard' ? (
            <DashboardTab 
              employee={employee} 
              attendance={employeeAttendance} 
              requests={employeeRequests}
              leaves={employeeLeaves}
            />
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Work Information Section */}
              <Card className="p-8 border-none shadow-sm">
                <SectionHeader 
                  title={t('work_information')} 
                  icon={<Briefcase size={20} className="text-indigo-600" />}
                />
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-6 gap-x-8">
                  <InfoItem label={t('company')} value={employee.companyId?.name} />
                  <InfoItem label={t('branch')} value={employee.branchId?.name} />
                  <InfoItem label={t('department')} value={employee.departmentId?.departmentName} />
                  <InfoItem label={t('job')} value={employee.jobId?.jobName} />
                  <InfoItem label={t('job_grade')} value={employee.jobGrade} />
                  <InfoItem label={t('contract_type')} value={(employee as any).contractType} />
                  <InfoItem label={t('contract_start_date')} value={(employee as any).contractStartDate ? new Date((employee as any).contractStartDate).toLocaleDateString() : '-'} />
                  <InfoItem label={t('contract_end_date')} value={(employee as any).contractEndDate ? new Date((employee as any).contractEndDate).toLocaleDateString() : '-'} />
                  <InfoItem label={t('internal_employee_number')} value={(employee as any).internalEmployeeNumber} />
                  <InfoItem label={t('id_number')} value={(employee as any).idNumber} />
                  <InfoItem label={t('gosi_id')} value={(employee as any).gosiId} />
                </div>
              </Card>

              {/* Personal Information Section */}
              <Card className="p-8 border-none shadow-sm">
                <SectionHeader 
                  title={t('personal_information')} 
                  icon={<User size={20} className="text-indigo-600" />}
                />
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-6 gap-x-8">
                  <InfoItem label={t('full_name')} value={employee.fullName} />
                  <InfoItem label={t('gender')} value={t(employee.gender?.toLowerCase() || '')} />
                  <InfoItem label={t('marital_status')} value={t(employee.maritalStatus?.toLowerCase() || '')} />
                  <InfoItem label={t('nationality')} value={employee.nationality} />
                  <InfoItem label={t('birth_date')} value={(employee as any).birthDate ? new Date((employee as any).birthDate).toLocaleDateString() : '-'} />
                  <InfoItem label={t('phone')} value={employee.phoneNumber} />
                  <InfoItem label={t('email')} value={employee.email} />
                  <InfoItem label={t('address')} value={employee.address} />
                </div>
              </Card>

              {/* Bank Information Section */}
              {(bankInfo.bankName || bankInfo.accountNumber) && (
                <Card className="p-8 border-none shadow-sm">
                  <SectionHeader 
                    title={t('bank_information')} 
                    icon={<CreditCard size={20} className="text-indigo-600" />}
                  />
                  <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                    <InfoItem label={t('bank_name')} value={bankInfo.bankName} />
                    <InfoItem label={t('account_number')} value={bankInfo.accountNumber} />
                  </div>
                </Card>
              )}

              {/* Documents Section */}
              <Card className="p-8 border-none shadow-sm">
                <SectionHeader 
                  title={t('documents')} 
                  icon={<FileText size={20} className="text-indigo-600" />}
                  action={
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 gap-2" onClick={() => { setEditingDoc(null); setIsDocModalOpen(true); }}>
                      <Plus size={14} /> {t('add_documents')}
                    </Button>
                  }
                />
                
                {employeeDocs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <FileText size={48} className="mb-2 opacity-20" />
                    <p className="text-xs font-bold uppercase tracking-widest">{t('no_documents_uploaded')}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {employeeDocs.map((doc) => (
                      <DocPreviewCard 
                        key={doc.id} 
                        doc={doc} 
                        onEdit={handleEditDoc} 
                        onDelete={setDeleteDocId} 
                        onView={(url) => window.open(url, '_blank')} 
                      />
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Employee Edit Modal */}
      <EmployeeModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        onSave={async (updated) => {
          await updateEmployee(updated);
          setIsEditModalOpen(false);
        }} 
        employeeToEdit={employee} 
      />

      {/* Document Modal */}
      <DocumentModal 
        isOpen={isDocModalOpen}
        onClose={() => {
          setIsDocModalOpen(false);
          setEditingDoc(null);
        }}
        onSave={handleDocSave}
        documentToEdit={editingDoc}
        fixedEmployeeId={extractId(employee)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteDocId}
        onClose={() => setDeleteDocId(null)}
        onConfirm={handleDeleteDocConfirm}
        title={t('confirm_delete')}
        message={t('are_you_sure_delete_document')}
      />
    </div>
  );
};