
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ChevronLeft, FileText, X, Download, Clock, Award, 
  FileCheck, FileX, FileClock, ChevronRight, Edit, Eye,
  Calendar as CalendarIcon, CheckCircle2, AlertCircle, 
  TrendingUp, Timer, CreditCard, Plus, Trash2
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useData } from '../../context/DataContext';
import { Employee, Attendance, RequestRecord, LeaveRequest, DocumentRecord } from '../../types';
import { Button, Card, Badge } from '../../components/ui/Common';
import { EmployeeModal } from '../../components/hr/EmployeeModal';
import { DocumentModal } from '../../components/hr/DocumentModal';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';

// --- Helper Components ---

const InfoItem: React.FC<{ label: string; value: string | undefined }> = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{value || '-'}</p>
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
               {new Date(doc.expiryDate) < new Date() ? t('rejected') : t('active')}
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
    getEmployeeById, updateEmployee, attendanceRecords, requests, leaves,
    documents, addDocument, updateDocument, deleteDocument
  } = useData();
  const [activeTab, setActiveTab] = useState<'information' | 'dashboard'>('dashboard');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Document Management States
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentRecord | null>(null);
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null);

  const employee = getEmployeeById(id || '');

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500 animate-pulse">
        <FileX size={48} className="mb-4 opacity-20" />
        <p className="font-bold uppercase tracking-widest text-xs">Employee not found</p>
        <Button variant="ghost" onClick={() => navigate('/hr')} className="mt-4 text-primary font-black">Back to List</Button>
      </div>
    );
  }

  const employeeAttendance = attendanceRecords.filter(r => {
      const empId = typeof r.employeeId === 'object' ? r.employeeId._id : r.employeeId;
      return empId === employee.id;
  });
  const employeeRequests = requests.filter(r => r.employeeId === employee.id);
  const employeeLeaves = leaves.filter(l => l.employeeId === employee.id);
  const employeeDocs = documents.filter(d => d.employeeId === employee.id);

  const handleDocSave = async (data: any) => {
    try {
      if (editingDoc) {
        await updateDocument(data.id, data.data);
      } else {
        await addDocument(data);
      }
    } catch (err) {
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
            alert('Failed to delete document. Please try again.');
          }
      }
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-5">
           <button onClick={() => navigate('/hr')} className="p-3 bg-white dark:bg-dark-surface rounded-2xl shadow-sm hover:shadow-md transition-all group">
              <ChevronLeft size={20} className="text-gray-400 group-hover:text-primary transition-colors" />
           </button>
           <h1 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">{t('employee_info')}</h1>
        </div>

        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl border border-white dark:border-gray-700 shadow-inner">
           <button 
              onClick={() => setActiveTab('information')}
              className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'information' ? 'bg-white dark:bg-gray-700 shadow-md text-primary' : 'text-gray-400 hover:text-gray-600'}`}
           >
              {t('basic_information')}
           </button>
           <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'dashboard' ? 'bg-primary shadow-lg shadow-primary/30 text-white' : 'text-gray-400 hover:text-gray-600'}`}
           >
              {t('dashboard')}
           </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="w-full lg:w-72 lg:sticky lg:top-24 space-y-6">
           <div className="bg-[#D4DBFF] dark:bg-blue-900/30 p-8 rounded-[2.5rem] flex flex-col items-center text-center border-none shadow-xl shadow-blue-100/50 dark:shadow-none animate-in fade-in slide-in-from-left-4 duration-700">
              <div className="relative mb-6">
                 <img src={employee.photo || `https://ui-avatars.com/api/?name=${employee.fullName}&background=random`} className="w-24 h-24 rounded-[2rem] object-cover shadow-2xl border-4 border-white dark:border-gray-800" alt="" />
                 <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white dark:border-gray-800 rounded-full"></div>
              </div>
              <h2 className="text-lg font-black text-slate-800 dark:text-white leading-tight mb-2">{employee.fullName}</h2>
              <span className="px-4 py-1.5 bg-white/60 dark:bg-gray-800/60 rounded-full text-[10px] font-black text-primary uppercase tracking-wider">{employee.jobId?.jobName || '-'}</span>
           </div>

           <Card className="p-6 border-none shadow-sm space-y-6 animate-in fade-in slide-in-from-left-6 duration-700 delay-100">
              <InfoItem label={t('status')} value={t((employee.employeeStatus || 'Active').toLowerCase())} />
              <InfoItem label={t('join_date')} value={employee.joinDate} />
              <InfoItem label={t('email')} value={employee.email} />
           </Card>
        </div>

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
              <Card className="p-8 border-none shadow-sm">
                <div className="flex justify-between items-center mb-8 border-b border-gray-50 dark:border-gray-800 pb-4">
                  <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">{t('work_information')}</h3>
                  <Button size="sm" variant="outline" onClick={() => setIsEditModalOpen(true)} className="gap-2 text-primary border-primary bg-blue-50/50">
                    <Edit size={14} /> {t('edit_employee')}
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-8">
                  <InfoItem label={t('emp_code')} value={employee.employeeCode} />
                  <InfoItem label={t('full_name')} value={employee.fullName} />
                  <InfoItem label={t('nationality')} value={employee.nationality} />
                  <InfoItem label={t('birth_date')} value={employee.dob} />
                  <InfoItem label={t('gender')} value={t(employee.gender?.toLowerCase() || '')} />
                  <InfoItem label={t('marital_status')} value={t(employee.maritalStatus?.toLowerCase() || '')} />
                  <InfoItem label={t('phone')} value={employee.phone} />
                  <InfoItem label={t('address')} value={employee.address} />
                  <InfoItem label={t('company')} value={employee.companyId?.name} />
                  <InfoItem label={t('branch')} value={employee.branchId?.name} />
                  <InfoItem label={t('job_grade')} value={employee.jobGrade} />
                </div>
              </Card>

              <Card className="p-8 border-none shadow-sm">
                <div className="flex justify-between items-center mb-8 border-b border-gray-50 dark:border-gray-800 pb-4">
                   <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">{t('documents')}</h3>
                   <Button size="sm" className="bg-primary hover:bg-blue-700 gap-2" onClick={() => { setEditingDoc(null); setIsDocModalOpen(true); }}>
                      <Plus size={14} /> {t('add_documents')}
                   </Button>
                </div>
                
                {employeeDocs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                     <FileText size={40} className="mb-2 opacity-20" />
                     <p className="text-xs font-bold uppercase tracking-widest">No documents uploaded yet</p>
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

      <EmployeeModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        onSave={(updated) => updateEmployee(updated)} 
        employeeToEdit={employee} 
      />

      <DocumentModal 
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        onSave={handleDocSave}
        documentToEdit={editingDoc}
        fixedEmployeeId={employee.id}
      />

      <ConfirmationModal
        isOpen={!!deleteDocId}
        onClose={() => setDeleteDocId(null)}
        onConfirm={handleDeleteDocConfirm}
        title={t('confirm_delete')}
        message={t('are_you_sure_delete')}
      />
    </div>
  );
};
